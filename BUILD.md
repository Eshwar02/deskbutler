# DeskButler - Production Build Guide

## 📋 Prerequisites

Before building for production, ensure you have all requirements installed:

### 1. System Requirements

**Node.js & npm**
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

**Rust & Cargo**
```bash
rustc --version  # Should be 1.70+
cargo --version
```

**Python**
```bash
python --version  # Should be 3.10+
pip --version
```

**Platform-Specific Requirements:**

- **Windows**: 
  - Microsoft Visual C++ Build Tools
  - WebView2 (usually pre-installed on Windows 10/11)

- **macOS**: 
  - Xcode Command Line Tools: `xcode-select --install`

- **Linux**: 
  - Dependencies: `sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev`

---

## 🚀 Production Build Steps

### Step 1: Clean Environment

```bash
# Navigate to project directory
cd E:\claude_work\deskbutler

# Clean previous builds
rm -rf dist/
rm -rf src-tauri/target/release/
rm -rf src-tauri/target/bundle/

# Clean node_modules if needed (optional)
# rm -rf node_modules && npm install
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Python dependencies
cd python
pip install -r requirements.txt
cd ..
```

### Step 3: Build Python Backend (Optional - for standalone executable)

If you want to bundle Python as a standalone executable:

```bash
cd python

# Install PyInstaller
pip install pyinstaller

# Build standalone executable
pyinstaller deskbutler-engine.spec

# This creates python/dist/deskbutler-engine.exe (Windows)
# or python/dist/deskbutler-engine (Linux/macOS)
```

**Note:** The `.spec` file should already be configured. If not, create one:

```python
# python/deskbutler-engine.spec
import sys
from PyInstaller.utils.hooks import collect_data_files

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=collect_data_files('pdfplumber') + collect_data_files('PIL'),
    hiddenimports=['PIL', 'pdfplumber', 'magic'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='deskbutler-engine',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # No console window on Windows
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

### Step 4: Configure Tauri for Production

Ensure `src-tauri/tauri.conf.json` is properly configured:

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "DeskButler",
    "version": "0.2.0"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.deskbutler.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "resources": [],
      "externalBin": [
        "binaries/deskbutler-engine"
      ]
    }
  }
}
```

### Step 5: Place Python Sidecar Binary

```bash
# Copy the Python executable to Tauri binaries folder
# Windows:
copy python\dist\deskbutler-engine.exe src-tauri\binaries\deskbutler-engine-x86_64-pc-windows-msvc.exe

# macOS (Intel):
cp python/dist/deskbutler-engine src-tauri/binaries/deskbutler-engine-x86_64-apple-darwin

# macOS (Apple Silicon):
cp python/dist/deskbutler-engine src-tauri/binaries/deskbutler-engine-aarch64-apple-darwin

# Linux:
cp python/dist/deskbutler-engine src-tauri/binaries/deskbutler-engine-x86_64-unknown-linux-gnu
```

### Step 6: Build for Production

```bash
# Build the complete application
npm run tauri build
```

This will:
1. ✅ Run `npm run build` (builds React frontend)
2. ✅ Compile Rust code in release mode
3. ✅ Bundle Python sidecar
4. ✅ Create platform-specific installer

**Build time:** ~2-5 minutes depending on your machine

---

## 📦 Output Files

After successful build, find installers in:

### Windows
```
src-tauri/target/release/bundle/
├── msi/
│   └── DeskButler_0.2.0_x64_en-US.msi  (MSI Installer)
└── nsis/
    └── DeskButler_0.2.0_x64-setup.exe  (NSIS Installer)
```

**Installer size:** ~15-25 MB

### macOS
```
src-tauri/target/release/bundle/
├── dmg/
│   └── DeskButler_0.2.0_x64.dmg  (DMG Image)
└── macos/
    └── DeskButler.app  (App Bundle)
```

### Linux
```
src-tauri/target/release/bundle/
├── deb/
│   └── deskbutler_0.2.0_amd64.deb  (Debian Package)
└── appimage/
    └── deskbutler_0.2.0_amd64.AppImage  (AppImage)
```

---

## 🧪 Testing Production Build

### 1. Test the Executable Directly

```bash
# Windows
.\src-tauri\target\release\deskbutler.exe

# macOS
./src-tauri/target/release/deskbutler

# Linux
./src-tauri/target/release/deskbutler
```

### 2. Install and Test

**Windows:**
```bash
# Install MSI
msiexec /i "src-tauri\target\release\bundle\msi\DeskButler_0.2.0_x64_en-US.msi"

# Or run NSIS installer
.\src-tauri\target\release\bundle\nsis\DeskButler_0.2.0_x64-setup.exe
```

