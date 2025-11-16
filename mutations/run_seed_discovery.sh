#!/bin/bash
#
# Automated Jailbreak Seed Discovery Runner
# This script is designed to be run via cron for periodic discovery
#

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs/seed_discovery"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create log directory
mkdir -p "$LOG_DIR"

# Log file for this run
LOG_FILE="$LOG_DIR/discovery_${TIMESTAMP}.log"

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "Jailbreak Seed Discovery - Starting"
log "=========================================="

# Check if virtual environment exists
if [ ! -d "$PROJECT_DIR/venv" ]; then
    log "Virtual environment not found. Creating..."
    python3 -m venv "$PROJECT_DIR/venv"
fi

# Activate virtual environment
source "$PROJECT_DIR/venv/bin/activate"

# Install/update dependencies
log "Checking dependencies..."
pip install -q -r "$PROJECT_DIR/requirements.txt" >> "$LOG_FILE" 2>&1

# Check for required environment variables
if [ -z "$VALYU_API_KEY" ]; then
    log "ERROR: VALYU_API_KEY not set in environment"
    exit 1
fi

# Run the discovery script
log "Running seed discovery..."
cd "$SCRIPT_DIR"

python3 jailbreak_seed_discovery.py >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    log "Discovery completed successfully!"

    # Count new seeds
    SEED_COUNT=$(find "$SCRIPT_DIR/discovered_seeds" -name "seeds_*.json" -newer "$LOG_FILE" -exec jq '. | length' {} \; 2>/dev/null | head -1)

    if [ ! -z "$SEED_COUNT" ]; then
        log "Generated $SEED_COUNT new seed prompts"
    fi
else
    log "ERROR: Discovery failed with exit code $EXIT_CODE"
    exit $EXIT_CODE
fi

log "=========================================="
log "Discovery Complete - Log: $LOG_FILE"
log "=========================================="

# Optional: Send notification (uncomment and configure)
# curl -X POST https://your-webhook-url.com/notify \
#   -H 'Content-Type: application/json' \
#   -d "{\"status\": \"success\", \"seeds\": $SEED_COUNT, \"log\": \"$LOG_FILE\"}"

exit 0
