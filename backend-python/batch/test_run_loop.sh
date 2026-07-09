#!/bin/bash
# test_run_loop.sh
# ─────────────────────────────────────────────────────────────────────────
# FOR TESTING ONLY — runs both batch scripts every 30 seconds.
#
# Cron cannot schedule anything faster than once per minute, so this
# script is a manual loop just to observe behavior quickly during testing.
# Do NOT use this in production — use real cron entries (1-minute minimum)
# once you're done testing. See the bottom of this file for that.
#
# Usage:
#   cd backend-python/batch
#   chmod +x test_run_loop.sh
#   ./test_run_loop.sh
#
# Stop with Ctrl+C.
# ─────────────────────────────────────────────────────────────────────────

INTERVAL_SECONDS=30

echo "Starting test loop. Running both batch jobs every ${INTERVAL_SECONDS}s."
echo "Press Ctrl+C to stop."
echo ""

while true; do
    echo "───────────────────────────────────────────────"
    echo "Run at: $(date '+%Y-%m-%d %H:%M:%S')"

    echo "--- roll_forward_instances.py ---"
    python roll_forward_instances.py

    echo "--- update_departed_status.py ---"
    python update_departed_status.py

    echo "Sleeping ${INTERVAL_SECONDS}s..."
    sleep "$INTERVAL_SECONDS"
done