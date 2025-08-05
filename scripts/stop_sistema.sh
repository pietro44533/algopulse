#!/bin/bash

echo "🛑 FERMATURA SISTEMA"
echo "===================="

# Ferma bot
if [ -f "scripts/bot.pid" ]; then
    BOT_PID=$(cat scripts/bot.pid)
    if ps -p $BOT_PID > /dev/null; then
        kill $BOT_PID
        echo "✅ Bot fermato (PID: $BOT_PID)"
    else
        echo "ℹ️  Bot già fermo"
    fi
    rm -f scripts/bot.pid
else
    # Cerca processi bot senza PID
    if pgrep -f "python.*bot.py" > /dev/null; then
        echo "🔍 Trovato processo bot senza PID, termino..."
        pkill -f "python.*bot.py" 2>/dev/null || true
        echo "✅ Processi bot terminati"
    else
        echo "ℹ️  Nessun processo bot trovato"
    fi
fi

# Ferma dashboard
if [ -f "dashboard/dashboard.pid" ]; then
    DASH_PID=$(cat dashboard/dashboard.pid)
    if ps -p $DASH_PID > /dev/null; then
        kill $DASH_PID
        echo "✅ Dashboard fermata (PID: $DASH_PID)"
    else
        echo "ℹ️  Dashboard già ferma"
    fi
    rm -f dashboard/dashboard.pid
else
    echo "ℹ️  File PID dashboard non trovato"
fi

# Pulizia finale
echo "🔍 Pulizia finale..."
pkill -f "python.*bot.py" 2>/dev/null || true
pkill -f "python.*app.py" 2>/dev/null || true
rm -f scripts/bot.pid dashboard/dashboard.pid 2>/dev/null || true

echo ""
echo "🎉 SISTEMA FERMATO!"
echo "===================" 