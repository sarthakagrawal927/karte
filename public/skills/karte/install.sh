#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${KARTE_BASE_URL:-https://karte.cc}"
SKILL_URL="${KARTE_SKILL_URL:-${BASE_URL}/skill.md}"
DEST="${KARTE_DIR:-${HOME}/.karte}"
SCRIPT_URL="${BASE_URL}/skills/karte/scripts/agent-card.sh"

mkdir -p "${DEST}"
curl -fsSL "${SKILL_URL}" -o "${DEST}/skill.md"
curl -fsSL "${SCRIPT_URL}" -o "${DEST}/agent-card.sh"
chmod 700 "${DEST}" 2>/dev/null || true
chmod 600 "${DEST}/skill.md" "${DEST}/agent-card.sh" 2>/dev/null || true

cat <<EOF
Karte agent skill installed.

  skill:   ${DEST}/skill.md
  helper:  ${DEST}/agent-card.sh

Read the skill before calling the API. Store API keys in ${DEST}/credentials (chmod 600).
EOF
