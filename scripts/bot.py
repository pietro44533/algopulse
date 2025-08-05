import os
import asyncio
import json
import random
from telethon import TelegramClient, events
from datetime import datetime, timedelta
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
    
    # Header principale (🕒)
    m = re.search(r'🕒 (.+)', text)
    if m:
        data['header'] = m.group(1).strip()
    
    # Strategia (🎯)
    m = re.search(r'🎯 Strategia: (.+)', text)
    if m:
        data['strategia'] = m.group(1).strip()
    
    # Campionato (🏆)
    m = re.search(r'🏆 (.+)', text)
    if m:
        data['campionato'] = m.group(1).strip()
    
    # Partita (⚽)
    m = re.search(r'🎯 (.+)', text)
    if m and 'Strategia:' not in m.group(1):
        data['partita'] = m.group(1).strip()
    
    # Quote start (📊 Start:)
    m = re.search(r'📊 Start: (.+)', text)
    if m:
        quotes = m.group(1).strip().split('/')
        if len(quotes) >= 3:
            data['start_1'] = quotes[0].strip()
            data['start_x'] = quotes[1].strip()
            data['start_2'] = quotes[2].strip()
    
    # Quote kickoff (📊 Kickoff:)
    m = re.search(r'📊 Kickoff: (.+)', text)
    if m:
        quotes = m.group(1).strip().split('/')
        if len(quotes) >= 3:
            data['kickoff_1'] = quotes[0].strip()
            data['kickoff_x'] = quotes[1].strip()
            data['kickoff_2'] = quotes[2].strip()
    
    # Indicatori tecnici 1 (🧮)
    m = re.search(r'🧮 (.+)', text)
    if m:
        indicators = m.group(1).strip()
        for part in indicators.split('|'):
            if ':' in part:
                k, v = part.strip().split(':', 1)
                data[k.strip().lower()] = v.strip()
    
    # Indicatori tecnici 2 (🔹)
    m = re.search(r'🔹 (.+)', text)
    if m:
        indicators = m.group(1).strip()
        for part in indicators.split('|'):
            if ':' in part:
                k, v = part.strip().split(':', 1)
                data[k.strip().lower()] = v.strip()
    
    # Link
    m = re.search(r'Stats live\s+(https?://\S+)', text)
    if m:
        data['link'] = m.group(1).strip()
    
    # Determina se il parsing è riuscito
    data['parser_ok'] = bool(data.get('header') or data.get('strategia') or data.get('partita'))
    
    return data

async def processa_messaggio(mittente, testo):
    """Processa un singolo messaggio"""
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
    # Indicatori tecnici
    parsed['api_ok'] = True  # Simuliamo API OK
    parsed['trade_ok'] = False  # Trade non eseguita di default
    parsed['messaggio'] = testo
    
    print(f"✅ Messaggio processato: task={task}")
    
    try:
        requests.post(
            "http://localhost:5000/api/instradatore_task",
            json=parsed,
            timeout=2
        )
        log(f"✅ Messaggio inviato alla dashboard: task={task}")
    except Exception as e:
        log(f"[ERRORE] Invio a dashboard fallito: {e}")

def genera_delay_umano():
    """Genera delay casuali per simulare comportamento umano"""
    # Pattern variabili: 10-42 secondi
    return random.randint(10, 42)

def dovrebbe_fare_pausa():
    """Determina se fare una pausa basata su giorno e ora"""
    now = datetime.now(ZoneInfo("Europe/Rome"))
    
    # Solo Lun-Gio tra 9-11
    if now.weekday() < 4 and 9 <= now.hour < 11:
        # 30% probabilità di pausa in questo periodo
        return random.random() < 0.3
    return False

def genera_pause_giornaliere():
    """Genera numero di pause per oggi (0, 1, o 2)"""
    now = datetime.now(ZoneInfo("Europe/Rome"))
    
    # Solo Lun-Gio tra 9-11
    if now.weekday() < 4 and 9 <= now.hour < 11:
        # Distribuzione: 40% nessuna, 40% una, 20% due pause
        rand = random.random()
        if rand < 0.4:
            return 0
        elif rand < 0.8:
            return 1
        else:
            return 2
    return 0

