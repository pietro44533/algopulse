🧩 Modulo / Funzione    📌 Stato / Note 🔐 Sicurezza
1   🖥️ Dashboard Cloud (Safari)    Visualizzazione + notifiche/suono + UX touch-friendly   ✅ SHA256 + password
2   📊 Visualizzazione Match Attivo + Quote Match in corso + strategia + quote + esito + stato parser/API   ✅ Frontend isolato + visibilità dashboard
3   ⚙️ Interfaccia TUI: Canali + Strategie  Gestione completa da terminale SSH: canali, strategie, instradamento    ✅ Accesso SSH con chiavi
4   🤖 Listener Telegram (passivo)  Ricezione e inoltro messaggi grezzi Telegram    ✅ Attivo
5   😶 Silence Mode Telegram    Logging invisibile dei messaggi Telegram    ❌ Non avviato
6   🔓 Accesso CLI via SSH  Terminale protetto con chiavi pubblica/privata  ✅ SSH
7   🔐 Protezione Accesso Dashboard Web Login via interfaccia con hashing SHA256    ✅ Solo Dashboard
8   🔍 Verifica Integrità Password  Password solo hash, mai salvata in chiaro (solo lato dashboard) ✅ SHA256
9   🧪 Parser + HTTP Match  Estrazione + verifica HTTP → chiama API BetAngel    🟨 Da rifinire
10  ⚡ Strategie Quick Add (.py) Inserimento rapido via TUI + validazione immediata  🟨 Da creare
11  🎛 Gestione Strategie via TUI   Attiva/sospendi singola o batch da terminale SSH    🟨 Da integrare
12  🔄 Cambio Password Web  Cambio solo via dashboard / API sicura  🟨 Da creare
13  🛡 Protezione File Config / Log Permessi su file critici → modifiche da TUI o dashboard 🟨 Da integrare
14  📁 .csv Strategico Runtime  File aggiornato 1x/die → tracciato con firma SHA    🟨 Da costruire
15  🧷 Wizard Creazione .baf    Generazione guidata via TUI → cashout, delay, VAR   🟨 Da creare
16  🌐 Deploy su Dominio Personalizzato Hosting su Render/Hetzner + HTTPS   ✅ Certificato SSL
17  📲 Notifiche Push iPhone via PWA    Solo da Safari iOS 16.4+ → installabile + service worker + manifest attivo  🟨 Da strutturare
18  💡 Modulo di Controllo Diagnostico  Stato parser/API/Trade → log visivo in dashboard    🟨 Da pianificare