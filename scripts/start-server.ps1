# ============================================================================
# Kernel Website - Quick Start Server
# ============================================================================
# Startet automatisch: Node.js Server + Python Chatbot + Cloudflare Tunnel
# ============================================================================

$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "Kernel Website - Server"

# Pfade
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$ConfigFile = Join-Path $ScriptDir "config.json"

# ============================================================================
# Hilfsfunktionen
# ============================================================================

function Write-Success { param([string]$msg); Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info { param([string]$msg); Write-Host "[..] $msg" -ForegroundColor Cyan }
function Write-Warn { param([string]$msg); Write-Host "[!!] $msg" -ForegroundColor Yellow }
function Write-Err { param([string]$msg); Write-Host "[XX] $msg" -ForegroundColor Red }

function Test-Command {
    param([string]$cmd)
    return ($null -ne (Get-Command $cmd -ErrorAction SilentlyContinue))
}

function Test-PortInUse {
    param([int]$port)
    return ($null -ne (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue))
}

function Stop-ProcessOnPort {
    param([int]$port)
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process -and $process.ProcessName -ne "System") {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
            return $true
        }
    }
    return $false
}

# ============================================================================
# Konfiguration laden
# ============================================================================

function Get-Config {
    $config = [PSCustomObject]@{
        tunnelName = "meine-website"
        domain = $null
        port = 3000
        chatbotPort = 8001
        autoPull = $false
    }
    
    if (Test-Path $ConfigFile) {
        try {
            $parsed = Get-Content $ConfigFile -Raw | ConvertFrom-Json
            if ($parsed.server.port) { $config.port = $parsed.server.port }
            if ($parsed.tunnel.name) { $config.tunnelName = $parsed.tunnel.name }
            if ($parsed.tunnel.domain) { $config.domain = $parsed.tunnel.domain }
            if ($parsed.chatbot.port) { $config.chatbotPort = $parsed.chatbot.port }
            if ($parsed.autoPull) { $config.autoPull = $parsed.autoPull }
        } catch {
            Write-Warn "Config-Fehler, nutze Standardwerte"
        }
    }
    return $config
}

# ============================================================================
# Git Pull mit Stash-Handling
# ============================================================================

function Invoke-GitPull {
    if (-not (Test-Command "git")) {
        Write-Warn "Git nicht installiert"
        return $false
    }
    
    # Prüfe ob Git-Repo
    if (-not (Test-Path ".git")) {
        Write-Warn "Kein Git-Repository gefunden"
        return $false
    }
    
    Write-Info "Prüfe auf lokale Änderungen..."
    
    # Prüfe auf uncommitted changes
    $status = git status --porcelain 2>&1
    $hasChanges = ($status -and $status.Length -gt 0)
    
    if ($hasChanges) {
        Write-Warn "Lokale Änderungen gefunden"
        Write-Info "Sichere lokale Änderungen (git stash)..."
        
        git stash push -m "auto-stash-before-pull" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Err "Stash fehlgeschlagen"
            return $false
        }
        Write-Success "Änderungen gesichert"
    }
    
    # Pull ausführen
    Write-Info "Lade neueste Version (git pull)..."
    $pullResult = git pull 2>&1
    $pullSuccess = ($LASTEXITCODE -eq 0)
    
    if ($pullSuccess) {
        Write-Success "Git Pull erfolgreich"
        
        # Stash wieder anwenden falls vorhanden
        if ($hasChanges) {
            Write-Info "Stelle lokale Änderungen wieder her..."
            $stashResult = git stash pop 2>&1
            
            if ($LASTEXITCODE -ne 0) {
                Write-Warn "Automatisches Wiederherstellen fehlgeschlagen"
                Write-Warn "Deine Änderungen sind gesichert in: git stash list"
                Write-Warn "Manuell wiederherstellen mit: git stash pop"
            } else {
                Write-Success "Lokale Änderungen wiederhergestellt"
            }
        }
        return $true
    } else {
        Write-Err "Git Pull fehlgeschlagen: $pullResult"
        
        # Stash wiederherstellen bei Fehler
        if ($hasChanges) {
            Write-Info "Stelle lokale Änderungen wieder her..."
            git stash pop 2>&1 | Out-Null
        }
        return $false
    }
}

# ============================================================================
# HAUPTPROGRAMM
# ============================================================================

Set-Location $ProjectDir
$config = Get-Config

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "           KERNEL WEBSITE - QUICK START                         " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# --- Dependencies prüfen ---
Write-Info "Prüfe Abhängigkeiten..."

if (-not (Test-Command "node")) {
    Write-Err "Node.js nicht gefunden! Bitte setup.bat ausführen."
    Read-Host "Enter zum Beenden"
    exit 1
}

$noTunnel = -not (Test-Command "cloudflared")
if ($noTunnel) { Write-Warn "Cloudflared nicht gefunden - kein Tunnel" }

