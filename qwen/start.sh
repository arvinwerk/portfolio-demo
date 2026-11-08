#!/bin/sh
set -eu

root=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
modelfile="$root/Modelfile"
bind="${OLLAMA_HOST:-127.0.0.1:11434}"
export OLLAMA_HOST=127.0.0.1:11434

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama ontbreekt. Installeer https://ollama.com/download en start dit script opnieuw." >&2
  exit 1
fi

started=0
if ! ollama list >/dev/null 2>&1; then
  OLLAMA_HOST="$bind" ollama serve &
  pid=$!
  started=1
  i=0
  until ollama list >/dev/null 2>&1; do
    i=$((i + 1))
    if [ "$i" -gt 150 ]; then
      echo "Ollama kwam niet op." >&2
      exit 1
    fi
    sleep 0.2
  done
fi

ollama create qwen -f "$modelfile"

if [ "$started" -eq 1 ]; then
  trap 'kill "$pid"' TERM INT
  wait "$pid"
fi
