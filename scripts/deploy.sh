#!/usr/bin/env bash
#
# scripts/deploy.sh
# -----------------
# Wrapper script to build and start the application stack with Docker Compose,
# then tail the logs for real‑time feedback.
#
# Requirements:
#   * Docker Engine >= 20.10
#   * Docker Compose (v2) available as `docker compose`
#
# Behaviour:
#   1. Abort on any error (`set -euo pipefail`).
#   2. Verify that Docker and Docker Compose are installed.
#   3. Run `docker compose up -d --build` to (re)build images and start containers.
#   4. Print a friendly URL where the app is reachable.
#   5. Tail the logs of all services (`docker compose logs -f`).
#
# Usage:
#   ./scripts/deploy.sh          # start services and follow logs
#   ./scripts/deploy.sh --no-log # start services without tailing logs
#
# Exit codes:
#   0 – success
#   1 – missing prerequisites
#   2 – Docker Compose command failed

set -euo pipefail   # abort on error, treat unset variables as errors, fail pipelines

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

log() {
    local level="$1"
    shift
    printf "[%s] %s\n" "$level" "$*"
}

error_exit() {
    log "ERROR" "$*"
    exit "${2:-1}"
}

check_prerequisite() {
    local cmd="$1"
    local name="${2:-$cmd}"
    if ! command -v "$cmd" >/dev/null 2>&1; then
        error_exit "$name is not installed or not in PATH."
    fi
}

print_usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Options:
  --no-log      Start the stack but do not tail logs.
  -h, --help    Show this help message and exit.
EOF
    exit 0
}

# ---------------------------------------------------------------------------
# Main script
# ---------------------------------------------------------------------------

# Parse arguments
TAIL_LOGS=true
while (( "$#" )); do
    case "$1" in
        --no-log) TAIL_LOGS=false ;;
        -h|--help) print_usage ;;
        *) error_exit "Unknown option: $1" 2 ;;
    esac
    shift
done

# Verify required commands
check_prerequisite docker "Docker Engine"
check_prerequisite docker-compose "Docker Compose (v2)" || true   # fallback for older installations

# Ensure Docker daemon is reachable
if ! docker info >/dev/null 2>&1; then
    error_exit "Docker daemon does not appear to be running."
fi

# Build and start the services
log "INFO" "Building images and starting containers..."
docker compose up -d --build

log "INFO" "Application started on http://localhost:5000"

# Tail logs unless explicitly disabled
if $TAIL_LOGS; then
    log "INFO" "Tailing logs (press Ctrl+C to exit)..."
    docker compose logs -f
else
    log "INFO" "Log tailing disabled. Use 'docker compose logs -f' to view logs later."
fi