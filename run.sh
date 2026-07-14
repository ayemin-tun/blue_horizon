#!/usr/bin/env bash
# ============================================================
#  Blue Horizon — One-click Dev Startup (Mac / Linux)
#  Usage: ./run.sh
# ============================================================

set -e

# ── Colours ─────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

# ── Root dir (wherever this script lives) ───────────────────
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COBOL_BIN="$ROOT_DIR/backend-cobol/bin"
PYTHON_DIR="$ROOT_DIR/backend-python"
FRONTEND_DIR="$ROOT_DIR/frontend-nextjs"

# ── Banner ───────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║       Blue Horizon — Dev Server Startup       ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: COBOL binaries → compile (if needed) + chmod +x ─
echo -e "${YELLOW}[1/3] Setting up COBOL binaries...${NC}"
COBOL_SRC="$ROOT_DIR/backend-cobol/src"

if [ ! -d "$COBOL_BIN" ]; then
    echo -e "${YELLOW}  bin/ not found — compiling from source...${NC}"

    # Check cobc is installed
    if ! command -v cobc &>/dev/null; then
        echo -e "${RED}  ✗ GnuCOBOL (cobc) not installed.${NC}"
        echo -e "${RED}    Install with: brew install gnucobol${NC}"
        exit 1
    fi

    mkdir -p "$COBOL_BIN"

    for cbl_file in "$COBOL_SRC"/*.cbl; do
        name=$(basename "$cbl_file" .cbl)
        echo -e "  Compiling ${CYAN}${name}.cbl${NC} → ${CYAN}bin/${name}${NC}"
        cobc -x -o "$COBOL_BIN/$name" "$cbl_file"
    done

    echo -e "${GREEN}  ✓ All COBOL programs compiled successfully${NC}"
fi

# chmod +x on all binaries
chmod +x "$COBOL_BIN"/*
echo -e "${GREEN}  ✓ chmod +x applied to all files in backend-cobol/bin/${NC}"

# ── Step 2: Backend (FastAPI + venv) ────────────────────────
echo -e "${YELLOW}[2/3] Starting FastAPI backend...${NC}"

# Check python3 installed
if ! command -v python3 &>/dev/null; then
    echo -e "${RED}  ✗ python3 not found. Install from https://www.python.org${NC}"
    exit 1
fi

# Auto-create venv if missing
if [ ! -d "$PYTHON_DIR/venv" ]; then
    echo -e "${YELLOW}  venv not found — creating virtual environment...${NC}"
    python3 -m venv "$PYTHON_DIR/venv"
    echo -e "${GREEN}  ✓ venv created${NC}"

    echo -e "${YELLOW}  Installing Python dependencies...${NC}"
    "$PYTHON_DIR/venv/bin/pip" install --quiet -r "$PYTHON_DIR/requirements.txt"
    echo -e "${GREEN}  ✓ Python packages installed${NC}"

    echo -e "${YELLOW}  Initializing database (init_db.py)...${NC}"
    "$PYTHON_DIR/venv/bin/python" "$PYTHON_DIR/app/database/init_db.py"
    echo -e "${GREEN}  ✓ Database initialized${NC}"
fi

# Open a new Terminal tab/window for backend
osascript <<EOF
tell application "Terminal"
    do script "echo '🚀 Blue Horizon — FastAPI Backend' && cd '$PYTHON_DIR' && source venv/bin/activate && python run.py"
end tell
EOF
echo -e "${GREEN}  ✓ Backend started in new Terminal window (port 8000)${NC}"

sleep 1

# ── Step 3: Frontend (Next.js) ──────────────────────────────
echo -e "${YELLOW}[3/3] Starting Next.js frontend...${NC}"

# Check node/npm installed
if ! command -v npm &>/dev/null; then
    echo -e "${RED}  ✗ npm not found. Install Node.js from https://nodejs.org${NC}"
    exit 1
fi

# Auto-install node_modules if missing
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}  node_modules not found — running npm install...${NC}"
    npm --prefix "$FRONTEND_DIR" install --silent
    echo -e "${GREEN}  ✓ npm packages installed${NC}"
fi

osascript <<EOF
tell application "Terminal"
    do script "echo '🌐 Blue Horizon — Next.js Frontend' && cd '$FRONTEND_DIR' && npm run dev"
end tell
EOF
echo -e "${GREEN}  ✓ Frontend started in new Terminal window (port 3000)${NC}"

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║  ✅  All services started!                    ║${NC}"
echo -e "${CYAN}${BOLD}║                                              ║${NC}"
echo -e "${CYAN}${BOLD}║  Backend  →  http://127.0.0.1:8000           ║${NC}"
echo -e "${CYAN}${BOLD}║  Frontend →  http://localhost:3000            ║${NC}"
echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════╝${NC}"
echo ""
