# test_run_loop.ps1
# ─────────────────────────────────────────────────────────────────────────
# FOR TESTING ONLY (Windows) — runs both batch scripts every 30 seconds.
#
# Windows Task Scheduler's minimum repeat interval is also 1 minute, so
# this script is a manual loop just to observe behavior quickly during
# testing. Do NOT use this in production — see the Task Scheduler setup
# notes at the bottom instead.
#
# Usage (PowerShell):
#   cd backend-python\batch
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass   # if scripts are blocked
#   .\test_run_loop.ps1
#
# Stop with Ctrl+C.
# ─────────────────────────────────────────────────────────────────────────

$IntervalSeconds = 30

# Adjust this if your venv's python.exe is somewhere else
$PythonExe = "..\venv\Scripts\python.exe"

Write-Host "Starting test loop. Running both batch jobs every $IntervalSeconds`s."
Write-Host "Press Ctrl+C to stop."
Write-Host ""

while ($true) {
    Write-Host "───────────────────────────────────────────────"
    Write-Host "Run at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

    Write-Host "--- roll_forward_instances.py ---"
    & $PythonExe roll_forward_instances.py

    Write-Host "--- update_departed_status.py ---"
    & $PythonExe update_departed_status.py

    Write-Host "Sleeping $IntervalSeconds`s..."
    Start-Sleep -Seconds $IntervalSeconds
}