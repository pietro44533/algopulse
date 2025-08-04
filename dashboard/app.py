from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
import json
import os

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "templates")
STATIC_PATH = os.path.join(os.path.dirname(__file__), "public")
app = Flask(__name__, template_folder=TEMPLATE_PATH, static_folder=STATIC_PATH)
app.secret_key = "6921fecbd2dd5f7e786ec2927afc89f233b67e9d390ceb86077bf27236c04d2b"

# Percorso assoluto al file config.json condiviso
CONFIG_PATH = os.path.join(os.path.dirname(__file__), '../src/config.json')

# Percorso assoluto al file regole.json condiviso con instradatore
REGOLE_PATH = os.path.join(os.path.dirname(__file__), '../src/tasks.json')

MESSAGGI_PATH = os.path.join(os.path.dirname(__file__), '../src/messaggi.json')

# 🔧 Utility: carica e salva file
def carica_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)

def carica_regole():
    try:
        with open(REGOLE_PATH) as f:
            data = json.load(f)
            print("DEBUG: regole caricate:", data)
            return data
    except Exception as e:
        print("DEBUG: errore caricamento regole:", e)
        return []

def salva_config(config):
    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f, indent=2)

def salva_regole(regole):
    with open(REGOLE_PATH, "w") as f:
        json.dump(regole, f, indent=2)

def normalizza_id(valore):
    valore = valore.strip()
    if not valore:
        return None
    if valore.startswith("@") and len(valore) > 4:
        return valore
    if valore.startswith("-100") and valore[4:].isdigit() and len(valore) >= 13:
        return valore
    if valore.isdigit() and len(valore) >= 9:
        return "-100" + valore
    return None

