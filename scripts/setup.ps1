# ============================================================================
# Kernel Website - Setup Script
# ============================================================================
# Dieses Skript automatisiert die Einrichtung der Website auf einem Windows-PC
# ============================================================================

$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "Kernel Website - Setup"

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

function Write-Step {
    param([string]$msg)
    Write-Host ""
    Write-Host ">>> $msg" -ForegroundColor Magenta
}

# ============================================================================
# Konfiguration laden/speichern
# ============================================================================

function Get-Config {
    if (Test-Path $ConfigFile) {
        try {
            $content = Get-Content $ConfigFile -Raw -ErrorAction Stop
            $parsed = $content | ConvertFrom-Json
            return $parsed
        } catch {
            Write-Warn "Config-Datei beschaedigt, verwende Standardwerte"
        }
    }
    
    $defaultConfig = [PSCustomObject]@{
        tunnelName = "kernel-website"
        domain = "kernel.gmbh"
        port = 3000
        autoPull = $false
        lastBuild = $null
    }
    return $defaultConfig
}

function Save-Config {
    param($config)
    $config | ConvertTo-Json -Depth 10 | Set-Content $ConfigFile -Encoding UTF8
}

# ============================================================================
# Dependency Check
# ============================================================================

function Test-Command {
    param([string]$cmd)
    $result = Get-Command $cmd -ErrorAction SilentlyContinue
    return ($null -ne $result)
}

function Install-Dependency {
    param([string]$name, [string]$wingetId)
    
    Write-Info "Installiere $name..."
    
    if (-not (Test-Command "winget")) {
        Write-Err "winget nicht gefunden! Bitte installiere den App Installer aus dem Microsoft Store."
        Write-Warn "Alternativ: Installiere $name manuell und fuehre das Setup erneut aus."
        return $false
    }
    
    try {
        $process = Start-Process -FilePath "winget" -ArgumentList "install", "--id", $wingetId, "--silent", "--accept-source-agreements", "--accept-package-agreements" -Wait -PassThru -NoNewWindow
        if ($process.ExitCode -eq 0) {
            Write-Success "$name erfolgreich installiert!"
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
            return $true
        } else {
            Write-Err "Installation von $name fehlgeschlagen (Exit Code: $($process.ExitCode))"
            return $false
        }
    } catch {
        Write-Err "Fehler bei Installation: $_"
        return $false
    }
}

function Check-Dependencies {
    Write-Step "Pruefe Dependencies..."
    
    $allInstalled = $true
    
    # Git
    if (Test-Command "git") {
        $gitVersion = (git --version) -replace "git version ", ""
        Write-Success "Git gefunden (v$gitVersion)"
    } else {
        Write-Warn "Git nicht gefunden"
        if (-not (Install-Dependency "Git" "Git.Git")) {
            $allInstalled = $false
        }
    }
    
    # Node.js
    if (Test-Command "node") {
        $nodeVersion = (node --version)
        Write-Success "Node.js gefunden ($nodeVersion)"
    } else {
        Write-Warn "Node.js nicht gefunden"
        if (-not (Install-Dependency "Node.js" "OpenJS.NodeJS.LTS")) {
            $allInstalled = $false
        }
    }
    
    # NPM
    if (Test-Command "npm") {
        $npmVersion = (npm --version)
        Write-Success "NPM gefunden (v$npmVersion)"
    } else {
        Write-Warn "NPM nicht gefunden (sollte mit Node.js kommen)"
        $allInstalled = $false
    }
    
    # Cloudflared
    if (Test-Command "cloudflared") {
        $cfVersion = (cloudflared --version 2>&1) -replace "cloudflared version ", "" -split " " | Select-Object -First 1
        Write-Success "Cloudflared gefunden ($cfVersion)"
    } else {
        Write-Warn "Cloudflared nicht gefunden"
        if (-not (Install-Dependency "Cloudflare Tunnel" "Cloudflare.cloudflared")) {
            $allInstalled = $false
        }
    }
    
    return $allInstalled
}

# ============================================================================
# Git Operations
# ============================================================================

