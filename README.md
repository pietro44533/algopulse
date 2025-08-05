# 🤖 Sistema di Monitoraggio Telegram

Sistema completo per ricevere e gestire segnali tecnici da canali Telegram configurati, con webapp PWA per iPhone.

## 🚀 Avvio Rapido

```bash
# Avvia tutto il sistema
./scripts/start_sistema.sh

# Controlla stato
./scripts/status_sistema.sh

# Ferma tutto
./scripts/stop_sistema.sh
```

## 📱 Accesso

- **📊 Dashboard Web**: http://46.62.163.10:5000 
- **📱 Webapp iPhone**: Aggiungi alla schermata home per esperienza PWA
- **🔧 TUI Gestione**: `python3 src/instradatore_tui.py`

## 📁 Struttura Progetto Completa

```
📦 algoplus/
├── 📁 scripts/                    # Script di gestione sistema
│   ├── 🤖 bot.py                  # Bot Telegram principale
│   ├── 🚀 start_sistema.sh        # Avvia bot + dashboard
│   ├── 🛑 stop_sistema.sh         # Ferma tutto il sistema
│   ├── 📊 status_sistema.sh       # Controlla stato componenti
│   ├── 🔑 sessione.session        # Sessione autenticazione Telegram
│   └── 📝 bot.pid                 # File PID processo bot
│
├── 📁 src/                        # Configurazioni e dati
│   ├── ⚙️ config.json             # API Telegram (api_id, api_hash)
│   ├── 📋 regole.json             # Mappatura canali → task
│   ├── 📞 canali.json             # ID canali → nomi descrittivi
│   ├── 💾 messaggi.json           # Messaggi ricevuti (database JSON)
│   ├── 📝 listener.log            # Log attività bot
│   ├── 🎯 tasks.json              # Definizione task disponibili
│   └── 🔧 instradatore_tui.py     # TUI per gestione regole/canali
│
├── 📁 dashboard/                  # Webapp Flask + PWA
│   ├── 🌐 app.py                  # Server Flask principale
│   ├── 📝 dashboard.pid           # File PID processo dashboard
│   ├── 📄 templates/              # Template HTML
│   │   └── 📱 dashboard.html      # Dashboard principale PWA
│   ├── 📁 public/                 # File statici PWA
│   │   ├── 🎨 css/dashboard.css   # Stili responsive
│   │   ├── ⚡ js/dashboard.js     # JavaScript PWA
│   │   ├── 🖼️ images/             # Icone PWA (192x192, 256x256, 512x512)
│   │   ├── 📱 site.webmanifest    # Manifest PWA per installazione
│   │   └── ⚙️ service-worker.js   # Service Worker per offline
│   ├── 📦 package.json            # Dipendenze Node.js (se usate)
│   └── 🔧 server.js               # Server Node.js alternativo
│
├── 📁 venv/                       # Virtual environment Python
├── 📖 README.md                   # Documentazione principale
├── 🚫 .gitignore                  # File da ignorare in Git
└── 📦 package.json                # Configurazione npm generale
```

## 🔧 Configurazione Dettagliata

### 1. 🔑 Telegram API Setup

Edita `src/config.json`:
```json
{
  "api_id": 26817902,
  "api_hash": "5ad6fb1d2ff6402c155141d3395f46fe",
  "bot_attivo": true,
  "forward_url": "http://localhost:5000/forward"
}
```

### 2. 📋 Configurazione Canali e Regole

Edita `src/regole.json`:
```json
[
  {
    "strategia": "goal ht",
    "source": "-1002619441044",
    "filter": "",
    "task": "goal ht"
  }
]
```

Edita `src/canali.json`:
```json
{
  "-1002619441044": "Nowtrade2",
  "-1001852431799": "NowTrade HT Goal Alert"
}
```

## 📱 PWA (Progressive Web App)

### Caratteristiche PWA
- ✅ **Installabile su iPhone**: Aggiungi alla schermata home
- ✅ **Offline Ready**: Service Worker per cache
- ✅ **Responsive**: Ottimizzato per mobile
- ✅ **Native Feel**: Schermo intero, no browser bar
- ✅ **Push Notifications**: (se implementate)

### File PWA Essenziali
- `dashboard/public/site.webmanifest` - Configurazione app
- `dashboard/public/service-worker.js` - Cache offline
- `dashboard/public/images/` - Icone multiple dimensioni
- `dashboard/templates/dashboard.html` - Meta tag iOS

## 📊 Monitoraggio e Logs

```bash
# 📝 Log bot in tempo reale
tail -f src/listener.log

# 💾 Messaggi salvati
cat src/messaggi.json | jq .

# 📊 Stato completo sistema
./scripts/status_sistema.sh

# 🔄 Restart componenti
./scripts/stop_sistema.sh && ./scripts/start_sistema.sh
```

## 🔍 Troubleshooting

### 🤖 Bot non riceve messaggi
1. Verifica stato: `./scripts/status_sistema.sh`
2. Controlla log: `tail -f src/listener.log`  
3. Riautentica se necessario (elimina `scripts/sessione.session`)
4. Verifica ID canale in `src/regole.json`

### 📱 PWA non si installa su iPhone
1. Apri Safari su `http://46.62.163.10:5000`
2. Tocca pulsante "Condividi" 
3. Seleziona "Aggiungi alla schermata Home"
4. Verifica icone in `dashboard/public/images/`

### 🌐 Dashboard non accessibile
1. Controlla porta: `lsof -i:5000`
2. Log dashboard: `tail dashboard/dashboard_output.log`
3. Permessi file: `chown algoplus:algoplus src/messaggi.json`

### 🔑 Riautenticazione Telegram
Elimina sessione e riavvia:
```bash
rm scripts/sessione.session
./scripts/start_sistema.sh
# Inserisci: telefono, codice, password
```

## 🛠️ Comandi di Manutenzione

```bash
# 🧹 Pulizia log
> src/listener.log

# 💾 Backup messaggi
cp src/messaggi.json backup_messaggi_$(date +%Y%m%d).json

# 🔄 Reset messaggi
echo "[]" > src/messaggi.json

# 📋 Verifica regole
python3 -c "import json; print(json.load(open('src/regole.json')))"
``` 