def salva_messaggio(msg):
    try:
        if os.path.exists(MESSAGGI_PATH):
            with open(MESSAGGI_PATH, 'r', encoding='utf-8') as f:
                arr = json.load(f)
        else:
            arr = []
        arr.append(msg)
        with open(MESSAGGI_PATH, 'w', encoding='utf-8') as f:
            json.dump(arr, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[ERRORE] Salvataggio messaggio: {e}")

def carica_messaggi():
    try:
        if os.path.exists(MESSAGGI_PATH):
            with open(MESSAGGI_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            return []
    except Exception as e:
        print(f"[ERRORE] Caricamento messaggi: {e}")
        return []

# 📊 Dashboard principale
@app.route("/")
def dashboard():
    config = carica_config()
    regole = carica_regole()
    print("DEBUG: regole passate al template:", regole)
    return render_template("dashboard.html", regole=regole, stato_bot=config.get("bot_attivo", True))

# 🔧 Route per file statici e PWA
@app.route("/site.webmanifest")
def manifest():
    return send_from_directory(os.path.dirname(__file__), "site.webmanifest")

@app.route("/service-worker.js")
def service_worker():
    return send_from_directory(os.path.dirname(__file__), "service-worker.js")

# Route per pagina di test
@app.route("/test")
def test_page():
    return send_from_directory(os.path.dirname(__file__), "test_connection.html")

# Route per file statici dalla cartella public
@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(STATIC_PATH, filename)

# 🔁 Attiva/Disattiva bot
@app.route("/toggle", methods=["POST"])
def toggle_bot():
    config = carica_config()
    config["bot_attivo"] = not config.get("bot_attivo", True)
    salva_config(config)
    return redirect(url_for("dashboard"))

# ➕ Aggiungi regola
@app.route("/aggiungi", methods=["POST"])
def aggiungi():
    regole = carica_regole()

    source_raw = request.form["source"]
    filter_raw = request.form.get("filter", "").strip()

    if not filter_raw:
        flash("⚠️ Il nome task è obbligatorio.")
        return redirect(url_for("dashboard"))

    # source può essere vuoto, verrà compilato dalla TUI
    source_id = normalizza_id(source_raw) if source_raw.strip() else None

    regola = {
        "filter": filter_raw,
        "attiva": "attiva" in request.form
    }
    if source_id:
        regola["source"] = source_id
        regola["source_name"] = request.form.get("source_name", "").strip()

    regole.append(regola)
    salva_regole(regole)
    flash("✅ Task aggiunta con successo.")
    return redirect(url_for("dashboard"))

# ✅ Attiva/Disattiva regola
@app.route("/toggle_attiva/<int:indice>", methods=["POST"])
def toggle_attiva(indice):
    regole = carica_regole()
    if 0 <= indice < len(regole):
        regole[indice]["attiva"] = not regole[indice].get("attiva", True)
        salva_regole(regole)
    return redirect(url_for("dashboard"))

# 🗑️ Elimina regola
@app.route("/elimina/<int:indice>", methods=["POST"])
def elimina(indice):
    regole = carica_regole()
    if 0 <= indice < len(regole):
        del regole[indice]
        salva_regole(regole)
    return redirect(url_for("dashboard"))

# ✏️ Modifica regola
@app.route("/modifica/<int:indice>", methods=["GET", "POST"])
def modifica(indice):
    regole = carica_regole()

    if indice >= len(regole) or indice < 0:
        return render_template("modifica.html", errore="Indice non valido", regola={}, indice=indice)

    if request.method == "POST":
        source_raw = request.form["source"]
        filter_val = request.form.get("filter", "").strip()
        if not filter_val:
            flash("⚠️ Il nome task è obbligatorio.")
            return redirect(url_for("dashboard"))
        source_id = normalizza_id(source_raw) if source_raw.strip() else None
        regola = {
            "filter": filter_val,
            "attiva": "attiva" in request.form
        }
        if source_id:
            regola["source"] = source_id
            regola["source_name"] = request.form.get("source_name", "").strip()
        regole[indice] = regola
        salva_regole(regole)
        flash("✅ Task modificata con successo")
        return redirect(url_for("dashboard"))

    return render_template("modifica.html", regola=regole[indice], indice=indice)
@app.route("/forward", methods=["POST"])
def ricevi_dal_bot():
    payload = request.get_json()

    if not payload:
        return "❌ Nessun dato ricevuto", 400

    print(f"📥 Messaggio inoltrato dal bot:")
    print(f"🟢 Canale: {payload.get('canale')}")
    print(f"🕓 Timestamp: {payload.get('timestamp')}")
    print(f"✉️ Testo: {payload.get('messaggio')}")

    return "✅ Ricevuto", 200

# NOTA: La dashboard può aggiungere task con solo il campo 'filter'.
# Successivamente la TUI (instradatore) completerà i campi 'source', 'target', ecc. nello stesso file regole.json.
# RIMUOVO O COMMENTO LE API DI AGGIUNTA E RIMOZIONE TASK
# @app.route("/api/aggiungi_task", methods=["POST"])
# def api_aggiungi_task():
#     data = request.get_json()
#     filter_val = data.get("filter", "").strip()
#     if not filter_val:
#         return jsonify({"ok": False, "error": "Nome task obbligatorio"}), 400
#     regole = carica_regole()
#     regole.append({"filter": filter_val, "attiva": True})
#     salva_regole(regole)
#     return jsonify({"ok": True})

# @app.route("/api/rimuovi_task", methods=["POST"])
# def api_rimuovi_task():
#     data = request.get_json()
#     filter_val = data.get("filter", "").strip().lower()
#     print("DEBUG: filter ricevuto:", repr(filter_val))
#     if not filter_val:
#         return jsonify({"ok": False, "error": "Nome task obbligatorio"}), 400
#     regole = carica_regole()
#     nuove_regole = []
#     for r in regole:
#         f = r.get("filter", "")
#         print("DEBUG: confronto con:", repr(f.strip().lower()))
#         # Non rimuovere regole con filter vuoto (regole speciali)
#         if not f.strip():
#             nuove_regole.append(r)
#             continue
#         if f.strip().lower() != filter_val:
#             nuove_regole.append(r)
#     print("DEBUG: regole rimaste:", nuove_regole)
#     salva_regole(nuove_regole)
#     return jsonify({"ok": True})

# 🗃️ Buffer messaggi instradatore (solo dashboard, non inoltra a Telegram)
# instradatore_buffer = [] # Rimosso, ora salvato su file

# Modifica endpoint POST per salvare su file
@app.route("/api/instradatore_task", methods=["POST"])
def instradatore_task():
    data = request.get_json()
    if not data or not data.get("messaggio"):
        return jsonify({"ok": False, "error": "Messaggio mancante"}), 400
    salva_messaggio({
        "messaggio": data["messaggio"],
        "timestamp": data.get("timestamp"),
        "task": data.get("task")
    })
    return jsonify({"ok": True})

# Modifica endpoint GET per leggere tutti i messaggi
@app.route("/api/instradatore_task", methods=["GET"])
def get_instradatore_task():
    messaggi = carica_messaggi()
    
    # Filtra solo i messaggi con task non null
    messaggi = [msg for msg in messaggi if msg.get("task") is not None]
    
    # Elimina definitivamente i messaggi con hideline === true
    messaggi = [msg for msg in messaggi if not msg.get("hideline", False)]
    
    return jsonify(messaggi)

# ▶️ Avvio server
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)