**macOS:**
```bash
# Open DMG
open src-tauri/target/release/bundle/dmg/DeskButler_0.2.0_x64.dmg
# Drag DeskButler.app to Applications folder
```

**Linux:**
```bash
# Install DEB
sudo dpkg -i src-tauri/target/release/bundle/deb/deskbutler_0.2.0_amd64.deb

# Or run AppImage
chmod +x src-tauri/target/release/bundle/appimage/deskbutler_0.2.0_amd64.AppImage
./src-tauri/target/release/bundle/appimage/deskbutler_0.2.0_amd64.AppImage
```

### 3. Verify Functionality

- [ ] App launches without errors
- [ ] Python backend starts (check Task Manager/Activity Monitor)
- [ ] Can add watched folders
- [ ] Can create rules
- [ ] File suggestions appear
- [ ] Files can be moved
- [ ] Undo works
- [ ] Settings persist
- [ ] Theme switching works
- [ ] System tray icon appears
- [ ] Auto-launch toggle works (restart to test)

---

## 🐛 Troubleshooting

### Issue: Python Sidecar Not Starting

**Solution 1:** Check if Python binary is included
```bash
# Extract and check
7z l src-tauri/target/release/bundle/msi/DeskButler_0.2.0_x64_en-US.msi | grep deskbutler-engine
```

**Solution 2:** Run Python manually to test
```bash
cd python
python main.py
# Should start on port 7342
```

**Solution 3:** Check logs
- Windows: `%APPDATA%\DeskButler\deskbutler.log`
- macOS: `~/Library/Application Support/DeskButler/deskbutler.log`
- Linux: `~/.local/share/DeskButler/deskbutler.log`

### Issue: Build Fails - Missing Dependencies

```bash
# Reinstall Rust components
rustup update
rustup default stable

# Reinstall Node modules
rm -rf node_modules
npm install

# Reinstall Python dependencies
pip install -r python/requirements.txt --force-reinstall
```

### Issue: "WebView2 not found" (Windows)

Download and install: https://developer.microsoft.com/microsoft-edge/webview2/

### Issue: Large Bundle Size

**Optimize:**
1. Enable UPX compression in PyInstaller
2. Remove unused Python packages
3. Use `--strip` flag in PyInstaller
4. Minimize frontend bundle (already done with Vite)

---

## 🚢 Distribution

### Code Signing (Recommended for Production)

**Windows:**
```bash
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com "DeskButler_0.2.0_x64-setup.exe"
```

**macOS:**
```bash
codesign --force --options runtime --sign "Developer ID Application: Your Name" DeskButler.app
```

### Creating GitHub Release

```bash
# Create release tag
git tag -a v0.2.0 -m "Release v0.2.0 - Premium UI"
git push origin v0.2.0

# Upload installers to GitHub Releases
# Go to: https://github.com/Eshwar02/deskbutler/releases/new
```

---

## 📊 Build Optimization Tips

### 1. Reduce Bundle Size
```bash
# Enable release optimizations in Cargo.toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Link-time optimization
codegen-units = 1   # Better optimization
strip = true        # Remove symbols
```

### 2. Faster Builds
```bash
# Use mold linker (Linux/macOS)
cargo install mold
export RUSTFLAGS="-C link-arg=-fuse-ld=mold"

# Or use lld (all platforms)
export RUSTFLAGS="-C link-arg=-fuse-ld=lld"
```

### 3. Parallel Builds
```bash
# Set parallel jobs
export CARGO_BUILD_JOBS=8  # Use 8 CPU cores
```

---

## ✅ Production Checklist

Before distributing:

- [ ] Version numbers updated (package.json, Cargo.toml, tauri.conf.json)
- [ ] CHANGELOG.md updated
- [ ] All dependencies installed
- [ ] Python backend tested standalone
- [ ] Frontend builds without errors
- [ ] Tauri build completes successfully
- [ ] Installer tested on clean machine
- [ ] App functionality verified
- [ ] Logs directory created properly
- [ ] Database persistence works
- [ ] Auto-launch tested
- [ ] System tray functional
- [ ] Performance acceptable (<100ms interactions)
- [ ] No console errors
- [ ] Code signed (for official release)
- [ ] GitHub release created
- [ ] Documentation updated

---

## 🎯 Quick Build Command Summary

```bash
# Development
npm run tauri dev

# Production build (everything)
npm run tauri build

# Just frontend
npm run build

# Just Python backend
cd python && pyinstaller deskbutler-engine.spec

# Just Rust/Tauri (assumes frontend built)
cd src-tauri && cargo build --release
```

---

## 📞 Need Help?

- **Issues:** https://github.com/Eshwar02/deskbutler/issues
- **Tauri Docs:** https://tauri.app/v1/guides/building/
- **PyInstaller Docs:** https://pyinstaller.org/en/stable/

Happy Building! 🚀
