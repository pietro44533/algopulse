import os
import asyncio
import json
from telethon import TelegramClient, events
from datetime import datetime
import requests
import re
try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo

BASEDIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_FILE = os.path.join(BASEDIR, "src/config.json")
LOG_FILE = os.path.join(BASEDIR, "src/listener.log")
REGOLE_FILE = os.path.join(BASEDIR, "src/regole.json")

def log(msg):
    rome = ZoneInfo("Europe/Rome")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{datetime.now(rome).strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")

def carica_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def carica_regole():
    with open(REGOLE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def parse_message(text):
    data = {}
    # Header (es: 🕒 15 Lug • 19:00 — Palermo vs Ascoli)
    m = re.search(r'🕒\s*(.+)', text)
    if m:
        data['header'] = m.group(1).strip()
    # Strategia
    m = re.search(r'🎯 Strategia: (.+)', text)
    if m:
        data['strategia'] = m.group(1).strip()
    # Campionato
    m = re.search(r'🏆\s*(.+)', text)
    if m:
        data['campionato'] = m.group(1).strip()
    # Start
    m = re.search(r'📊 Start: (.+)', text)
    if m:
        data['start'] = m.group(1).strip()
    # Kickoff
    m = re.search(r'📊 Kickoff: (.+)', text)
    if m:
        data['kickoff'] = m.group(1).strip()
    # Indicatori 1
    m = re.search(r'🧮 (.+)', text)
    if m:
        for part in m.group(1).split('|'):
            if ':' in part:
                k, v = part.strip().split(':', 1)
                data[k.strip().lower()] = v.strip()
    # Indicatori 2
    m = re.search(r'🔹 (.+)', text)
    if m:
        for part in m.group(1).split('|'):
            if ':' in part:
                k, v = part.strip().split(':', 1)
                data[k.strip().lower()] = v.strip()
    # Link
    m = re.search(r'Stats live\s+(https?://\S+)', text)
    if m:
        data['link'] = m.group(1).strip()
    return data

config = carica_config()
if not config.get("bot_attivo", True):
    log("❌ BOT disattivato da config.json")
    exit()

client = TelegramClient("sessione", config["api_id"], config["api_hash"])

@client.on(events.NewMessage())
async def handler(event):
    mittente = str(event.chat_id)
    testo = event.raw_text or ""
    log(f"📥 Ricevuto da: {mittente} → {testo!r}")
    # Associa task in base alle regole
    task = None
    try:
        regole = carica_regole()
        for r in regole:
            if r.get("source") == mittente:
                filtro = r.get("filter", "").strip().lower()
                if not filtro or filtro in testo.lower():
                    task = r.get("task") or r.get("strategia")
                    break
    except Exception as e:
        log(f"[ERRORE] Lettura regole: {e}")
    # Parsing strutturato
    parsed = parse_message(testo)
    parsed['task'] = task
    now = datetime.now(ZoneInfo("Europe/Rome"))
    parsed['timestamp'] = now.isoformat()
    # Indicatori tecnici (dummy, puoi personalizzare)
    parsed['parser_ok'] = False
    parsed['api_ok'] = False
    parsed['trade_ok'] = False
    parsed['messaggio'] = testo
    print(parsed)
    try:
        requests.post(
            "http://localhost:5000/api/instradatore_task",
            json=parsed,
            timeout=2
        )
    except Exception as e:
        log(f"[ERRORE] Invio a dashboard fallito: {e}")

async def main():
    print("[INFO] Avvio bot...")
    try:
        log("🚀 BOT AVVIATO (SOLO ASCOLTO, SILENCE MODE)")
        await client.start()
        print("[INFO] Bot avviato e in ascolto.")
        await client.run_until_disconnected()
    except Exception as e:
        print(f"[ERRORE] Il bot ha riscontrato un problema: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
 
