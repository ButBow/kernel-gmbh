# ============================================================================
# Kernel Website - Quick Start Server
# ============================================================================
# Schnellstart-Skript fuer den taeglichen Gebrauch
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

function Write-Success {
    param([string]$msg)
    Write-Host "[OK] $msg" -ForegroundColor Green
}

function Write-Info {
    param([string]$msg)
    Write-Host "[..] $msg" -ForegroundColor Cyan
}

function Write-Warn {
    param([string]$msg)
    Write-Host "[!!] $msg" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$msg)
    Write-Host "[XX] $msg" -ForegroundColor Red
}

# ============================================================================
# Konfiguration
# ============================================================================

function Get-Config {
    # Standardwerte
    $defaultConfig = [PSCustomObject]@{
        tunnelName = "meine-website"
        domain = $null
        port = 3000
        chatbotPort = 8001
        autoPull = $false
        lastBuild = $null
    }
    
    if (Test-Path $ConfigFile) {
        try {
            $content = Get-Content $ConfigFile -Raw -ErrorAction Stop
            $parsed = $content | ConvertFrom-Json
            
            # Extrahiere Werte aus verschachtelter Struktur
            if ($parsed.server -and $parsed.server.port) {
                $defaultConfig.port = $parsed.server.port
            }
            if ($parsed.tunnel -and $parsed.tunnel.name) {
                $defaultConfig.tunnelName = $parsed.tunnel.name
            }
            if ($parsed.tunnel -and $parsed.tunnel.domain) {
                $defaultConfig.domain = $parsed.tunnel.domain
            }
            if ($parsed.chatbot -and $parsed.chatbot.port) {
                $defaultConfig.chatbotPort = $parsed.chatbot.port
            }
            if ($parsed.autoPull) {
                $defaultConfig.autoPull = $parsed.autoPull
            }
            
            return $defaultConfig
        } catch {
            Write-Warn "Config-Datei beschaedigt, verwende Standardwerte"
        }
    }
    
    return $defaultConfig
}

# ============================================================================
# Checks
# ============================================================================

function Test-Command {
    param([string]$cmd)
    $result = Get-Command $cmd -ErrorAction SilentlyContinue
    return ($null -ne $result)
}

function Test-PortInUse {
    param([int]$port)
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    return ($null -ne $connection)
}

function Stop-ProcessOnPort {
    param([int]$port)
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Warn "Prozess auf Port ${port}: $($process.ProcessName) (PID: $($process.Id))"
            $kill = Read-Host "Prozess beenden? (j/n)"
            if (($kill -eq "j") -or ($kill -eq "J")) {
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
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "           KERNEL WEBSITE - QUICK START                         " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Pruefe Dependencies
Write-Info "Pruefe Abhaengigkeiten..."

if (-not (Test-Command "node")) {
    Write-Err "Node.js nicht gefunden! Bitte fuehre setup.bat aus."
    Read-Host "Enter zum Beenden"
    exit 1
}

$noTunnel = $false
if (-not (Test-Command "cloudflared")) {
    Write-Warn "Cloudflared nicht gefunden! Tunnel wird nicht gestartet."
    $noTunnel = $true
}

$noChatbot = $false
$pythonCmd = "python"
if (-not (Test-Command "python")) {
    if (Test-Command "python3") {
        $pythonCmd = "python3"
    } else {
        Write-Warn "Python nicht gefunden! Chatbot wird nicht gestartet."
        $noChatbot = $true
    }
}

Write-Success "Dependencies OK"

# Pruefe Build
if (-not (Test-Path "dist")) {
    Write-Warn "Build nicht gefunden!"
    Write-Info "Erstelle Build..."
    
    npm run build 2>&1 | ForEach-Object { Write-Host $_ }
    
    if (-not (Test-Path "dist")) {
        Write-Err "Build fehlgeschlagen! Bitte fuehre setup.bat aus."
        Read-Host "Enter zum Beenden"
        exit 1
    }
    Write-Success "Build erstellt"
}

# Optional: Git Pull
Write-Host ""
$pull = Read-Host "Git Pull ausfuehren? (j/n)"
if (($pull -eq "j") -or ($pull -eq "J")) {
    Write-Info "Fuehre Git Pull aus..."
    git pull
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Git Pull erfolgreich"
        
        Write-Info "Erstelle neuen Build..."
        npm install --silent
        npm run build 2>&1 | ForEach-Object { Write-Host $_ }
    } else {
        Write-Warn "Git Pull fehlgeschlagen - fahre mit aktuellem Stand fort"
    }
}

# Pruefe Port
if (Test-PortInUse $config.port) {
    Write-Warn "Port $($config.port) ist bereits belegt!"
    $stopped = Stop-ProcessOnPort $config.port
    if (-not $stopped) {
        Write-Err "Server kann nicht gestartet werden - Port belegt"
        Read-Host "Enter zum Beenden"
        exit 1
    }
}

Write-Host ""
Write-Info "Starte Server und Tunnel..."
Write-Host ""

# Starte Node.js Server in neuem Fenster
Write-Info "Starte Node.js Server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectDir'; Write-Host 'NODE SERVER' -ForegroundColor Green; Write-Host '==========' -ForegroundColor Green; node server.js" -WindowStyle Normal

Start-Sleep -Seconds 2

# Starte Python Chatbot (wenn verfuegbar)
if (-not $noChatbot) {
    Write-Info "Starte Python Chatbot Server..."
    $chatbotScript = Join-Path $ScriptDir "chatbot_server.py"
    if (Test-Path $chatbotScript) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectDir'; Write-Host 'CHATBOT SERVER (Port $($config.chatbotPort))' -ForegroundColor Magenta; Write-Host '===================' -ForegroundColor Magenta; $pythonCmd '$chatbotScript'" -WindowStyle Normal
        Start-Sleep -Seconds 2
    } else {
        Write-Warn "Chatbot-Skript nicht gefunden: $chatbotScript"
    }
}

# Starte Tunnel (wenn verfuegbar)
if (-not $noTunnel) {
    Write-Info "Starte Cloudflare Tunnel..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'CLOUDFLARE TUNNEL' -ForegroundColor Cyan; Write-Host '=================' -ForegroundColor Cyan; cloudflared tunnel run $($config.tunnelName)" -WindowStyle Normal
    Start-Sleep -Seconds 2
}

# Status anzeigen
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "              SERVER LAEUFT ERFOLGREICH!                        " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Lokal:      http://localhost:$($config.port)" -ForegroundColor Green

if (-not $noTunnel -and $config.domain) {
    Write-Host "  Tunnel:     https://$($config.domain)" -ForegroundColor Green
    Write-Host "  Admin:      https://$($config.domain)/admin/login" -ForegroundColor Green
} elseif (-not $config.domain) {
    Write-Host "  (Keine Domain konfiguriert - bitte setup.bat -> Option 7 nutzen)" -ForegroundColor Yellow
} else {
    Write-Host "  (Tunnel nicht verfuegbar - nur lokal erreichbar)" -ForegroundColor Yellow
}

if (-not $noChatbot) {
    Write-Host "  Chatbot:    http://localhost:$($config.chatbotPort)" -ForegroundColor Green
}

Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Alle Fenster offen lassen!" -ForegroundColor Green
Write-Host "  Zum Stoppen: Alle Fenster schliessen (oder Ctrl+C)" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

# Halte Fenster offen
Write-Host "Dieses Fenster kann geschlossen werden." -ForegroundColor Gray
Write-Host "Server laeuft in separaten Fenstern weiter." -ForegroundColor Gray
Write-Host ""
Read-Host "Enter zum Beenden dieses Fensters"
