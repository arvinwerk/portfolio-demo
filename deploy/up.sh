#!/usr/bin/env bash
# Build the image and start the site on this VPS.
#   cp .env.example .env
#   bash deploy/up.sh

set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
cd "${root}"

env_value() {
  local key="$1"
  local line value
  line=$(grep -E "^[[:space:]]*${key}=" .env | tail -n 1 || true)
  value="${line#*=}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  if [[ ${#value} -ge 2 && "${value}" == \"*\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ ${#value} -ge 2 && "${value}" == \'*\' ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s' "${value}"
}

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Er staat een nieuw .env. Vul AI_MODEL, AI_API_KEY en SITE_ADDRESS in, en draai dit script opnieuw." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is niet bereikbaar voor deze gebruiker. Draai sudo bash deploy/bootstrap-vps.sh en open daarna een nieuwe SSH-sessie, of start dit script met sudo." >&2
  exit 1
fi

for required in content/personal.json content/skills.json content/projects.json content/banners.json content/rag/profile.txt; do
  if [[ ! -f "${required}" ]]; then
    echo "Ontbreekt: ${required}" >&2
    exit 1
  fi
done

site=$(env_value SITE_ADDRESS)
if [[ "${site}" == *"://"* ]]; then
  echo "SITE_ADDRESS is een hostnaam of :80, zonder https://." >&2
  exit 1
fi

model=$(env_value AI_MODEL)
key=$(env_value AI_API_KEY)
if [[ -z "${model}" || "${model}" == "[REDACTED]" || -z "${key}" ]]; then
  echo "Let op: AI_MODEL of AI_API_KEY is nog niet ingevuld. De pagina start wel; de chat antwoordt dat ze gezet moeten worden."
fi

chmod -R a+rX content

docker compose up -d --build --remove-orphans
docker compose ps

if [[ -z "${site}" || "${site}" == ":80" ]]; then
  echo "HTTP staat open op poort 80 van deze VPS."
else
  first=${site%%,*}
  first=$(printf '%s' "${first}" | sed 's/[[:space:]]//g')
  echo "Zodra DNS naar deze VPS wijst: https://${first}/"
fi
echo "Certificaten blijven staan bij een volgende deploy. docker compose down -v verwijdert ze."
