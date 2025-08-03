# Come avviare e fermare i componenti principali

## 1. Attiva l'ambiente virtuale

### Metodo consigliato: alias globale

Aggiungi questa riga al tuo `.bashrc` (solo la prima volta):

```bash
echo "alias attiva_venv='/home/pietro2/Documents/algoplus/scripts/attiva_venv.sh'" >> ~/.bashrc
source ~/.bashrc
```

Dopo, per attivare il virtualenv **usa sempre**:

```bash
attiva_venv
```

Questo comando funziona ovunque e apre una shell con il virtualenv attivo nella root del progetto.

---

## 2. Avviare i componenti

### Bot
```bash
./scripts/start_bot.sh
```
Avvia il bot principale del progetto.

### Dashboard
```bash
./scripts/start_dashboard.sh
```
La dashboard sarà disponibile su [http://localhost:5000](http://localhost:5000)

### TUI (configuratore instradamento)
```bash
./scripts/start_tui.sh
```

---

## 3. Fermare tutti i componenti
```bash
./scripts/stop_all.sh
```

---

## 4. Pulire i messaggi della dashboard
```bash
./scripts/pulisci_dashboard.sh
```

---

> Tutti gli script possono essere lanciati da qualsiasi posizione: cambiano automaticamente nella cartella corretta.
> Se uno script non parte, assicurati di aver attivato l'ambiente virtuale e di avere i permessi di esecuzione (`chmod +x scripts/nome_script.sh`). 