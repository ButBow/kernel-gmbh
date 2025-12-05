# ============================================================================
# Kernel Website - Quick Start Server
# ============================================================================
# Schnellstart-Skript für den täglichen Gebrauch
# ============================================================================

$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "Kernel Website - Server"

# Pfade
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$ConfigFile = Join-Path $ScriptDir "config.json"

# Farben
function Write-Success($msg) { Write-Host "✓ $msg" -ForegroundColor Green }
function Write-Info($msg) { Write-Host "→ $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "⚠ $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "✗ $msg" -ForegroundColor Red }

# ============================================================================
# Konfiguration
# ============================================================================

function Get-Config {
    if (Test-Path $ConfigFile) {
        return Get-Content $ConfigFile -Raw | ConvertFrom-Json
    }
    return @{
        tunnelName = "kernel-website"
        domain = "kernel.gmbh"
        port = 3000
        autoPull = $false
        lastBuild = $null
    }
}

# ============================================================================
# Checks
# ============================================================================

function Test-Command($cmd) {
    $null = Get-Command $cmd -ErrorAction SilentlyContinue
    return $?
}

function Test-PortInUse($port) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

function Stop-ProcessOnPort($port) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Warn "Prozess auf Port ${port}: $($process.ProcessName) (PID: $($process.Id))"
            $kill = Read-Host "Prozess beenden? (j/n)"
            if ($kill -eq "j" -or $kill -eq "J") {
                Stop-Process -Id $process.Id -Force
                Start-Sleep -Seconds 1
                return $true
            }
        }
    }
    return $false
}

# ============================================================================
# Main
# ============================================================================

Set-Location $ProjectDir
$config = Get-Config

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🚀 KERNEL WEBSITE - QUICK START                      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Prüfe Dependencies
Write-Info "Prüfe Abhängigkeiten..."

if (-not (Test-Command "node")) {
    Write-Err "Node.js nicht gefunden! Bitte führe setup.bat aus."
    Read-Host "Enter zum Beenden"
    exit 1
}

if (-not (Test-Command "cloudflared")) {
    Write-Warn "Cloudflared nicht gefunden! Tunnel wird nicht gestartet."
    $noTunnel = $true
} else {
    $noTunnel = $false
}

Write-Success "Dependencies OK"

# Prüfe Build
if (-not (Test-Path "dist")) {
    Write-Warn "Build nicht gefunden!"
    Write-Info "Erstelle Build..."
    
    npm run build 2>&1 | ForEach-Object { Write-Host $_ }
    
    if (-not (Test-Path "dist")) {
        Write-Err "Build fehlgeschlagen! Bitte führe setup.bat aus."
        Read-Host "Enter zum Beenden"
        exit 1
    }
    Write-Success "Build erstellt"
}

# Optional: Git Pull
Write-Host ""
$pull = Read-Host "Git Pull ausführen? (j/n)"
if ($pull -eq "j" -or $pull -eq "J") {
    Write-Info "Führe Git Pull aus..."
    git pull
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Git Pull erfolgreich"
        
        # Rebuild nach Pull
        Write-Info "Erstelle neuen Build..."
        npm install --silent
        npm run build 2>&1 | ForEach-Object { Write-Host $_ }
    } else {
        Write-Warn "Git Pull fehlgeschlagen - fahre mit aktuellem Stand fort"
    }
}

# Prüfe Port
if (Test-PortInUse $config.port) {
    Write-Warn "Port $($config.port) ist bereits belegt!"
    if (-not (Stop-ProcessOnPort $config.port)) {
        Write-Err "Server kann nicht gestartet werden - Port belegt"
        Read-Host "Enter zum Beenden"
        exit 1
    }
}

Write-Host ""
Write-Info "Starte Server und Tunnel..."
Write-Host ""

# Starte Server in neuem Fenster
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectDir'; Write-Host 'NODE SERVER' -ForegroundColor Green; Write-Host '==========' -ForegroundColor Green; node server.js" -WindowStyle Normal

Start-Sleep -Seconds 2

# Starte Tunnel (wenn verfügbar)
if (-not $noTunnel) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'CLOUDFLARE TUNNEL' -ForegroundColor Cyan; Write-Host '=================' -ForegroundColor Cyan; cloudflared tunnel run $($config.tunnelName)" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Status anzeigen
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              🚀 SERVER LÄUFT ERFOLGREICH!                      ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Lokal:      http://localhost:$($config.port)                             ║" -ForegroundColor Green

if (-not $noTunnel) {
    Write-Host "║  Tunnel:     https://$($config.domain)                               ║" -ForegroundColor Green
    Write-Host "║  Admin:      https://$($config.domain)/admin/login             ║" -ForegroundColor Green
} else {
    Write-Host "║  (Tunnel nicht verfügbar - nur lokal erreichbar)               ║" -ForegroundColor Yellow
}

Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Server-Fenster und Tunnel-Fenster offen lassen!               ║" -ForegroundColor Green
Write-Host "║  Zum Stoppen: Beide Fenster schließen (oder Ctrl+C)            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Halte Fenster offen
Write-Host "Dieses Fenster kann geschlossen werden." -ForegroundColor Gray
Write-Host "Server läuft in separaten Fenstern weiter." -ForegroundColor Gray
Write-Host ""
Read-Host "Enter zum Beenden dieses Fensters"
