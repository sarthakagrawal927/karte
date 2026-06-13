#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${KARTE_BASE_URL:-https://karte.cc}"
CREDS="${KARTE_CREDENTIALS:-${HOME}/.karte/credentials}"

die() {
  echo "error: $*" >&2
  exit 1
}

need() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

api_key() {
  if [[ -n "${KARTE_API_KEY:-}" ]]; then
    printf '%s' "${KARTE_API_KEY}"
    return
  fi
  if [[ -f "${CREDS}" ]]; then
    tr -d ' \n\r\t' < "${CREDS}"
    return
  fi
  die "no API key found; set KARTE_API_KEY or run: $0 auth --email you@example.com --code 123456"
}

request_json() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  if [[ -n "${body}" ]]; then
    curl -fsS -X "${method}" "${BASE_URL}${path}" \
      -H "content-type: application/json" \
      -d "${body}"
  else
    curl -fsS -X "${method}" "${BASE_URL}${path}"
  fi
}

auth_json() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local key
  key="$(api_key)"
  if [[ -n "${body}" ]]; then
    curl -fsS -X "${method}" "${BASE_URL}${path}" \
      -H "authorization: Bearer ${key}" \
      -H "content-type: application/json" \
      -d "${body}"
  else
    curl -fsS -X "${method}" "${BASE_URL}${path}" \
      -H "authorization: Bearer ${key}"
  fi
}

cmd_auth() {
  local email="" code="" key_name="cli"
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --email) email="$2"; shift 2 ;;
      --code) code="$2"; shift 2 ;;
      --key-name) key_name="$2"; shift 2 ;;
      *) die "unknown arg: $1" ;;
    esac
  done
  [[ -n "${email}" && -n "${code}" ]] || die "usage: auth --email ops@example.com --code 123456 [--key-name cursor]"

  local resp api_key_value dest
  resp="$(request_json POST /api/auth/agent/verify-code "{\"email\":\"${email}\",\"code\":\"${code}\",\"keyName\":\"${key_name}\"}")"
  api_key_value="$(printf '%s' "${resp}" | jq -er '.apiKey')"
  dest="$(dirname "${CREDS}")"
  mkdir -p "${dest}"
  printf '%s' "${api_key_value}" > "${CREDS}"
  chmod 600 "${CREDS}" 2>/dev/null || true
  printf '%s\n' "${resp}" | jq '{apiKeyId, userId, email, keyName, docs_url, message}'
}

cmd_request_code() {
  local email=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --email) email="$2"; shift 2 ;;
      *) die "unknown arg: $1" ;;
    esac
  done
  [[ -n "${email}" ]] || die "usage: request-code --email ops@example.com"
  request_json POST /api/auth/agent/request-code "{\"email\":\"${email}\"}" | jq .
}

cmd_create() {
  local slug="" name="" purpose="" operator="" operator_url="" payload
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --slug) slug="$2"; shift 2 ;;
      --name) name="$2"; shift 2 ;;
      --purpose) purpose="$2"; shift 2 ;;
      --operator) operator="$2"; shift 2 ;;
      --operator-url) operator_url="$2"; shift 2 ;;
      *) die "unknown arg: $1" ;;
    esac
  done
  [[ -n "${slug}" && -n "${name}" ]] || die "usage: create --slug inventory-bot --name \"Inventory Bot\" [--purpose ...] [--operator ...] [--operator-url ...]"

  payload="$(jq -n \
    --arg slug "${slug}" \
    --arg displayName "${name}" \
    --arg agentPurpose "${purpose}" \
    --arg agentOperator "${operator}" \
    --arg agentOperatorUrl "${operator_url}" \
    '{
      slug: $slug,
      displayName: $displayName,
      chatEnabled: true
    }
    + (if $agentPurpose != "" then {agentPurpose: $agentPurpose, bio: $agentPurpose} else {} end)
    + (if $agentOperator != "" then {agentOperator: $agentOperator} else {} end)
    + (if $agentOperatorUrl != "" then {agentOperatorUrl: $agentOperatorUrl} else {} end)')"

  auth_json POST /api/v1/agents "${payload}" | jq .
}

cmd_publish() {
  local slug=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --slug) slug="$2"; shift 2 ;;
      *) die "unknown arg: $1" ;;
    esac
  done
  [[ -n "${slug}" ]] || die "usage: publish --slug inventory-bot"
  auth_json POST "/api/v1/agents/${slug}/publish" | jq .
}

cmd_list() {
  auth_json GET /api/v1/agents | jq .
}

usage() {
  cat <<EOF
Karte agent trust card helper

Usage:
  $0 request-code --email ops@example.com
  $0 auth --email ops@example.com --code 123456 [--key-name cursor]
  $0 create --slug inventory-bot --name "Inventory Bot" [--purpose ...] [--operator ...] [--operator-url ...]
  $0 publish --slug inventory-bot
  $0 list

Environment:
  KARTE_BASE_URL        default: https://karte.cc
  KARTE_API_KEY         bearer token override
  KARTE_CREDENTIALS     default: ~/.karte/credentials
EOF
}

main() {
  need curl
  need jq
  local cmd="${1:-}"
  shift || true
  case "${cmd}" in
    request-code) cmd_request_code "$@" ;;
    auth) cmd_auth "$@" ;;
    create) cmd_create "$@" ;;
    publish) cmd_publish "$@" ;;
    list) cmd_list "$@" ;;
    -h|--help|help|"") usage ;;
    *) die "unknown command: ${cmd}" ;;
  esac
}

main "$@"