async def polling_messaggi_umano(client):
    """Controlla nuovi messaggi con pattern umano"""
    
    # Timestamp dell'ultimo controllo per ogni canale
    ultimi_check = {}
    # Cache delle entities dei canali
    canali_entities = {}
    # Gestione pause
    pause_rimanenti = 0
    pause_inizio = None
    
    while True:
        try:
            # Gestione pause
            if pause_rimanenti > 0:
                if pause_inizio is None:
                    pause_inizio = datetime.now(ZoneInfo("Europe/Rome"))
                    log(f"⏸️ Pausa iniziata alle {pause_inizio.strftime('%H:%M:%S')}")
                
                # Controlla se la pausa è finita
                if (datetime.now(ZoneInfo("Europe/Rome")) - pause_inizio).seconds >= 300:  # 5 minuti
                    log(f"▶️ Pausa terminata dopo 5 minuti")
                    pause_rimanenti = 0
                    pause_inizio = None
                else:
                    # Ancora in pausa
                    await asyncio.sleep(30)  # Controlla ogni 30 secondi
                    continue
            
            # Controlla se iniziare una nuova pausa
            if pause_rimanenti == 0 and dovrebbe_fare_pausa():
                pause_rimanenti = 1
                continue
            
            regole = carica_regole()
            
            for regola in regole:
                canale_id = regola.get("source")
                if not canale_id:
                    continue
                
                try:
                    # Ottieni entity del canale se non l'abbiamo già
                    if canale_id not in canali_entities:
                        try:
                            # Prova prima con l'ID diretto
                            entity = await client.get_entity(int(canale_id))
                            canali_entities[canale_id] = entity
                        except:
                            # Se fallisce, cerca per nome
                            async for dialog in client.iter_dialogs():
                                if str(dialog.id) == canale_id:
                                    canali_entities[canale_id] = dialog.entity
                                    break
                            else:
                                log(f"❌ Canale {canale_id} non trovato")
                                continue
                    
                    entity = canali_entities[canale_id]
                    
                    # Primo avvio: inizializza timestamp 1 minuto fa
                    if canale_id not in ultimi_check:
                        ultimi_check[canale_id] = datetime.now(ZoneInfo("UTC")) - timedelta(minutes=1)
                    
                    # Controlla nuovi messaggi
                    nuovi_messaggi = []
                    async for msg in client.iter_messages(entity, limit=20):
                        if msg.date > ultimi_check[canale_id]:
                            nuovi_messaggi.append(msg)
                        else:
                            break
                    
                    # Processa messaggi dal più vecchio al più nuovo
                    nuovi_messaggi.reverse()
                    
                    for msg in nuovi_messaggi:
                        if msg.text:  # Solo messaggi testuali
                            await processa_messaggio(canale_id, msg.text)
                            ultimi_check[canale_id] = msg.date
                
                except Exception as e:
                    log(f"[ERRORE] Polling canale {canale_id}: {e}")
            
            # Delay umano casuale
            delay = genera_delay_umano()
            log(f"⏱️ Prossimo controllo tra {delay} secondi")
            await asyncio.sleep(delay)
            
        except Exception as e:
            log(f"[ERRORE] Polling generale: {e}")
            await asyncio.sleep(60)

async def main():
    config = carica_config()
    if not config.get("bot_attivo", True):
        log("❌ BOT disattivato da config.json")
        return

    client = TelegramClient("sessione", config["api_id"], config["api_hash"])
    
    try:
        log("🚀 BOT AVVIATO (MODALITÀ UMANA)")
        print("[INFO] Avvio bot...")
        await client.start()
        
        me = await client.get_me()
        print(f"[INFO] Bot connesso come: {me.first_name} {me.last_name}")
        log(f"📞 Connesso come: {me.first_name} {me.last_name}")
        
        regole = carica_regole()
        canali = [r.get('source') for r in regole if r.get('source')]
        print(f"[INFO] Canali monitorati: {canali}")
        log(f"📋 Canali monitorati: {canali}")
        
        print("[INFO] Bot in modalità umana - controlli variabili con pause naturali")
        
        # Avvia il polling umano
        await polling_messaggi_umano(client)
        
    except KeyboardInterrupt:
        print("\n[INFO] Bot fermato dall'utente")
        log("⛔ Bot fermato dall'utente")
    except Exception as e:
        print(f"[ERRORE] {e}")
        log(f"❌ Errore generale: {e}")
    finally:
        await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
 
