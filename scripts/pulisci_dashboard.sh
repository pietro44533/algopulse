#!/bin/bash
cd "$(dirname "$(readlink -f "$0")")/.."
FILE="src/messaggi.json"

if test -f "$FILE"; then
  > "$FILE"
  echo "✅ Messaggi della dashboard eliminati. La dashboard ora è pulita."
else
  echo "⚠️  File $FILE non trovato. Nessun messaggio da eliminare."
fi