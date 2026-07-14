@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul

:: ============================================================
::  Blue Horizon — One-click Dev Startup (Windows)
::  Usage: Double-click run.bat  OR  run it from cmd
:: ============================================================

set "ROOT_DIR=%~dp0"
set "COBOL_BIN=%ROOT_DIR%backend-cobol\bin"
set "PYTHON_DIR=%ROOT_DIR%backend-python"
set "FRONTEND_DIR=%ROOT_DIR%frontend-nextjs"

echo.
echo ╔══════════════════════════════════════════════╗
echo ║       Blue Horizon — Dev Server Startup       ║
echo ╚══════════════════════════════════════════════╝
echo.

:: ── Step 1: COBOL binaries → compile (if needed) ─────────────────────
set "COBOL_SRC=%ROOT_DIR%backend-cobol\src"
echo [1/3] Setting up COBOL binaries...

if not exist "%COBOL_BIN%" (
    echo   bin\ not found -- compiling from source...

    :: Check cobc is installed
    where cobc >nul 2>&1
    if errorlevel 1 (
        echo   [ERROR] GnuCOBOL ^(cobc^) is not installed.
        echo          Install from: https://gnucobol.sourceforge.io/
        echo          Or via winget: winget install GnuCOBOL.GnuCOBOL
        pause
        exit /b 1
    )

    mkdir "%COBOL_BIN%"

    for %%f in ("%COBOL_SRC%\*.cbl") do (
        set "name=%%~nf"
        echo   Compiling %%~nxf --^> bin\!name!
        cobc -x -o "%COBOL_BIN%\!name!" "%%f"
    )

    echo   [OK] All COBOL programs compiled successfully
) else (
    echo   [OK] backend-cobol\bin\ found
)

echo   [OK] COBOL binaries are ready
echo.


:: ── Step 2: Backend (FastAPI + venv) ─────────────────────────────────
echo [2/3] Starting FastAPI backend...

:: Check python is installed
where python >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] python not found. Install from https://www.python.org
    pause
    exit /b 1
)

:: Auto-create venv if missing
if not exist "%PYTHON_DIR%\venv" (
    echo   venv not found -- creating virtual environment...
    python -m venv "%PYTHON_DIR%\venv"
    echo   [OK] venv created

    echo   Installing Python dependencies...
    "%PYTHON_DIR%\venv\Scripts\pip.exe" install -r "%PYTHON_DIR%\requirements.txt"
    if errorlevel 1 (
        echo   [ERROR] pip install failed. Check requirements.txt and your internet connection.
        pause
        exit /b 1
    )
    echo   [OK] Python packages installed
)

:: Write temp launcher for backend (full absolute paths — no relative path issues)
(
    echo @echo off
    echo echo Blue Horizon -- FastAPI Backend
    echo cd /d "%PYTHON_DIR%"
    echo if not exist "%PYTHON_DIR%\venv\Scripts\activate.bat" ^(
    echo     echo [ERROR] venv\Scripts\activate.bat not found. Re-run run.bat to recreate venv.
    echo     pause ^& exit /b 1
    echo ^)
    echo call "%PYTHON_DIR%\venv\Scripts\activate.bat"
    echo "%PYTHON_DIR%\venv\Scripts\python.exe" run.py
    echo pause
) > "%TEMP%\bh_backend.bat"

start "Blue Horizon — FastAPI Backend" cmd /k "%TEMP%\bh_backend.bat"

echo   [OK] Backend started in new window (port 8000)
timeout /t 2 >nul

:: ── Step 3: Frontend (Next.js) ────────────────────────────────────────
echo [3/3] Starting Next.js frontend...

:: Check npm is installed
where npm >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] npm not found. Install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Auto-install node_modules if missing
if not exist "%FRONTEND_DIR%\node_modules" (
    echo   node_modules not found -- running npm install...
    cd /d "%FRONTEND_DIR%" && npm install --silent
    echo   [OK] npm packages installed
)

:: Write temp launcher for frontend (avoids nested-quote path bug)
(
    echo @echo off
    echo cd /d "%FRONTEND_DIR%"
    echo npm run dev
    echo pause
) > "%TEMP%\bh_frontend.bat"

start "Blue Horizon — Next.js Frontend" cmd /k "%TEMP%\bh_frontend.bat"

echo   [OK] Frontend started in new window (port 3000)

:: ── Done ──────────────────────────────────────────────────────────────
echo.
echo ╔══════════════════════════════════════════════╗
echo ║  All services started!                       ║
echo ║                                              ║
echo ║  Backend  -^>  http://127.0.0.1:8000          ║
echo ║  Frontend -^>  http://localhost:3000           ║
echo ╚══════════════════════════════════════════════╝
echo.
pause