$pythonCmd = if (Test-Command "python") { "python" } elseif (Test-Command "python3") { "python3" } else { $null }
$noChatbot = ($null -eq $pythonCmd)
if ($noChatbot) { Write-Warn "Python nicht gefunden - kein Chatbot" }

Write-Success "Abhängigkeiten geprüft"

# --- Menü ---
Write-Host ""
Write-Host "Was möchtest du tun?" -ForegroundColor Yellow
Write-Host "  1) Nur Server starten (schnell)"
Write-Host "  2) Git Pull + Server starten"
Write-Host "  3) Neu builden + Server starten"
Write-Host "  4) Git Pull + Neu builden + Server starten"
Write-Host ""
$choice = Read-Host "Auswahl (1-4)"

# --- Git Pull ---
if ($choice -eq "2" -or $choice -eq "4") {
    Write-Host ""
    $pullSuccess = Invoke-GitPull
    if (-not $pullSuccess) {
        Write-Warn "Fahre ohne Pull fort..."
    }
}

# --- Build ---
$needsBuild = $false
if ($choice -eq "3" -or $choice -eq "4") {
    $needsBuild = $true
} elseif (-not (Test-Path "dist")) {
    Write-Warn "Kein Build vorhanden"
    $needsBuild = $true
}

if ($needsBuild) {
    Write-Host ""
    Write-Info "Installiere Dependencies..."
    npm install --silent 2>&1 | Out-Null
    
    Write-Info "Erstelle Build..."
    npm run build 2>&1 | ForEach-Object { Write-Host $_ }
    
    if (-not (Test-Path "dist")) {
        Write-Err "Build fehlgeschlagen!"
        Read-Host "Enter zum Beenden"
        exit 1
    }
    Write-Success "Build erstellt"
}

# --- Ports freigeben ---
if (Test-PortInUse $config.port) {
    Write-Info "Räume Port $($config.port) frei..."
    Stop-ProcessOnPort $config.port | Out-Null
}
if (-not $noChatbot -and (Test-PortInUse $config.chatbotPort)) {
    Write-Info "Räume Port $($config.chatbotPort) frei..."
    Stop-ProcessOnPort $config.chatbotPort | Out-Null
}

# --- Server starten ---
Write-Host ""
Write-Info "Starte Server..."

# Node.js Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Node.js Server'
cd '$ProjectDir'
Write-Host '═══════════════════════════════════════' -ForegroundColor Green
Write-Host '  NODE.JS SERVER - Port $($config.port)' -ForegroundColor Green
Write-Host '═══════════════════════════════════════' -ForegroundColor Green
Write-Host ''
node server.js
"@ -WindowStyle Normal

Start-Sleep -Seconds 2

# Python Chatbot
if (-not $noChatbot) {
    $chatbotScript = Join-Path $ScriptDir "chatbot_server.py"
    if (Test-Path $chatbotScript) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Chatbot Server'
cd '$ProjectDir'
Write-Host '═══════════════════════════════════════' -ForegroundColor Magenta
Write-Host '  CHATBOT SERVER - Port $($config.chatbotPort)' -ForegroundColor Magenta
Write-Host '═══════════════════════════════════════' -ForegroundColor Magenta
Write-Host ''
$pythonCmd '$chatbotScript'
"@ -WindowStyle Normal
        Start-Sleep -Seconds 2
    }
}

# Cloudflare Tunnel
if (-not $noTunnel) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Cloudflare Tunnel'
Write-Host '═══════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  CLOUDFLARE TUNNEL' -ForegroundColor Cyan
Write-Host '═══════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
cloudflared tunnel run $($config.tunnelName)
"@ -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# --- Status anzeigen ---
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "              SERVER LÄUFT ERFOLGREICH!                         " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Lokal:      http://localhost:$($config.port)" -ForegroundColor White

if (-not $noTunnel -and $config.domain) {
    Write-Host "  Public:     https://$($config.domain)" -ForegroundColor White
    Write-Host "  Admin:      https://$($config.domain)/admin/login" -ForegroundColor White
}

if (-not $noChatbot) {
    Write-Host "  Chatbot:    http://localhost:$($config.chatbotPort)" -ForegroundColor White
}

Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

# Browser öffnen?
$openBrowser = Read-Host "Browser öffnen? (j=lokal, p=public, n=nein)"
if ($openBrowser -eq "j") {
    Start-Process "http://localhost:$($config.port)"
} elseif ($openBrowser -eq "p" -and $config.domain) {
    Start-Process "https://$($config.domain)"
}

Write-Host ""
Write-Host "Server läuft in separaten Fenstern." -ForegroundColor Gray
Write-Host "Dieses Fenster kann geschlossen werden." -ForegroundColor Gray
Read-Host "Enter zum Beenden"
