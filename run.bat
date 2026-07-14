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
if not exist "%PYTHON_DIR%\venv" (
    echo   ^✗ venv not found in backend-python\
    echo      Run: cd backend-python ^&^& python -m venv venv ^&^& pip install -r requirements.txt
    pause
    exit /b 1
)

start "Blue Horizon — FastAPI Backend" cmd /k ^
    "echo 🚀 Blue Horizon — FastAPI Backend && cd /d "%PYTHON_DIR%" && call venv\Scripts\activate.bat && python run.py"

echo   ^✓ Backend started in new window ^(port 8000^)
timeout /t 2 >nul

:: ── Step 3: Frontend (Next.js) ────────────────────────────────────────
echo [3/3] Starting Next.js frontend...
if not exist "%FRONTEND_DIR%\node_modules" (
    echo   ^✗ node_modules not found in frontend-nextjs\
    echo      Run: cd frontend-nextjs ^&^& npm install
    pause
    exit /b 1
)

start "Blue Horizon — Next.js Frontend" cmd /k ^
    "echo 🌐 Blue Horizon — Next.js Frontend && cd /d "%FRONTEND_DIR%" && npm run dev"

echo   ^✓ Frontend started in new window ^(port 3000^)

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
