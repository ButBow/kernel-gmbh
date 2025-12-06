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
    # Standardwerte als verschachtelte Struktur (wie config.json)
    $defaultConfig = [PSCustomObject]@{
        chatbot = [PSCustomObject]@{
            port = 8001
            ollama_url = "http://localhost:11434"
            ollama_model = "llama3.2:latest"
            max_tokens = 1024
            temperature = 0.7
        }
        server = [PSCustomObject]@{
            port = 3000
        }
        tunnel = [PSCustomObject]@{
            name = "meine-website"
            domain = $null
        }
        autoPull = $false
        lastBuild = $null
    }
    
    if (Test-Path $ConfigFile) {
        try {
            $content = Get-Content $ConfigFile -Raw -ErrorAction Stop
            $parsed = $content | ConvertFrom-Json
            
            # Merge mit Defaults (fehlende Eigenschaften ergänzen)
            if ($parsed.chatbot) { $defaultConfig.chatbot = $parsed.chatbot }
            if ($parsed.server) { $defaultConfig.server = $parsed.server }
            if ($parsed.tunnel) { $defaultConfig.tunnel = $parsed.tunnel }
            if ($null -ne $parsed.autoPull) { $defaultConfig.autoPull = $parsed.autoPull }
            if ($parsed.lastBuild) { $defaultConfig.lastBuild = $parsed.lastBuild }
            
            return $defaultConfig
        } catch {
            Write-Warn "Config-Datei beschaedigt, verwende Standardwerte"
        }
    }
    
    return $defaultConfig
}

# Hilfsfunktion für einfachen Zugriff auf Config-Werte
function Get-ConfigValue {
    param($config, [string]$path)
    switch ($path) {
        "port" { return $config.server.port }
        "domain" { return $config.tunnel.domain }
        "tunnelName" { return $config.tunnel.name }
        "chatbotPort" { return $config.chatbot.port }
        default { return $null }
    }
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
# Git Operations - Robuste Version mit Konflikt-Handling
# ============================================================================

function Test-GitConflicts {
    # Prüft auf unmerged files (Merge-Konflikte)
    $unmerged = git ls-files -u 2>&1
    return ($unmerged -and $unmerged.Length -gt 0)
}

function Resolve-GitConflicts {
    Write-Warn "Merge-Konflikte gefunden!"
    Write-Host ""
    Write-Host "Konflikt-Dateien:" -ForegroundColor Yellow
    git diff --name-only --diff-filter=U 2>&1 | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "Optionen:" -ForegroundColor Yellow
    Write-Host "[1] Remote-Version uebernehmen (deine lokalen Aenderungen in diesen Dateien verwerfen)"
    Write-Host "[2] Lokale Version behalten (Remote-Aenderungen in diesen Dateien ignorieren)"
    Write-Host "[3] Alles zuruecksetzen auf Remote (ALLE lokalen Aenderungen verwerfen)"
    Write-Host "[4] Abbrechen"
    
    $choice = Read-Host "Auswahl (1/2/3/4)"
    
    switch ($choice) {
        "1" {
            Write-Info "Uebernehme Remote-Versionen..."
            git checkout --theirs . 2>&1 | Out-Null
            git add -A 2>&1 | Out-Null
            return $true
        }
        "2" {
            Write-Info "Behalte lokale Versionen..."
            git checkout --ours . 2>&1 | Out-Null
            git add -A 2>&1 | Out-Null
            return $true
        }
        "3" {
            Write-Info "Setze auf Remote-Stand zurueck..."
            git fetch origin 2>&1 | Out-Null
            git reset --hard origin/main 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) {
                git reset --hard origin/master 2>&1 | Out-Null
            }
            return $true
        }
        default {
            return $false
        }
    }
}

