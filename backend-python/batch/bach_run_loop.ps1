# batch_run_loop.ps1
# ─────────────────────────────────────────────────────────────────────────
# FOR TESTING & LOCAL RUNNING (Windows) — Handles dual intervals:
#   1. update_departed_status.py -> runs every 10 minutes
#   2. roll_forward_instances.py -> runs exactly at midnight (00:00)
#
# Usage (PowerShell):
#   cd backend-python\batch
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\test_run_loop.ps1
#
# Stop with Ctrl+C.
# ─────────────────────────────────────────────────────────────────────────

$IntervalSeconds = 60          # Check conditions every 1 minute (60 seconds)
$StatusIntervalMinutes = 10   # Target interval for status updates (10 minutes)
$ElapsedMinutes = 0
$HasRunMidnight = $false

# Path to the virtual environment's Python executable
$PythonExe = "..\venv\Scripts\python.exe"

Write-Host "🚀 Dual-Interval Test Loop Started (PowerShell)!" -ForegroundColor Green
Write-Host "-> update_departed_status.py: runs every 10 minutes"
Write-Host "-> roll_forward_instances.py: runs every midnight (00:00)"
Write-Host "Press Ctrl+C to stop."
Write-Host ""

# Execute an initial status check on startup to ensure data consistency
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Initializing System Check at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "--- Running initial update_departed_status.py ---"
& $PythonExe update_departed_status.py
Write-Host "===============================================" -ForegroundColor Cyan

while ($true) {
    # Wait for 1 minute before checking conditions again
    Start-Sleep -Seconds $IntervalSeconds
    $ElapsedMinutes++

    $CurrentTime = Get-Date -Format "HH:mm"
    Write-Host "⏱️  Tick: $CurrentTime (Elapsed: $ElapsedMinutes min)" -ForegroundColor Yellow

    # ─── 1. STATUS UPDATE (Triggers every 10 minutes) ───
    if ($ElapsedMinutes % $StatusIntervalMinutes -eq 0) {
        Write-Host "───────────────────────────────────────────────" -ForegroundColor Magenta
        Write-Host "[Trigger] 10 Minutes Interval Reached at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Host "--- Running: update_departed_status.py ---"
        & $PythonExe update_departed_status.py
    }

    # ─── 2. ROLL FORWARD (Triggers exactly at midnight 00:00) ───
    if ($CurrentTime -eq "00:00") {
        if (-not $HasRunMidnight) {
            Write-Host "───────────────────────────────────────────────" -ForegroundColor Red
            Write-Host "[Trigger] Midnight Reached at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            Write-Host "--- Running: roll_forward_instances.py ---"
            & $PythonExe roll_forward_instances.py
            $HasRunMidnight = $true  # Lock mechanism to prevent multiple executions within the same minute
        }
    } else {
        # Reset the lock once midnight has passed
        $HasRunMidnight = $false
    }
}