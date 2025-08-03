import json
import os

CANALI_FILE = "src/canali.json"
TASKS_FILE = os.path.join(os.path.dirname(__file__), "../src/tasks.json")
REGOLE_FILE = os.path.join(os.path.dirname(__file__), "../src/regole.json")
INSTRADATORE_FILE = "src/instradatore.json"

def carica_canali():
    if not os.path.exists(CANALI_FILE):
        return {}
    with open(CANALI_FILE, encoding="utf-8") as f:
        return json.load(f)

def salva_canali(canali):
    try:
        with open(CANALI_FILE, "w", encoding="utf-8") as f:
            json.dump(canali, f, indent=2, ensure_ascii=False)
        print("[OK] Canali salvati.")
    except Exception as e:
        print(f"[ERRORE] Impossibile salvare canali: {e}")

def carica_tasks():
    if not os.path.exists(TASKS_FILE):
        return []
    with open(TASKS_FILE, encoding="utf-8") as f:
        return json.load(f)

def carica_regole():
    if not os.path.exists(REGOLE_FILE):
        return []
    with open(REGOLE_FILE, encoding="utf-8") as f:
        return json.load(f)

def salva_regole(regole):
    try:
        with open(REGOLE_FILE, "w", encoding="utf-8") as f:
            json.dump(regole, f, indent=2, ensure_ascii=False)
        print(f"Regole salvate in: {os.path.abspath(REGOLE_FILE)}")
    except Exception as e:
        print(f"Errore nel salvataggio di {os.path.abspath(REGOLE_FILE)}: {e}")

def scegli_canale(canali):
    print("\nCanali disponibili:")
    canali_keys = list(canali.keys())
    for i, (cid, nome) in enumerate(canali.items()):
        print(f"  [{i+1}] {nome} ({cid})")
    idx = int(input("Scegli canale (numero): "))
    return canali_keys[idx-1]

def scegli_task(tasks):
    print("\nTask disponibili:")
    for i, t in enumerate(tasks):
        print(f"  [{i+1}] {t['filter']}")
    while True:
        try:
            idx = int(input("Scegli task (numero): ")) - 1
            if 0 <= idx < len(tasks):
                return tasks[idx]["filter"]
            else:
                print("Numero non valido.")
        except ValueError:
            print("Inserisci un numero valido.")

def aggiungi_regola(canali, tasks, regole):
    strategia = input("Inserisci il nome della strategia per la regola: ").strip()
    canale = scegli_canale(canali)
    filtro = input("Inserisci filtro (parola chiave, es: over 2.5): ").strip()
    task = scegli_task(tasks)
    regole.append({"strategia": strategia, "source": canale, "filter": filtro, "task": task})
    print("Regola aggiunta!\n")

def mostra_regole(canali, regole):
    print("\nRegole instradamento attuali:")
    for i, r in enumerate(regole):
        nome = canali.get(r["source"], r["source"])
        strat = r.get("strategia", "")
        print(f"  [{i+1}] strategia: '{strat}' | {nome} ({r['source']}) | filtro: '{r['filter']}' → task: {r['task']}")

def cancella_regola(regole):
    mostra_regole(carica_canali(), regole)
    idx = int(input("Numero regola da cancellare (0 per annullare): "))
    if idx > 0 and idx <= len(regole):
        regole.pop(idx-1)
        print("Regola cancellata!\n")

def normalizza_id_canale(valore):
    valore = valore.strip()
    if valore.startswith("-100") and valore[4:].isdigit() and len(valore) >= 13:
        return valore
    if valore.startswith("-100"):
        return valore  # Non aggiungere di nuovo il prefisso
    if valore.isdigit() and len(valore) >= 9:
        return "-100" + valore
    return valore

def aggiungi_canale(canali):
    nuovo = input("Inserisci nuovo ID o username canale: ").strip()
    print(f"ID canale : {nuovo}")  # Mostra il valore inserito dall'utente
    nuovo = normalizza_id_canale(nuovo)
    nome = input("Nome descrittivo per il canale: ").strip()
    if nuovo not in canali:
        canali[nuovo] = nome
        salva_canali(canali)
        print("Canale aggiunto!\n")
    else:
        print("Canale già presente.\n")

def cancella_canale(canali, regole):
    print("\nCanali disponibili:")
    canali_keys = list(canali.keys())
    for i, (cid, nome) in enumerate(canali.items()):
        print(f"  [{i+1}] {nome} ({cid})")
    idx = int(input("Numero canale da cancellare (0 per annullare): "))
    if idx > 0 and idx <= len(canali_keys):
        canale = canali_keys[idx-1]
        usato = any(r["source"] == canale for r in regole)
        if usato:
            print("❌ Impossibile cancellare: il canale è usato in almeno una regola.")
        else:
            del canali[canale]
            salva_canali(canali)
            print("Canale cancellato!\n")

def mostra_canali(canali):
    print("\nCanali attualmente inseriti:")
    for cid, nome in canali.items():
        print(f"- {nome} ({cid})")

def mostra_task(tasks):
    print("\nTask disponibili:")
    if not tasks:
        print("(Nessuna task trovata)")
    for i, t in enumerate(tasks):
        print(f"  [{i+1}] {t['filter']}")
    print("Le task possono essere modificate solo dalla dashboard web.")