function Do-GitPull {
    Write-Step "Git Pull..."
    
    Set-Location $ProjectDir
    
    if (-not (Test-Path ".git")) {
        Write-Err "Kein Git-Repository gefunden!"
        return $false
    }
    
    $status = git status --porcelain
    if ($status) {
        Write-Warn "Lokale Aenderungen gefunden:"
        git status --short
        Write-Host ""
        Write-Host "Was moechtest du tun?" -ForegroundColor Yellow
        Write-Host "[1] Stash - Aenderungen temporaer speichern, Pull, dann wiederherstellen"
        Write-Host "[2] Reset - Alle lokalen Aenderungen verwerfen (DATENVERLUST!)"
        Write-Host "[3] Abbrechen - Pull ueberspringen"
        
        $choice = Read-Host "Auswahl (1/2/3)"
        
        switch ($choice) {
            "1" {
                Write-Info "Stashe Aenderungen..."
                git stash
                git pull
                Write-Info "Stelle Aenderungen wieder her..."
                git stash pop
            }
            "2" {
                Write-Warn "Verwerfe alle lokalen Aenderungen..."
                git checkout .
                git clean -fd
                git pull
            }
            "3" {
                Write-Info "Pull uebersprungen"
                return $true
            }
            default {
                Write-Info "Pull uebersprungen"
                return $true
            }
        }
    } else {
        git pull
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Git Pull erfolgreich!"
        return $true
    } else {
        Write-Err "Git Pull fehlgeschlagen!"
        return $false
    }
}

# ============================================================================
# Build Operations
# ============================================================================

function Do-NpmInstall {
    Write-Step "NPM Install..."
    
    Set-Location $ProjectDir
    
    npm install 2>&1 | ForEach-Object { Write-Host $_ }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installiert!"
        return $true
    } else {
        Write-Err "npm install fehlgeschlagen!"
        return $false
    }
}

function Do-Build {
    Write-Step "Build erstellen..."
    
    Set-Location $ProjectDir
    
    npm run build 2>&1 | ForEach-Object { Write-Host $_ }
    
    if (($LASTEXITCODE -eq 0) -and (Test-Path "dist")) {
        Write-Success "Build erfolgreich!"
        
        $config = Get-Config
        $config.lastBuild = (Get-Date).ToString("o")
        Save-Config $config
        
        return $true
    } else {
        Write-Err "Build fehlgeschlagen!"
        Write-Host ""
        Write-Host "Moegliche Loesungen:" -ForegroundColor Yellow
        Write-Host "1. node_modules loeschen und npm install erneut ausfuehren"
        Write-Host "2. npm cache clean --force"
        Write-Host ""
        
        $retry = Read-Host "Retry mit clean install? (j/n)"
        if (($retry -eq "j") -or ($retry -eq "J")) {
            Write-Info "Loesche node_modules..."
            Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
            Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
            
            $installOk = Do-NpmInstall
            if ($installOk) {
                $buildOk = Do-Build
                return $buildOk
            }
        }
        
        return $false
    }
}

# ============================================================================
# Cloudflare Tunnel
# ============================================================================

function Test-TunnelLogin {
    $cfDir = Join-Path $env:USERPROFILE ".cloudflared"
    $certPath = Join-Path $cfDir "cert.pem"
    return (Test-Path $certPath)
}

function Get-TunnelList {
    try {
        $output = cloudflared tunnel list 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $output
        }
    } catch { }
    return $null
}

