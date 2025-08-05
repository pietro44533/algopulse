#!/bin/bash

echo "📊 STATO SISTEMA"
echo "================"

# Controlla bot
echo "🤖 Bot Telegram:"
if [ -f "scripts/bot.pid" ]; then
    BOT_PID=$(cat scripts/bot.pid)
    if ps -p $BOT_PID > /dev/null; then
        echo "   ✅ Attivo (PID: $BOT_PID)"
    else
        echo "   ❌ File PID presente ma processo non trovato"
        rm -f scripts/bot.pid
    fi
else
    if pgrep -f "python.*bot.py" > /dev/null; then
        BOT_PID=$(pgrep -f "python.*bot.py")
        echo "   ⚠️  Processo trovato ma senza file PID ($BOT_PID)"
    else
        echo "   ❌ Non attivo"
    fi
fi

# Controlla dashboard
echo "🌐 Dashboard:"
if [ -f "dashboard/dashboard.pid" ]; then
    DASH_PID=$(cat dashboard/dashboard.pid)
    if ps -p $DASH_PID > /dev/null; then
        echo "   ✅ Attiva (PID: $DASH_PID)"
    else
        echo "   ❌ File PID presente ma processo non trovato"
    fi
else
    if pgrep -f "python3.*app.py" > /dev/null; then
        echo "   ⚠️  Processo trovato ma senza file PID"
    else
        echo "   ❌ Non attiva"
    fi
fi

# Controlla porte
echo "🔌 Porte:"
if lsof -i:5000 > /dev/null 2>&1; then
    echo "   ✅ Porta 5000: Occupata (Dashboard)"
else
    echo "   ❌ Porta 5000: Libera"
fi

# Controlla log recenti
echo "📝 Log recenti:"
if [ -f "src/listener.log" ]; then
    LAST_LOG=$(tail -1 src/listener.log 2>/dev/null)
    if [ -n "$LAST_LOG" ]; then
        echo "   📄 Ultimo log: $LAST_LOG"
    else
        echo "   ⚠️  Log vuoto"
    fi
else
    echo "   ❌ File log non trovato"
fi

echo ""
echo "🔗 URL Dashboard: http://46.62.163.10:5000" 