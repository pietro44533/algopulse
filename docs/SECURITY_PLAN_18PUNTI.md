# SECURITY PLAN — 18 PUNTI (SEMPLIFICATO)

| # | Funzione | Descrizione sintetica | Stato | Autenticazione/Integrità |
|----|----|----|----|----|
| 1 | Dashboard Cloud (protetta) | Visualizzazione strategica → match, quote, verify, log | 🟨 Da strutturare | Solo password |
| 2 | Gestione Canali Interni Dashboard | Aggiunta/rimozione dinamica canali | 🟨 Da progettare | |
| 3 | Listener Telegram (passivo) | Ricezione e inoltro messaggi grezzi Telegram | ✅ Attivo | |
| 4 | Silence Mode Telegram | Logging invisibile dei messaggi Telegram | ❌ Non avviato | |
| 5 | Configuratore Canali, Filtri e Instradamento CLI | Permette di aggiungere, modificare o rimuovere canali di origine e destinazione, configurare filtri e regole di instradamento per inoltrare i messaggi a specifici sottocanali della dashboard cloud tramite interfaccia da terminale (incluso lo smistamento eventi verso la dashboard cloud) | 🟨 Da creare | Solo password |
| 6 | Login con Password | Accesso CLI con password hashata, senza OTP | 🟨 Da integrare | Solo password (hash, integrità) |
| 7 | Protezione accesso dashboard | Login con username e password per accedere alla dashboard web | 🟨 Da integrare | Password (hash, integrità) |
| 8 | Verifica integrità password | Controllo che la password non sia in chiaro, solo hash | 🟨 Da integrare | SHA256 password |
| 9 | Parser evento + chiamata HTTP | Estrae dati dal messaggio della dashboard, confronta i dati chiamando via HTTP l’URL contenuto nel messaggio; solo se il risultato è positivo comunica l’evento a una API REST esterna (BetAngel), ma rimane in attesa senza piazzare scommesse. È previsto un file baf già associato a quella strategia | 🟨 Da rifinire | |
| 10 | strategie_quickadd.py | Inserimento rapido strategie da terminale + validazione | 🟨 Da creare | |
| 11 | Gestione strategie attive/sospese | Permette di visualizzare tutte le strategie attive, sospendere o riattivare singolarmente ciascuna strategia, oppure sospendere/riattivare tutte le strategie contemporaneamente tramite comando da terminale o dashboard | 🟨 Da integrare | |
| 12 | Gestione Credenziali Operatore | Cambio sicuro password via CLI → verifica vecchia password + nuovo hash | 🟨 Da creare | Solo password (hash) |
| 13 | Protezione file di configurazione e log | Tutti i file di configurazione (strategie, canali, credenziali, log) sono modificabili solo tramite interfacce protette da password; i permessi di accesso ai file sono limitati all’utente autorizzato | 🟨 Da integrare | Solo password, permessi file |
| 14 | File `.csv` strategico runtime, aggiornato costantemente (un file per giorno, salvato automaticamente in una cartella) | Log strategico con firma SHA, tracciato in 17 step | 🟨 Da costruire | |
| 15 | Script creazione file .baf per BetAngel | Script da terminale che guida l’utente nella creazione di file .baf per strategie BetAngel: permette di configurare step multipli (ognuno con quota minima opzionale), aggiungere step successivi su richiesta (S/N) e, in caso di nessun altro step, richiedere se aggiungere una condizione di cashout (S/N). È possibile configurare un delay (in secondi, es. 30) dopo la riapertura del mercato prima di eseguire il cashout, per mitigare i rischi legati a eventi come il VAR. Il file .baf può essere creato in qualsiasi momento e caricato manualmente su BetAngel; la strategia verrà eseguita solo quando arriva la chiamata API dal sistema. | 🟨 Da creare | |
| 16 | Pubblicazione dashboard su dominio personalizzato | La dashboard sarà pubblicata su un dominio dedicato (Render, Hetzner, ecc.) con configurazione HTTPS consigliata per la sicurezza, solo dopo il completamento e il test locale | 🟨 Da configurare | Certificato SSL/HTTPS |

---
 
## Note

* Nessuna cifratura avanzata prevista in questa versione.
* La sola verifica di integrità riguarda la password (hash SHA256, mai in chiaro).
* Tutte le altre funzioni sono protette solo da login con password.
* Aggiorna lo stato dei punti man mano che procedi con lo sviluppo.