function Setup-CloudflareTunnel {
    Write-Step "Cloudflare Tunnel konfigurieren..."
    
    $config = Get-Config
    
    if (-not (Test-TunnelLogin)) {
        Write-Warn "Nicht bei Cloudflare angemeldet"
        Write-Info "Oeffne Browser fuer Login..."
        cloudflared tunnel login
        
        if (-not (Test-TunnelLogin)) {
            Write-Err "Login fehlgeschlagen!"
            return $false
        }
        Write-Success "Login erfolgreich!"
    } else {
        Write-Success "Bereits bei Cloudflare angemeldet"
    }
    
    $tunnels = Get-TunnelList
    $tunnelExists = $false
    if ($tunnels) {
        $tunnelExists = $tunnels -match $config.tunnelName
    }
    
    if (-not $tunnelExists) {
        Write-Info "Erstelle Tunnel '$($config.tunnelName)'..."
        cloudflared tunnel create $config.tunnelName
        
        if ($LASTEXITCODE -ne 0) {
            Write-Err "Tunnel-Erstellung fehlgeschlagen!"
            return $false
        }
        Write-Success "Tunnel erstellt!"
        
        Write-Info "Fuege DNS-Route hinzu..."
        cloudflared tunnel route dns $config.tunnelName $config.domain
        cloudflared tunnel route dns $config.tunnelName "www.$($config.domain)"
    } else {
        Write-Success "Tunnel '$($config.tunnelName)' existiert bereits"
    }
    
    $cfDir = Join-Path $env:USERPROFILE ".cloudflared"
    $cfConfig = Join-Path $cfDir "config.yml"
    
    $credFile = Get-ChildItem $cfDir -Filter "*.json" -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "^[a-f0-9-]+\.json$" } | Select-Object -First 1
    
    if ($credFile) {
        $configLines = @(
            "tunnel: $($config.tunnelName)",
            "credentials-file: $($credFile.FullName)",
            "",
            "ingress:",
            "  - hostname: $($config.domain)",
            "    service: http://localhost:$($config.port)",
            "  - hostname: www.$($config.domain)",
            "    service: http://localhost:$($config.port)",
            "  - service: http_status:404"
        )
        $configLines -join "`n" | Set-Content $cfConfig -Encoding UTF8
        Write-Success "Tunnel-Konfiguration erstellt: $cfConfig"
    } else {
        Write-Warn "Credentials-Datei nicht gefunden. Bitte config.yml manuell erstellen."
    }
    
    return $true
}

# ============================================================================
# Server Start
# ============================================================================

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

function Start-Server {
    Write-Step "Server starten..."
    
    Set-Location $ProjectDir
    $config = Get-Config
    
    if (-not (Test-Path "dist")) {
        Write-Warn "Build nicht gefunden!"
        $buildOk = Do-Build
        if (-not $buildOk) {
            return $false
        }
    }
    
    if (Test-PortInUse $config.port) {
        Write-Warn "Port $($config.port) ist bereits belegt!"
        $stopped = Stop-ProcessOnPort $config.port
        if (-not $stopped) {
            Write-Err "Server kann nicht gestartet werden - Port belegt"
            return $false
        }
    }
    
    Write-Info "Starte Node.js Server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectDir'; node server.js" -WindowStyle Normal
    
    Start-Sleep -Seconds 2
    
    Write-Info "Starte Cloudflare Tunnel..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel run $($config.tunnelName)" -WindowStyle Normal
    
    Start-Sleep -Seconds 3
    
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "              SERVER LAEUFT ERFOLGREICH!                        " -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "  Lokal:      http://localhost:$($config.port)" -ForegroundColor Green
    Write-Host "  Tunnel:     https://$($config.domain)" -ForegroundColor Green
    Write-Host "  Admin:      https://$($config.domain)/admin/login" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "  Server-Fenster und Tunnel-Fenster offen lassen!" -ForegroundColor Green
    Write-Host "  Zum Stoppen: Beide Fenster schliessen (oder Ctrl+C)" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    
    return $true
}

# ============================================================================
# .env Management
# ============================================================================

