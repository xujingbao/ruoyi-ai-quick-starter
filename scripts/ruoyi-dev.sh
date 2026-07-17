#!/usr/bin/env bash
# RuoYi AI Quick Starter — local start/stop/status
# Usage: ./scripts/ruoyi-dev.sh {start|stop|restart|status} {agent|admin|web|all}
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="${ROOT}/.dev-run"
mkdir -p "${RUN_DIR}"

usage() {
  echo "Usage: $0 {start|stop|restart|status} {agent|admin|web|all}"
  exit 1
}

[[ $# -ge 2 ]] || usage
ACTION="$1"
SERVICE="$2"

pid_file() { echo "${RUN_DIR}/${1}.pid"; }
log_file() { echo "${RUN_DIR}/${1}.log"; }

is_running() {
  local f
  f="$(pid_file "$1")"
  [[ -f "$f" ]] && kill -0 "$(cat "$f")" 2>/dev/null
}

port_up() {
  lsof -tiTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

kill_port() {
  local pids
  pids="$(lsof -tiTCP:"$1" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 1
  fi
}

stop_one() {
  local name="$1" port="$2"
  local f
  f="$(pid_file "$name")"
  if is_running "$name"; then
    kill "$(cat "$f")" 2>/dev/null || true
    sleep 0.5
  fi
  rm -f "$f"
  kill_port "$port"
  echo "stopped ${name}"
}

wait_port() {
  local port="$1" name="$2" n="${3:-40}"
  local i
  for ((i = 1; i <= n; i++)); do
    if port_up "$port"; then
      echo "${name} :${port} UP"
      return 0
    fi
    sleep 0.5
  done
  echo "${name} :${port} not ready yet (see $(log_file "$name"))"
  return 1
}

start_agent() {
  if port_up 19090; then
    echo "agent already running"
    return 0
  fi
  stop_one agent 19090 >/dev/null || true
  cd "${ROOT}/ruoyi-ai-agent"
  if [[ ! -d node_modules ]]; then
    npm install
  fi
  # Detach from caller process group (Cursor shell would otherwise reap children).
  (
    cd "${ROOT}/ruoyi-ai-agent"
    exec env \
      AI_AGENT_HOST="${AI_AGENT_HOST:-127.0.0.1}" \
      AI_AGENT_PORT="${AI_AGENT_PORT:-19090}" \
      AI_AGENT_INTERNAL_TOKEN="${AI_AGENT_INTERNAL_TOKEN:-ruoyi-ai-agent-dev-token}" \
      AI_AGENT_TOOL_MODE="${AI_AGENT_TOOL_MODE:-business}" \
      AI_AGENT_GATEWAY_URL="${AI_AGENT_GATEWAY_URL:-http://127.0.0.1:8080}" \
      AI_API_BASE_URL="${AI_API_BASE_URL:-}" \
      AI_API_KEY="${AI_API_KEY:-}" \
      AI_MODEL="${AI_MODEL:-}" \
      node src/server.js
  ) >"$(log_file agent)" 2>&1 </dev/null &
  disown $! 2>/dev/null || true
  echo $! >"$(pid_file agent)"
  echo "started agent pid=$(cat "$(pid_file agent)") log=$(log_file agent)"
  wait_port 19090 agent 20 || true
}

start_admin() {
  if port_up 8080; then
    echo "admin already running"
    return 0
  fi
  stop_one admin 8080 >/dev/null || true
  (
    cd "${ROOT}"
    exec ./mvnw -s .mvn/maven-settings.xml spring-boot:run \
      -pl ruoyi-admin -Dspring-boot.run.profiles=dev
  ) >"$(log_file admin)" 2>&1 </dev/null &
  disown $! 2>/dev/null || true
  echo $! >"$(pid_file admin)"
  echo "started admin pid=$(cat "$(pid_file admin)") log=$(log_file admin)"
  wait_port 8080 admin 120 || true
}

start_web() {
  if port_up 80; then
    echo "web already running"
    return 0
  fi
  stop_one web 80 >/dev/null || true
  (
    cd "${ROOT}/ruoyi-react-web"
    exec ./node_modules/.bin/vite
  ) >"$(log_file web)" 2>&1 </dev/null &
  disown $! 2>/dev/null || true
  echo $! >"$(pid_file web)"
  echo "started web pid=$(cat "$(pid_file web)") log=$(log_file web)"
  wait_port 80 web 40 || true
}

status_one() {
  local name="$1" port="$2"
  local state="DOWN"
  if port_up "$port"; then
    state="UP"
  elif is_running "$name"; then
    state="STARTING"
  fi
  printf "%-6s port %-5s %s\n" "$name" "$port" "$state"
}

do_start() {
  case "$1" in
    agent) start_agent ;;
    admin) start_admin ;;
    web) start_web ;;
    all) start_admin; start_agent; start_web ;;
    *) usage ;;
  esac
}

do_stop() {
  case "$1" in
    agent) stop_one agent 19090 ;;
    admin) stop_one admin 8080 ;;
    web) stop_one web 80 ;;
    all) stop_one web 80; stop_one agent 19090; stop_one admin 8080 ;;
    *) usage ;;
  esac
}

do_status() {
  case "$1" in
    agent) status_one agent 19090 ;;
    admin) status_one admin 8080 ;;
    web) status_one web 80 ;;
    all)
      status_one admin 8080
      status_one agent 19090
      status_one web 80
      ;;
    *) usage ;;
  esac
}

case "$ACTION" in
  start) do_start "$SERVICE" ;;
  stop) do_stop "$SERVICE" ;;
  restart) do_stop "$SERVICE"; sleep 1; do_start "$SERVICE" ;;
  status) do_status "$SERVICE" ;;
  *) usage ;;
esac
