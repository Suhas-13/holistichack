#!/bin/bash
#
# Setup Cronjob for Automated Jailbreak Seed Discovery
#
# This script installs a cron job that runs seed discovery periodically
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER_SCRIPT="$SCRIPT_DIR/run_seed_discovery.sh"

echo "=========================================="
echo "Jailbreak Seed Discovery - Cron Setup"
echo "=========================================="

# Check if runner script exists
if [ ! -f "$RUNNER_SCRIPT" ]; then
    echo "ERROR: Runner script not found at $RUNNER_SCRIPT"
    exit 1
fi

# Make sure runner is executable
chmod +x "$RUNNER_SCRIPT"

# Check for required environment variables
if [ -z "$VALYU_API_KEY" ]; then
    echo "WARNING: VALYU_API_KEY not set. You'll need to set it in cron environment."
    echo "Add this line to your crontab before the cron job:"
    echo "VALYU_API_KEY=your_api_key_here"
fi

# Prompt user for schedule
echo ""
echo "Select a schedule for seed discovery:"
echo "1) Daily at 2 AM"
echo "2) Weekly on Sunday at 3 AM"
echo "3) Every 3 days at midnight"
echo "4) Custom cron expression"
echo "5) Cancel"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        CRON_SCHEDULE="0 2 * * *"
        DESCRIPTION="Daily at 2 AM"
        ;;
    2)
        CRON_SCHEDULE="0 3 * * 0"
        DESCRIPTION="Weekly on Sunday at 3 AM"
        ;;
    3)
        CRON_SCHEDULE="0 0 */3 * *"
        DESCRIPTION="Every 3 days at midnight"
        ;;
    4)
        read -p "Enter custom cron expression: " CRON_SCHEDULE
        DESCRIPTION="Custom schedule"
        ;;
    5)
        echo "Setup cancelled."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Create cron job entry
CRON_JOB="$CRON_SCHEDULE $RUNNER_SCRIPT"

# Check if environment variables need to be added
ENV_VARS=""
if [ ! -z "$VALYU_API_KEY" ]; then
    ENV_VARS="VALYU_API_KEY=$VALYU_API_KEY"
fi
if [ ! -z "$TOGETHER_API" ]; then
    ENV_VARS="$ENV_VARS TOGETHER_API=$TOGETHER_API"
fi

echo ""
echo "The following will be added to your crontab:"
echo "----------------------------------------"
if [ ! -z "$ENV_VARS" ]; then
    echo "$ENV_VARS"
fi
echo "$CRON_JOB"
echo "----------------------------------------"
echo "Schedule: $DESCRIPTION"
echo ""
read -p "Continue? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Setup cancelled."
    exit 0
fi

# Backup existing crontab
crontab -l > /tmp/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null || true

# Add to crontab
(crontab -l 2>/dev/null || true; echo "# Jailbreak Seed Discovery - $DESCRIPTION"; if [ ! -z "$ENV_VARS" ]; then echo "$ENV_VARS"; fi; echo "$CRON_JOB") | crontab -

echo ""
echo "✓ Cronjob installed successfully!"
echo ""
echo "To verify:"
echo "  crontab -l"
echo ""
echo "To remove:"
echo "  crontab -e  # then delete the relevant lines"
echo ""
echo "Logs will be saved to:"
echo "  $SCRIPT_DIR/../logs/seed_discovery/"
echo ""
echo "=========================================="
