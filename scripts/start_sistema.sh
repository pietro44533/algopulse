#!/bin/bash

echo "🚀 AVVIO SISTEMA COMPLETO (PERSISTENTE)"
echo "========================================"

# Avvia bot in background persistente
echo "🤖 Avvio bot Telegram (persistente)..."
nohup python3 bot.py > bot_output.log 2>&1 &
BOT_PID=$!
echo $BOT_PID > bot.pid
echo "✅ Bot avviato (PID: $BOT_PID) - Persistente"

# Avvia dashboard in background persistente
echo "🌐 Avvio dashboard (persistente)..."
cd ../dashboard
nohup python3 app.py > dashboard_output.log 2>&1 &
DASH_PID=$!
echo $DASH_PID > dashboard.pid
echo "✅ Dashboard avviata (PID: $DASH_PID) - Persistente"

cd ..

# Avvia monitor persistente in background
echo "🔄 Avvio monitor persistente..."
nohup ./monitor_persistente.sh > monitor.log 2>&1 &
MONITOR_PID=$!
echo $MONITOR_PID > monitor.pid
echo "✅ Monitor persistente avviato (PID: $MONITOR_PID)"

# Sistema semplificato: solo monitor persistente
echo "🔄 Sistema semplificato: monitor persistente attivo"

echo ""
echo "🎉 SISTEMA AVVIATO E PERSISTENTE!"
echo "=================================="
echo "🤖 Bot: Riceve messaggi dai canali configurati"
echo "🌐 Dashboard: http://46.62.163.10:5000"
echo "📊 TUI: python3 src/instradatore_tui.py"
echo "🔄 Monitor: Controlla ogni 30 secondi"
echo ""
echo "💡 Il sistema continuerà a girare anche se:"
echo "   - Chiudi il terminale"
echo "   - Ti scolleghi da SSH"
echo "   - Riavvii la sessione"
echo "   - I processi si fermano (auto-restart)"
echo ""
echo "🛑 Per fermare: ./scripts/stop_sistema.sh"
echo "📊 Per controllare stato: ./scripts/status_sistema.sh"
echo "📝 Log monitor: tail -f monitor.log" 