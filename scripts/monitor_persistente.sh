#!/bin/bash

echo "🔄 MONITOR PERSISTENTE ATTIVATO"
echo "================================"
echo "💡 Il sistema sarà monitorato 24/7"
echo "🔄 Auto-restart automatico se i processi si fermano"
echo ""

# Funzione per controllare e riavviare bot
check_and_restart_bot() {
    # Controlla se il bot è attivo
    if [ -f "bot.pid" ]; then
        BOT_PID=$(cat bot.pid)
        if ! ps -p $BOT_PID > /dev/null; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Bot fermato, riavvio..."
            cd scripts
            nohup python3 bot.py > bot_output.log 2>&1 &
            NEW_BOT_PID=$!
            echo $NEW_BOT_PID > bot.pid
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Bot riavviato (PID: $NEW_BOT_PID)"
            cd ..
        fi
    else
        # Se non c'è file PID, controlla se c'è un processo bot attivo
        if ! pgrep -f "python.*bot.py" > /dev/null; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Bot non trovato, riavvio..."
            cd scripts
            nohup python3 bot.py > bot_output.log 2>&1 &
            NEW_BOT_PID=$!
            echo $NEW_BOT_PID > bot.pid
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Bot riavviato (PID: $NEW_BOT_PID)"
            cd ..
        fi
    fi
}

# Funzione per controllare e riavviare dashboard
check_and_restart_dashboard() {
    # Controlla se la dashboard è attiva
    if [ -f "dashboard.pid" ]; then
        DASH_PID=$(cat dashboard.pid)
        if ! ps -p $DASH_PID > /dev/null; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Dashboard fermata, riavvio..."
            cd dashboard
            nohup python3 app.py > dashboard_output.log 2>&1 &
            NEW_DASH_PID=$!
            echo $NEW_DASH_PID > ../scripts/dashboard.pid
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Dashboard riavviata (PID: $NEW_DASH_PID)"
            cd ..
        fi
    else
        # Se non c'è file PID, controlla se c'è un processo dashboard attivo
        if ! pgrep -f "python.*app.py" > /dev/null; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Dashboard non trovata, riavvio..."
            cd dashboard
            nohup python3 app.py > dashboard_output.log 2>&1 &
            NEW_DASH_PID=$!
            echo $NEW_DASH_PID > ../scripts/dashboard.pid
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Dashboard riavviata (PID: $NEW_DASH_PID)"
            cd ..
        fi
    fi
}

# Loop infinito di monitoraggio
while true; do
    check_and_restart_bot
    check_and_restart_dashboard
    
    # Controlla ogni 30 secondi
    sleep 30
done 