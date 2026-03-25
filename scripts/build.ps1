# DeskButler build script for Windows (PowerShell)

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (-not $ProjectDir) { $ProjectDir = Split-Path -Parent $PSScriptRoot }
Set-Location $ProjectDir

Write-Host "=== DeskButler Build ===" -ForegroundColor Cyan
Write-Host ""

$Target = "x86_64-pc-windows-msvc"
Write-Host "Platform: $Target"
Write-Host ""

# Step 1: Build Python sidecar
Write-Host "[1/3] Building Python backend with PyInstaller..." -ForegroundColor Yellow
Push-Location python
pip install pyinstaller -q
pyinstaller deskbutler-engine.spec --noconfirm --clean
Pop-Location

# Step 2: Copy sidecar to Tauri binaries
Write-Host "[2/3] Copying sidecar binary..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src-tauri\binaries" | Out-Null
Copy-Item "python\dist\deskbutler-engine.exe" "src-tauri\binaries\deskbutler-engine-$Target.exe" -Force
Write-Host "  -> src-tauri\binaries\deskbutler-engine-$Target.exe"

# Step 3: Build Tauri app
Write-Host "[3/3] Building Tauri application..." -ForegroundColor Yellow
npm run tauri build -- --target $Target

Write-Host ""
Write-Host "=== Build complete ===" -ForegroundColor Green
Write-Host "Installers at: src-tauri\target\$Target\release\bundle\"

# List generated installers
$BundlePath = "src-tauri\target\$Target\release\bundle"
if (Test-Path $BundlePath) {
    Get-ChildItem -Path $BundlePath -Recurse -File | ForEach-Object {
        $sizeKB = [math]::Round($_.Length / 1KB)
        Write-Host "  $($_.Name) ($sizeKB KB)"
    }
}