function Setup-EnvFile {
    Write-Step ".env Datei konfigurieren..."
    
    Set-Location $ProjectDir
    $envFile = Join-Path $ProjectDir ".env"
    $envExample = Join-Path $ProjectDir ".env.example"
    
    if (-not (Test-Path $envFile)) {
        if (Test-Path $envExample) {
            Copy-Item $envExample $envFile
            Write-Info ".env aus .env.example erstellt"
        } else {
            $envContent = "# Notion Integration`nNOTION_API_TOKEN=`nNOTION_DATABASE_ID="
            $envContent | Set-Content $envFile -Encoding UTF8
            Write-Info ".env Datei erstellt"
        }
    }
    
    Write-Host ""
    Write-Host "Aktuelle .env Datei:" -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "=.+") {
            $parts = $_ -split "=", 2
            Write-Host "$($parts[0])=****" -ForegroundColor Gray
        } else {
            Write-Host $_ -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    $edit = Read-Host "In Editor oeffnen? (j/n)"
    if (($edit -eq "j") -or ($edit -eq "J")) {
        Start-Process notepad $envFile -Wait
        Write-Success ".env Datei aktualisiert"
    }
}

# ============================================================================
# Vollstaendiges Setup
# ============================================================================

function Do-FullSetup {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "          VOLLSTAENDIGES SETUP WIRD GESTARTET                   " -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    
    $depsOk = Check-Dependencies
    if (-not $depsOk) {
        Write-Err "Nicht alle Dependencies konnten installiert werden!"
        Write-Warn "Bitte installiere fehlende Software manuell und fuehre das Setup erneut aus."
        return
    }
    
    Write-Host ""
    $pull = Read-Host "Git Pull ausfuehren? (j/n)"
    if (($pull -eq "j") -or ($pull -eq "J")) {
        Do-GitPull
    }
    
    $installOk = Do-NpmInstall
    if (-not $installOk) {
        Write-Err "NPM Install fehlgeschlagen!"
        return
    }
    
    $buildOk = Do-Build
    if (-not $buildOk) {
        Write-Err "Build fehlgeschlagen!"
        return
    }
    
    Write-Host ""
    $tunnel = Read-Host "Cloudflare Tunnel einrichten? (j/n)"
    if (($tunnel -eq "j") -or ($tunnel -eq "J")) {
        Setup-CloudflareTunnel
    }
    
    Write-Host ""
    $start = Read-Host "Server jetzt starten? (j/n)"
    if (($start -eq "j") -or ($start -eq "J")) {
        Start-Server
    }
    
    Write-Host ""
    Write-Success "Setup abgeschlossen!"
}

# ============================================================================
# Hauptmenue
# ============================================================================

function Show-Menu {
    Clear-Host
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "           KERNEL WEBSITE - SETUP WIZARD                        " -ForegroundColor Cyan
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1] Vollstaendiges Setup (Erstinstallation)" -ForegroundColor White
    Write-Host "  [2] Nur Dependencies pruefen/installieren" -ForegroundColor White
    Write-Host "  [3] Git Pull + Build (Update)" -ForegroundColor White
    Write-Host "  [4] Server starten (Quick-Start)" -ForegroundColor White
    Write-Host "  [5] Cloudflare Tunnel konfigurieren" -ForegroundColor White
    Write-Host "  [6] .env Datei erstellen/bearbeiten" -ForegroundColor White
    Write-Host ""
    Write-Host "  [0] Beenden" -ForegroundColor Gray
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host ""
}

# ============================================================================
# Main - Programmeinstieg
# ============================================================================

Set-Location $ProjectDir

while ($true) {
    Show-Menu
    $choice = Read-Host "Auswahl"
    
    switch ($choice) {
        "1" { 
            Do-FullSetup 
        }
        "2" { 
            Check-Dependencies
            Read-Host "`nWeiter mit Enter"
        }
        "3" { 
            Do-GitPull
            Do-NpmInstall
            Do-Build
            Read-Host "`nWeiter mit Enter"
        }
        "4" { 
            Start-Server
            Read-Host "`nWeiter mit Enter"
        }
        "5" { 
            Setup-CloudflareTunnel
            Read-Host "`nWeiter mit Enter"
        }
        "6" { 
            Setup-EnvFile
            Read-Host "`nWeiter mit Enter"
        }
        "0" { 
            Write-Host "`nAuf Wiedersehen!" -ForegroundColor Cyan
            exit 0
        }
        default { 
            Write-Warn "Ungueltige Auswahl"
            Start-Sleep -Seconds 1
        }
    }
}
