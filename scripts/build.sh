#!/usr/bin/env bash
set -euo pipefail

# DeskButler build script — builds Python sidecar + Tauri app

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "=== DeskButler Build ==="
echo ""

# Detect platform target triple
case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)   TARGET="x86_64-unknown-linux-gnu" ; EXT="" ;;
  Darwin-x86_64)  TARGET="x86_64-apple-darwin"      ; EXT="" ;;
  Darwin-arm64)   TARGET="aarch64-apple-darwin"      ; EXT="" ;;
  MINGW*|MSYS*|CYGWIN*)   TARGET="x86_64-pc-windows-msvc" ; EXT=".exe" ;;
  *)              echo "Unsupported platform"; exit 1 ;;
esac

echo "Platform: $TARGET"
echo ""

# Step 1: Build Python sidecar
echo "[1/3] Building Python backend with PyInstaller..."
cd python
pip install pyinstaller -q
pyinstaller deskbutler-engine.spec --noconfirm --clean 2>&1 | tail -3
cd "$PROJECT_DIR"

# Step 2: Copy sidecar to Tauri binaries
echo "[2/3] Copying sidecar binary..."
mkdir -p src-tauri/binaries
cp "python/dist/deskbutler-engine${EXT}" "src-tauri/binaries/deskbutler-engine-${TARGET}${EXT}"
chmod +x "src-tauri/binaries/deskbutler-engine-${TARGET}${EXT}" 2>/dev/null || true
echo "  -> src-tauri/binaries/deskbutler-engine-${TARGET}${EXT}"

# Step 3: Build Tauri app
echo "[3/3] Building Tauri application..."
npm run tauri build -- --target "$TARGET" 2>&1

echo ""
echo "=== Build complete ==="
echo "Installers at: src-tauri/target/${TARGET}/release/bundle/"
ls -la "src-tauri/target/${TARGET}/release/bundle/"*/* 2>/dev/null || echo "(check the bundle directory)"
