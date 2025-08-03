#!/bin/bash
cd "$(dirname "$(readlink -f "$0")")/.."
source ./venv/bin/activate
python3 scripts/bot.py