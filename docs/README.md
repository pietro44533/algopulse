# Dashboard Segnale Tecnico

## 🚀 Come avviare la dashboard

1. **Installa le dipendenze Python:**
   ```bash
   pip install flask
   ```

2. **Avvia il server:**
   ```bash
   cd dashboard
   python app.py
   ```

3. **Apri nel browser:**
   - Vai su `http://localhost:5000`
   - La dashboard si aprirà automaticamente

## 📱 Installazione come App su iPhone

### Metodo 1: Safari
1. Apri Safari su iPhone
2. Vai su `http://localhost:5000` (o l'IP del tuo server)
3. Tocca l'icona di condivisione (quadrato con freccia)
4. Seleziona "Aggiungi alla schermata Home"
5. Tocca "Aggiungi"

### Metodo 2: Chrome
1. Apri Chrome su iPhone
2. Vai su `http://localhost:5000`
3. Tocca i tre puntini in alto a destra
4. Seleziona "Aggiungi alla schermata Home"
5. Tocca "Aggiungi"

## 🎨 Funzionalità

- **Interfaccia moderna** con design responsive
- **Notifiche push** per nuovi segnali
- **Filtri per task** con pillole interattive
- **Aggiornamenti in tempo reale** ogni 2 secondi
- **Supporto PWA** completo per iPhone

## 🔧 Configurazione

### Icone
Sostituisci i file placeholder nelle cartelle `public/images/` con le tue icone:
- `icon_192x192.png` (192x192 pixel)
- `icon_256x256.png` (256x256 pixel)
- `icon_512x512.png` (512x512 pixel)

### Personalizzazione
- Modifica `public/css/dashboard.css` per cambiare i colori
- Modifica `public/js/dashboard.js` per aggiungere funzionalità
- Modifica `templates/dashboard.html` per cambiare la struttura

## 📊 API Endpoints

- `GET /` - Dashboard principale
- `GET /api/instradatore_task` - Messaggi in tempo reale
- `POST /toggle` - Attiva/disattiva bot
- `POST /aggiungi` - Aggiungi nuova regola

## 🛠️ Risoluzione problemi

### La dashboard mostra codice invece dell'interfaccia
1. Verifica che i file CSS e JS siano nella cartella `public/`
2. Controlla che il server Flask sia configurato correttamente
3. Verifica i permessi dei file

### Le notifiche non funzionano
1. Assicurati di aver dato i permessi nel browser
2. Verifica che il service worker sia registrato
3. Controlla la console per errori JavaScript

### L'app non si installa su iPhone
1. Verifica che il manifest sia accessibile
2. Controlla che le icone siano presenti
3. Assicurati di usare HTTPS in produzione

## 🔒 Sicurezza

- Il server include middleware di sicurezza
- Rate limiting attivo
- CORS configurato correttamente
- Helmet per protezione header HTTP

## 📝 Note

- La dashboard è ottimizzata per iPhone
- Supporta la modalità standalone (senza browser)
- Include animazioni e transizioni fluide
- Compatibile con Safari e Chrome 