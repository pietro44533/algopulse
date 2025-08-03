#!/bin/bash
# Trova la directory assoluta dello script, ovunque venga lanciato
SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}")"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_PATH")")"
cd "$PROJECT_ROOT"
source venv/bin/activate
echo "Virtualenv attivato! Ora sei nella root del progetto ( [1m$PROJECT_ROOT [0m). Digita 'exit' per uscire."
exec "$SHELL" 