function Do-GitPull {
    Write-Step "Git Pull..."
    
    Set-Location $ProjectDir
    
    if (-not (Test-Path ".git")) {
        Write-Err "Kein Git-Repository gefunden!"
        return $false
    }
    
    # Prüfe zuerst auf bestehende Merge-Konflikte
    if (Test-GitConflicts) {
        $resolved = Resolve-GitConflicts
        if (-not $resolved) {
            Write-Warn "Pull abgebrochen"
            return $false
        }
    }
    
    # Prüfe auf lokale Änderungen
    $status = git status --porcelain 2>&1
    $hasChanges = ($status -and $status.Length -gt 0)
    
    if ($hasChanges) {
        Write-Warn "Lokale Aenderungen gefunden:"
        git status --short
        Write-Host ""
        Write-Host "Was moechtest du tun?" -ForegroundColor Yellow
        Write-Host "[1] Stash - Aenderungen temporaer speichern, Pull, dann wiederherstellen"
        Write-Host "[2] Reset - Auf Remote-Stand zuruecksetzen (lokale Aenderungen verwerfen)"
        Write-Host "[3] Abbrechen - Pull ueberspringen"
        
        $choice = Read-Host "Auswahl (1/2/3)"
        
        switch ($choice) {
            "1" {
                Write-Info "Stashe Aenderungen..."
                git stash push -m "auto-stash-$(Get-Date -Format 'yyyyMMdd-HHmmss')" 2>&1 | Out-Null
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Err "Stash fehlgeschlagen - versuche Hard Reset"
                    $resetChoice = Read-Host "Hard Reset auf Remote? (j/n)"
                    if ($resetChoice -eq "j") {
                        git fetch origin 2>&1 | Out-Null
                        git reset --hard origin/main 2>&1 | Out-Null
                        if ($LASTEXITCODE -ne 0) {
                            git reset --hard origin/master 2>&1 | Out-Null
                        }
                        Write-Success "Reset erfolgreich"
                        return $true
                    }
                    return $false
                }
                
                Write-Success "Aenderungen gesichert"
                
                # Pull ausführen
                Write-Info "Fuehre Pull aus..."
                git pull 2>&1 | ForEach-Object { Write-Host $_ }
                $pullSuccess = ($LASTEXITCODE -eq 0)
                
                if ($pullSuccess) {
                    Write-Success "Pull erfolgreich"
                    
                    # Stash wiederherstellen
                    Write-Info "Stelle gesicherte Aenderungen wieder her..."
                    $stashResult = git stash pop 2>&1
                    
                    if ($LASTEXITCODE -ne 0) {
                        Write-Warn "Automatische Wiederherstellung fehlgeschlagen (Konflikt)"
                        Write-Host "Deine Aenderungen sind gespeichert. Zeige mit: git stash list" -ForegroundColor Yellow
                        Write-Host "Wiederherstellen mit: git stash pop" -ForegroundColor Yellow
                    } else {
                        Write-Success "Aenderungen wiederhergestellt"
                    }
                } else {
                    Write-Err "Pull fehlgeschlagen"
                    Write-Info "Stelle Aenderungen wieder her..."
                    git stash pop 2>&1 | Out-Null
                    return $false
                }
            }
            "2" {
                Write-Warn "Setze auf Remote-Stand zurueck..."
                git fetch origin 2>&1 | Out-Null
                git reset --hard origin/main 2>&1 | Out-Null
                if ($LASTEXITCODE -ne 0) {
                    # Fallback auf master branch
                    git reset --hard origin/master 2>&1 | Out-Null
                }
                git clean -fd 2>&1 | Out-Null
                Write-Success "Reset erfolgreich"
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
        # Keine lokalen Änderungen - einfacher Pull
        Write-Info "Keine lokalen Aenderungen, fuehre Pull aus..."
        git pull 2>&1 | ForEach-Object { Write-Host $_ }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Git Pull erfolgreich!"
        return $true
    } else {
        # Nochmal prüfen ob es Konflikte gibt
        if (Test-GitConflicts) {
            Write-Warn "Konflikte nach Pull erkannt"
            $resolved = Resolve-GitConflicts
            return $resolved
        }
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
    # Shortcuts für einfacheren Zugriff
    $domain = $config.tunnel.domain
    $tunnelName = $config.tunnel.name
    $port = $config.server.port
    
    # Pruefen ob Domain konfiguriert ist - wenn nicht, abfragen
    if (-not $domain -or $domain -eq "") {
        Write-Warn "Keine Domain konfiguriert!"
        Write-Host ""
        Write-Host "Bitte gib deine Domain ein (z.B. meine-seite.ch oder subdomain.meine-seite.ch):" -ForegroundColor Yellow
        $newDomain = Read-Host "Domain"
        
        if (-not $newDomain -or $newDomain -eq "") {
            Write-Err "Domain ist erforderlich fuer den Tunnel!"
            return $false
        }
        
        $domain = $newDomain
        $config.tunnel.domain = $newDomain
        
        # Tunnel-Name aus Domain generieren
        $tunnelName = $newDomain -replace "\.", "-"
        $config.tunnel.name = $tunnelName
        
        Save-Config $config
        Write-Success "Domain '$newDomain' gespeichert (Tunnel: $tunnelName)"
    }
    
    if (-not (Test-TunnelLogin)) {
        Write-Warn "Nicht bei Cloudflare angemeldet"
        Write-Info "Oeffne Browser fuer Login..."
        Write-Host ""
        Write-Host "WICHTIG: Der Browser oeffnet sich gleich." -ForegroundColor Yellow
        Write-Host "         Waehle dort die Zone (Domain), die du nutzen moechtest." -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds 2
        
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
        $tunnelExists = $tunnels -match $tunnelName
    }
    
    if (-not $tunnelExists) {
        Write-Info "Erstelle Tunnel '$tunnelName'..."
        cloudflared tunnel create $tunnelName
        
        if ($LASTEXITCODE -ne 0) {
            Write-Err "Tunnel-Erstellung fehlgeschlagen!"
            Write-Host "  Moegliche Ursache: Tunnel mit diesem Namen existiert bereits." -ForegroundColor Yellow
            Write-Host "  Loesung: cloudflared tunnel delete $tunnelName" -ForegroundColor Yellow
            return $false
        }
        Write-Success "Tunnel erstellt!"
        
        Write-Info "Setze DNS-Routen..."
        Write-Host "  Route: $domain -> Tunnel" -ForegroundColor Cyan
        cloudflared tunnel route dns $tunnelName $domain 2>&1 | Out-Null
        
        Write-Host "  Route: www.$domain -> Tunnel" -ForegroundColor Cyan
        cloudflared tunnel route dns $tunnelName "www.$domain" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "DNS-Routen gesetzt!"
        } else {
            Write-Warn "DNS-Routen konnten nicht vollstaendig gesetzt werden."
            Write-Host "  Die Domain muss bei Cloudflare verwaltet werden!" -ForegroundColor Yellow
        }
    } else {
        Write-Success "Tunnel '$tunnelName' existiert bereits"
    }
    
    $cfDir = Join-Path $env:USERPROFILE ".cloudflared"
    $cfConfig = Join-Path $cfDir "config.yml"
    
    $credFile = Get-ChildItem $cfDir -Filter "*.json" -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "^[a-f0-9-]+\.json$" } | Select-Object -First 1
    
    if ($credFile) {
        $tunnelId = $credFile.BaseName
        
        $configLines = @(
            "tunnel: $tunnelId",
            "credentials-file: $($credFile.FullName)",
            "",
            "ingress:",
            "  - hostname: $domain",
            "    service: http://localhost:$port",
            "  - hostname: www.$domain",
            "    service: http://localhost:$port",
            "  - service: http_status:404"
        )
        $configLines -join "`n" | Set-Content $cfConfig -Encoding UTF8
        Write-Success "Tunnel-Konfiguration erstellt mit UUID: $tunnelId"
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
    # Shortcuts
    $port = $config.server.port
    $domain = $config.tunnel.domain
    $tunnelName = $config.tunnel.name
    $chatbotPort = $config.chatbot.port
    $ollamaUrl = $config.chatbot.ollama_url
    
    if (-not (Test-Path "dist")) {
        Write-Warn "Build nicht gefunden!"
        $buildOk = Do-Build
        if (-not $buildOk) {
            return $false
        }
    }
    
    # Ports prüfen und freigeben
    if (Test-PortInUse $port) {
        Write-Warn "Port $port ist bereits belegt!"
        $stopped = Stop-ProcessOnPort $port
        if (-not $stopped) {
            Write-Err "Server kann nicht gestartet werden - Port belegt"
            return $false
        }
    }
    
    if (Test-PortInUse $chatbotPort) {
        Write-Info "Raeume Chatbot-Port $chatbotPort frei..."
        Stop-ProcessOnPort $chatbotPort | Out-Null
    }
    
    # --- Ollama starten (falls nicht läuft) ---
    $ollamaRunning = $false
    try {
        $ollamaTest = Invoke-RestMethod -Uri "$ollamaUrl/api/tags" -TimeoutSec 2 -ErrorAction SilentlyContinue
        $ollamaRunning = $true
    } catch { }
    
    if (-not $ollamaRunning) {
        if (Test-Command "ollama") {
            Write-Info "Starte Ollama..."
            Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Ollama Server'
Write-Host '═══════════════════════════════════════' -ForegroundColor Blue
Write-Host '  OLLAMA SERVER' -ForegroundColor Blue
Write-Host '═══════════════════════════════════════' -ForegroundColor Blue
Write-Host ''
ollama serve
"@ -WindowStyle Normal
            Start-Sleep -Seconds 3
        } else {
            Write-Warn "Ollama nicht installiert - Chatbot funktioniert ohne KI"
        }
    } else {
        Write-Success "Ollama laeuft bereits"
    }
    
    # --- Node.js Server ---
    Write-Info "Starte Node.js Server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Node.js Server'
cd '$ProjectDir'
Write-Host '═══════════════════════════════════════' -ForegroundColor Green
Write-Host '  NODE.JS SERVER - Port $port' -ForegroundColor Green
Write-Host '═══════════════════════════════════════' -ForegroundColor Green
Write-Host ''
node server.js
"@ -WindowStyle Normal
    Start-Sleep -Seconds 2
    
    # --- Python Chatbot ---
    $pythonCmd = if (Test-Command "python") { "python" } elseif (Test-Command "python3") { "python3" } else { $null }
    $chatbotScript = Join-Path $ScriptDir "chatbot_server.py"
    
    if ($pythonCmd -and (Test-Path $chatbotScript)) {
        Write-Info "Starte Python Chatbot Server..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Chatbot Server'
cd '$ProjectDir'
Write-Host '═══════════════════════════════════════' -ForegroundColor Magenta
Write-Host '  CHATBOT SERVER - Port $chatbotPort' -ForegroundColor Magenta
Write-Host '═══════════════════════════════════════' -ForegroundColor Magenta
Write-Host ''
$pythonCmd '$chatbotScript'
"@ -WindowStyle Normal
        Start-Sleep -Seconds 2
    } else {
        if (-not $pythonCmd) {
            Write-Warn "Python nicht gefunden - Chatbot wird nicht gestartet"
        } elseif (-not (Test-Path $chatbotScript)) {
            Write-Warn "Chatbot-Skript nicht gefunden: $chatbotScript"
        }
    }
    
    # --- Cloudflare Tunnel ---
    if (Test-Command "cloudflared") {
        Write-Info "Starte Cloudflare Tunnel..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
`$Host.UI.RawUI.WindowTitle = 'Cloudflare Tunnel'
Write-Host '═══════════════════════════════════════' -ForegroundColor Cyan
Write-Host '  CLOUDFLARE TUNNEL' -ForegroundColor Cyan
Write-Host '═══════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
cloudflared tunnel run $tunnelName
"@ -WindowStyle Normal
        Start-Sleep -Seconds 2
    } else {
        Write-Warn "Cloudflared nicht installiert - kein Tunnel"
    }
    
    # --- Status anzeigen ---
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "              ALLE DIENSTE GESTARTET!                           " -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "  Website:    http://localhost:$port" -ForegroundColor White
    
    if ($domain) {
        Write-Host "  Public:     https://$domain" -ForegroundColor White
        Write-Host "  Admin:      https://$domain/admin/login" -ForegroundColor White
    }
    
    if ($pythonCmd -and (Test-Path $chatbotScript)) {
        Write-Host "  Chatbot:    http://localhost:$chatbotPort" -ForegroundColor White
    }
    
    if ($ollamaRunning -or (Test-Command "ollama")) {
        Write-Host "  Ollama:     $ollamaUrl" -ForegroundColor White
    }
    
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "  Alle Fenster offen lassen!" -ForegroundColor Yellow
    Write-Host "  Zum Stoppen: Fenster schliessen oder Ctrl+C" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
    
    # Browser öffnen Option
    $openBrowser = Read-Host "Browser oeffnen? (j=lokal, p=public, n=nein)"
    switch ($openBrowser.ToLower()) {
        "j" { 
            Start-Process "http://localhost:$port"
            Write-Success "Browser geoeffnet (lokal)"
        }
        "p" { 
            if ($domain) {
                Start-Process "https://$domain"
                Write-Success "Browser geoeffnet (public)"
            } else {
                Write-Warn "Keine Domain konfiguriert"
            }
        }
    }
    
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
# Konfiguration bearbeiten
# ============================================================================

function Apply-ConfigChanges {
    param($config)
    
    Write-Step "Konfigurationsaenderungen anwenden..."
    
    # Shortcuts
    $port = $config.server.port
    $domain = $config.tunnel.domain
    $tunnelName = $config.tunnel.name
    
    # 1. config.json speichern
    Save-Config $config
    Write-Success "config.json aktualisiert"
    
    # 2. Cloudflare config.yml aktualisieren (falls vorhanden)
    $cfDir = Join-Path $env:USERPROFILE ".cloudflared"
    $cfConfig = Join-Path $cfDir "config.yml"
    
    if (Test-Path $cfConfig) {
        Write-Info "Aktualisiere Cloudflare config.yml..."
        
        # Lese aktuelle Tunnel-ID aus bestehender config.yml
        $existingContent = Get-Content $cfConfig -Raw
        $tunnelId = $null
        $credFile = $null
        
        if ($existingContent -match "tunnel:\s*([a-f0-9-]+)") {
            $tunnelId = $Matches[1]
        }
        if ($existingContent -match "credentials-file:\s*(.+)") {
            $credFile = $Matches[1].Trim()
        }
        
        if ($tunnelId -and $credFile) {
            $newConfig = @"
tunnel: $tunnelId
credentials-file: $credFile

ingress:
  - hostname: $domain
    service: http://localhost:$port
  - hostname: www.$domain
    service: http://localhost:$port
  - service: http_status:404
"@
            $newConfig | Set-Content $cfConfig -Encoding UTF8
            Write-Success "config.yml aktualisiert mit neuer Domain/Port"
            
            # DNS-Routen automatisch setzen
            Write-Warn "Bei Domain-Aenderung muessen DNS-Routen neu gesetzt werden."
            $setDns = Read-Host "DNS-Routen automatisch setzen? (j/n)"
            if (($setDns -eq "j") -or ($setDns -eq "J")) {
                if (-not (Test-TunnelLogin)) {
                    Write-Warn "Nicht bei Cloudflare angemeldet!"
                    $login = Read-Host "Jetzt anmelden? (j/n)"
                    if (($login -eq "j") -or ($login -eq "J")) {
                        cloudflared tunnel login
                    } else {
                        Write-Warn "DNS-Routen uebersprungen (nicht angemeldet)"
                        return
                    }
                }
                
                Write-Info "Setze DNS-Route fuer $domain..."
                cloudflared tunnel route dns $tunnelId $domain 2>&1 | Out-Null
                
                Write-Info "Setze DNS-Route fuer www.$domain..."
                cloudflared tunnel route dns $tunnelId "www.$domain" 2>&1 | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "DNS-Routen erfolgreich gesetzt!"
                } else {
                    Write-Warn "DNS-Routen konnten nicht vollstaendig gesetzt werden."
                    Write-Host "  Manuell: cloudflared tunnel route dns $tunnelId $domain" -ForegroundColor Yellow
                }
            } else {
                Write-Host "  Manuell: cloudflared tunnel route dns $tunnelId $domain" -ForegroundColor Yellow
                Write-Host "  Manuell: cloudflared tunnel route dns $tunnelId www.$domain" -ForegroundColor Yellow
            }
        } else {
            Write-Warn "Konnte Tunnel-ID nicht aus config.yml lesen"
        }
    } else {
        Write-Info "Keine config.yml gefunden - wird bei Tunnel-Setup erstellt"
    }
    
    # 3. .env Datei pruefen/aktualisieren (PORT)
    $envPath = Join-Path $ProjectDir ".env"
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath -Raw
        if ($envContent -match "PORT=\d+") {
            $envContent = $envContent -replace "PORT=\d+", "PORT=$port"
            $envContent | Set-Content $envPath -Encoding UTF8
            Write-Success ".env PORT aktualisiert"
        }
    }
    
    Write-Host ""
    Write-Success "Alle Konfigurationen aktualisiert!"
    Write-Host ""
    Write-Host "Zusammenfassung:" -ForegroundColor Cyan
    Write-Host "  Port:         $port" -ForegroundColor White
    Write-Host "  Domain:       $domain" -ForegroundColor White
    Write-Host "  Tunnel-Name:  $tunnelName" -ForegroundColor White
    Write-Host "  Auto-Pull:    $($config.autoPull)" -ForegroundColor White
    Write-Host ""
    Write-Host "  Lokaler Zugriff:       http://localhost:$port" -ForegroundColor Green
    Write-Host "  Oeffentlicher Zugriff: https://$domain" -ForegroundColor Green
}

function Edit-Configuration {
    $config = Get-Config
    
    while ($true) {
        # Shortcuts für Anzeige
        $port = $config.server.port
        $domain = $config.tunnel.domain
        $tunnelName = $config.tunnel.name
        
        Clear-Host
        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Cyan
        Write-Host "           SERVER-EINSTELLUNGEN                                 " -ForegroundColor Cyan
        Write-Host "================================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Aktuelle Konfiguration:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  [1] Port:         $port" -ForegroundColor White
        Write-Host "  [2] Domain:       $domain" -ForegroundColor White
        Write-Host "  [3] Tunnel-Name:  $tunnelName" -ForegroundColor White
        Write-Host "  [4] Auto-Pull:    $($config.autoPull)" -ForegroundColor White
        Write-Host ""
        Write-Host "  [5] Alle Einstellungen anwenden" -ForegroundColor Green
        Write-Host "  [0] Zurueck zum Hauptmenue" -ForegroundColor Gray
        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Cyan
        
        $choice = Read-Host "Was moechtest du aendern?"
        
        switch ($choice) {
            "1" {
                $newPort = Read-Host "Neuer Port (aktuell: $port)"
                if ($newPort -match '^\d+$') {
                    $config.server.port = [int]$newPort
                    Save-Config $config
                    Write-Success "Port geaendert auf $newPort"
                } else {
                    Write-Err "Ungueltiger Port!"
                }
                Start-Sleep -Seconds 1
            }
            "2" {
                Write-Host ""
                Write-Host "Aktuelle Domain: $domain" -ForegroundColor Yellow
                Write-Host "Aktueller Tunnel: $tunnelName" -ForegroundColor Yellow
                Write-Host ""
                $newDomain = Read-Host "Neue Domain (z.B. meine-seite.ch)"
                if ($newDomain -and $newDomain.Length -gt 0) {
                    $config.tunnel.domain = $newDomain
                    
                    # Tunnel-Name aus neuer Domain generieren
                    $suggestedTunnelName = $newDomain -replace "\.", "-"
                    Write-Host ""
                    Write-Host "Vorgeschlagener Tunnel-Name: $suggestedTunnelName" -ForegroundColor Cyan
                    $useSuggested = Read-Host "Tunnel-Namen anpassen? (j/n)"
                    
                    if (($useSuggested -eq "j") -or ($useSuggested -eq "J")) {
                        $config.tunnel.name = $suggestedTunnelName
                        Write-Success "Tunnel-Name geaendert auf $suggestedTunnelName"
                    }
                    
                    Save-Config $config
                    Write-Success "Domain geaendert auf $newDomain"
                    
                    # Fragen ob neuer Tunnel erstellt werden soll
                    Write-Host ""
                    Write-Warn "Bei Domain-Aenderung wird ein neuer Cloudflare-Tunnel benoetigt!"
                    $createTunnel = Read-Host "Neuen Tunnel jetzt erstellen? (j/n)"
                    
                    if (($createTunnel -eq "j") -or ($createTunnel -eq "J")) {
                        Setup-CloudflareTunnel
                    } else {
                        Write-Host ""
                        Write-Host "Manuelle Schritte:" -ForegroundColor Yellow
                        Write-Host "  1. cloudflared tunnel create $($config.tunnel.name)" -ForegroundColor Yellow
                        Write-Host "  2. cloudflared tunnel route dns $($config.tunnel.name) $newDomain" -ForegroundColor Yellow
                        Write-Host "  3. Option [5] Einstellungen anwenden" -ForegroundColor Yellow
                    }
                } else {
                    Write-Err "Domain darf nicht leer sein!"
                }
                Read-Host "`nWeiter mit Enter"
            }
            "3" {
                $newTunnelName = Read-Host "Neuer Tunnel-Name (aktuell: $tunnelName)"
                if ($newTunnelName -and $newTunnelName.Length -gt 0) {
                    $config.tunnel.name = $newTunnelName
                    Save-Config $config
                    Write-Success "Tunnel-Name geaendert auf $newTunnelName"
                    Write-Warn "HINWEIS: Ein neuer Tunnel muss erstellt werden!"
                } else {
                    Write-Err "Tunnel-Name darf nicht leer sein!"
                }
                Start-Sleep -Seconds 2
            }
            "4" {
                $config.autoPull = -not $config.autoPull
                Save-Config $config
                Write-Success "Auto-Pull ist jetzt: $($config.autoPull)"
                Start-Sleep -Seconds 1
            }
            "5" {
                Apply-ConfigChanges $config
                Read-Host "`nWeiter mit Enter"
            }
            "0" { return }
            default {
                Write-Warn "Ungueltige Auswahl"
                Start-Sleep -Seconds 1
            }
        }
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
    Write-Host "  [7] Einstellungen bearbeiten" -ForegroundColor Yellow
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
        "7" { 
            Edit-Configuration
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
