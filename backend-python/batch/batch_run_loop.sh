#!/bin/bash
# bash_run_loop.sh
# ─────────────────────────────────────────────────────────────────────────
# FOR TESTING & LOCAL RUNNING — Handles dual intervals:
#   1. update_departed_status.py -> runs every 10 minutes (600 seconds)
#   2. roll_forward_instances.py -> runs exactly at midnight (00:00)
#
# Usage:
#   cd backend-python/batch
#   chmod +x batch_run_loop.sh
#   ./batch_run_loop.sh | tee test_run.log
#
# Stop with Ctrl+C.
# ─────────────────────────────────────────────────────────────────────────

# Initialize interval and tracking variables
INTERVAL_SECONDS=60          # Check conditions every 1 minute (60 seconds)
STATUS_INTERVAL_MINUTES=10   # Target interval for status updates (10 minutes)
elapsed_minutes=0
has_run_midnight=false

echo "🚀 Dual-Interval Test Loop Started!"
echo "-> update_departed_status.py: runs every 10 minutes"
echo "-> roll_forward_instances.py: runs every midnight (00:00)"
echo "Press Ctrl+C to stop."
echo ""

# Execute an initial status check on startup to ensure data consistency
echo "==============================================="
echo "Initializing System Check at: $(date '+%Y-%m-%d %H:%M:%S')"
echo "--- Running initial update_departed_status.py ---"
python3 update_departed_status.py
echo "==============================================="

while true; do
    # Wait for 1 minute before checking conditions again
    sleep "$INTERVAL_SECONDS"
    ((elapsed_minutes++))

    CURRENT_TIME=$(date '+%H:%M')
    echo "⏱️  Tick: $CURRENT_TIME (Elapsed: $elapsed_minutes min)"

    # ─── 1. STATUS UPDATE (Triggers every 10 minutes) ───
    if [ $((elapsed_minutes % STATUS_INTERVAL_MINUTES)) -eq 0 ]; then
        echo "───────────────────────────────────────────────"
        echo "[Trigger] 10 Minutes Interval Reached at: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "--- Running: update_departed_status.py ---"
        python3 update_departed_status.py
    fi

    # ─── 2. ROLL FORWARD (Triggers exactly at midnight 00:00) ───
    if [ "$CURRENT_TIME" = "00:00" ]; then
        if [ "$has_run_midnight" = false ]; then
            echo "───────────────────────────────────────────────"
            echo "[Trigger] Midnight Reached at: $(date '+%Y-%m-%d %H:%M:%S')"
            echo "--- Running: roll_forward_instances.py ---"
            python3 roll_forward_instances.py
            has_run_midnight=true  # Lock mechanism to prevent multiple executions within the same minute
        fi
    else
        # Reset the lock once midnight has passed
        has_run_midnight=false
    fi
done