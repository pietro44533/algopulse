#!/bin/bash

echo "🚀 AVVIO SISTEMA COMPLETO"
echo "=========================="

# Avvia bot in background
echo "🤖 Avvio bot Telegram..."
cd scripts
nohup python3 bot.py > bot_output.log 2>&1 &
BOT_PID=$!
echo $BOT_PID > bot.pid
echo "✅ Bot avviato (PID: $BOT_PID)"

# Avvia dashboard in background  
echo "🌐 Avvio dashboard..."
cd ../dashboard
nohup python3 app.py > dashboard_output.log 2>&1 &
DASH_PID=$!
echo $DASH_PID > dashboard.pid
echo "✅ Dashboard avviata (PID: $DASH_PID)"

cd ..
echo ""
echo "🎉 SISTEMA AVVIATO!"
echo "==================="
echo "🤖 Bot: Riceve messaggi dai canali configurati"
echo "🌐 Dashboard: http://46.62.163.10:5000"
echo "📊 TUI: python3 src/instradatore_tui.py"
echo ""
echo "🛑 Per fermare: ./scripts/stop_sistema.sh" 