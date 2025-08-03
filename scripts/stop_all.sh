#!/bin/bash
cd "$(dirname \"$(readlink -f \"$0\")\")/.."

# Ferma il bot
if pgrep -f "scripts/bot.py" > /dev/null; then
  pkill -f scripts/bot.py
  echo "✅ Bot fermato."
else
  echo "ℹ️  Il bot non era attivo."
fi

# Ferma la dashboard
if pgrep -f "dashboard/app.py" > /dev/null; then
  pkill -f dashboard/app.py
  echo "✅ Dashboard fermata."
else
  echo "ℹ️  La dashboard non era attiva."
fi

# Ferma la TUI se lanciata in background
if pgrep -f "src/instradatore_tui.py" > /dev/null; then
  pkill -f src/instradatore_tui.py
  echo "✅ TUI fermata."
else
  echo "ℹ️  La TUI non era attiva (o era già chiusa)."
fi

echo "Tutti i processi principali sono stati fermati." 