**Oppure come nota finale:**
> La dashboard sarà pubblicata su dominio personalizzato solo dopo il completamento e il test locale. Si raccomanda la configurazione di HTTPS.

---

**In sintesi:**  
- Sviluppa e testa tutto in locale.
- Quando sei sicuro che tutto funziona, configuri il dominio e la pubblicazione.

Se vuoi, posso aggiungere questo punto in fondo al Security Plan! Vuoi che lo faccia?

---

### 1. **HTML**  
Inserisci questo blocco sopra la lista delle strategie/canali (pillole):

```html
<button class="add-channel-btn" onclick="showAddChannelForm()">+ Aggiungi Canale</button>
<form class="add-channel-form" id="addChannelForm" onsubmit="addChannel(event)">
    <input type="text" id="newChannelName" placeholder="Nome canale/task" required />
    <button type="submit">Aggiungi</button>
    <button type="button" onclick="hideAddChannelForm()">Annulla</button>
</form>
<div class="notifications" id="channelsList">
    <!-- Le pillole esistenti vanno qui -->
    <span class="notif" onclick="selectStrategy(this)">
        Goal HT
        <button class="bell active" type="button" onclick="event.stopPropagation(); toggleBell(this)">🔔</button>
        <button class="remove-btn" type="button" onclick="event.stopPropagation(); removeChannel(this)">✖</button>
    </span>
    <!-- ...altre pillole... -->
</div>
```

---

### 2. **CSS**  
Aggiungi queste regole (puoi inserirle nel tuo file CSS):

```css
.add-channel-btn {
    background: #1976d2;
    color: #fff;
    border: none;
    border-radius: 16px;
    padding: 7px 18px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 12px;
    margin-right: 10px;
    transition: background 0.2s;
}
.add-channel-btn:hover {
    background: #1565c0;
}
.add-channel-form {
    display: none;
    margin-bottom: 12px;
}
.add-channel-form input {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid #bbb;
    font-size: 1rem;
    margin-right: 8px;
}
.add-channel-form button {
    background: #43a047;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 1rem;
    cursor: pointer;
}
.remove-btn {
    background: none;
    border: none;
    color: #b71c1c;
    font-size: 1.1em;
    margin-left: 6px;
    cursor: pointer;
}
```

---

### 3. **JavaScript**  
Aggiungi questo script in fondo al file HTML (prima di `</body>`):

```html
<script>
function showAddChannelForm() {
    document.querySelector('.add-channel-form').style.display = 'block';
    document.querySelector('.add-channel-btn').style.display = 'none';
    document.getElementById('newChannelName').focus();
}
function hideAddChannelForm() {
    document.querySelector('.add-channel-form').style.display = 'none';
    document.querySelector('.add-channel-btn').style.display = 'inline-block';
}
function addChannel(event) {
    event.preventDefault();
    const name = document.getElementById('newChannelName').value.trim();
    if (!name) return;
    const notif = document.createElement('span');
    notif.className = 'notif';
    notif.setAttribute('onclick', 'selectStrategy(this)');
    notif.innerHTML = `${name}
        <button class="bell active" type="button" onclick="event.stopPropagation(); toggleBell(this)">🔔</button>
        <button class="remove-btn" type="button" onclick="event.stopPropagation(); removeChannel(this)">✖</button>`;
    document.getElementById('channelsList').appendChild(notif);
    document.getElementById('newChannelName').value = '';
    hideAddChannelForm();
}
function removeChannel(btn) {
    btn.parentElement.remove();
}
function toggleBell(el) {
    el.classList.toggle('active');
    el.textContent = el.classList.contains('active') ? '🔔' : '🔕';
}
function selectStrategy(el) {
    document.querySelectorAll('.notif').forEach(n => n.classList.remove('selected'));
    el.classList.add('selected');
}
</script>
```

---

**Risultato:**  
- Tasto blu “+ Aggiungi Canale” in alto.
- Form per inserire il nome della nuova task/canale.
- Pillole azzurre con nome, campanella e X, tutte gestibili dinamicamente.

Se vuoi anche la versione con salvataggio su backend o altre personalizzazioni, chiedi pure!