def modifica_regola(canali, tasks, regole):
    if not regole:
        print("Nessuna regola da modificare.")
        return
    mostra_regole(canali, regole)
    try:
        idx = int(input("Numero regola da modificare (0 per annullare): ")) - 1
        if idx < 0 or idx >= len(regole):
            print("Operazione annullata.")
            return
    except ValueError:
        print("Input non valido.")
        return
    reg = regole[idx]
    # Modifica strategia
    nuova_strategia = input(f"Strategia [{reg['strategia']}]: ").strip()
    if nuova_strategia:
        reg['strategia'] = nuova_strategia
    # Modifica canale
    print("Canali disponibili:")
    canali_keys = list(canali.keys())
    for i, (cid, nome) in enumerate(canali.items()):
        print(f"  [{i+1}] {nome} ({cid})")
    canale_input = input(f"Canale [{reg['source']}]: ").strip()
    if canale_input:
        try:
            canale_idx = int(canale_input) - 1
            if 0 <= canale_idx < len(canali_keys):
                reg['source'] = canali_keys[canale_idx]
        except ValueError:
            if canale_input in canali:
                reg['source'] = canale_input
    # Modifica filtro
    nuovo_filtro = input(f"Filtro [{reg['filter']}]: ").strip()
    if nuovo_filtro != "":
        reg['filter'] = nuovo_filtro
    # Modifica task
    print("Task disponibili:")
    for i, t in enumerate(tasks):
        print(f"  [{i+1}] {t['filter']}")
    task_input = input(f"Task [{reg['task']}]: ").strip()
    if task_input:
        try:
            task_idx = int(task_input) - 1
            if 0 <= task_idx < len(tasks):
                reg['task'] = tasks[task_idx]['filter']
        except ValueError:
            for t in tasks:
                if t['filter'] == task_input:
                    reg['task'] = t['filter']
    print("Regola modificata!\n")

def menu_regole(canali, tasks, regole):
    while True:
        print("\n--- GESTIONE REGOLE ---")
        print("1. Visualizza regole")
        print("2. Aggiungi regola")
        print("3. Modifica regola")
        print("4. Cancella regola")
        print("5. Torna al menu principale")
        scelta = input("Scegli opzione: ").strip()
        if scelta == "1":
            mostra_regole(canali, regole)
        elif scelta == "2":
            aggiungi_regola(canali, tasks, regole)
        elif scelta == "3":
            modifica_regola(canali, tasks, regole)
        elif scelta == "4":
            cancella_regola(regole)
        elif scelta == "5":
            break
        else:
            print("Scelta non valida.")

def menu_canali(canali, regole):
    while True:
        print("\n--- GESTIONE CANALI ---")
        print("1. Visualizza canali")
        print("2. Aggiungi canale")
        print("3. Cancella canale")
        print("4. Torna al menu principale")
        scelta = input("Scegli opzione: ").strip()
        if scelta == "1":
            mostra_canali(canali)
        elif scelta == "2":
            aggiungi_canale(canali)
        elif scelta == "3":
            cancella_canale(canali, regole)
        elif scelta == "4":
            break
        else:
            print("Scelta non valida.")

def aggiungi_task(tasks):
    nome = input("Nome della nuova task: ").strip()
    if not nome:
        print("Nome task obbligatorio.")
        return
    if any(t['filter'] == nome for t in tasks):
        print("Task già presente.")
        return
    tasks.append({"filter": nome, "attiva": True})
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)
    print("Task aggiunta!\n")

def cancella_task(tasks):
    if not tasks:
        print("Nessuna task da cancellare.")
        return
    mostra_task(tasks)
    try:
        idx = int(input("Numero task da cancellare (0 per annullare): ")) - 1
        if idx < 0 or idx >= len(tasks):
            print("Operazione annullata.")
            return
    except ValueError:
        print("Input non valido.")
        return
    rimossa = tasks.pop(idx)
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)
    print(f"Task '{rimossa['filter']}' cancellata!\n")

# Sottomenu task aggiornato

def menu_task(tasks):
    while True:
        print("\n--- GESTIONE TASK ---")
        print("1. Visualizza task")
        print("2. Aggiungi task")
        print("3. Cancella task")
        print("4. Torna al menu principale")
        scelta = input("Scegli opzione: ").strip()
        if scelta == "1":
            mostra_task(tasks)
        elif scelta == "2":
            aggiungi_task(tasks)
        elif scelta == "3":
            cancella_task(tasks)
        elif scelta == "4":
            break
        else:
            print("Scelta non valida.")

def main():
    canali = carica_canali()
    tasks = carica_tasks()
    regole = carica_regole()
    while True:
        print("\n--- INSTRADATORE TUI ---")
        print("1. Gestisci regole")
        print("2. Gestisci canali")
        print("3. Gestisci task")
        print("4. Salva ed esci")
        scelta = input("Scegli opzione: ").strip()
        if scelta == "1":
            menu_regole(canali, tasks, regole)
        elif scelta == "2":
            menu_canali(canali, regole)
        elif scelta == "3":
            menu_task(tasks)
        elif scelta == "4":
            salva_regole(regole)
            print("Regole salvate in regole.json. Esco.")
            break
        else:
            print("Scelta non valida.")

if __name__ == "__main__":
    main() 