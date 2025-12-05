# ============================================================================
# Kernel Website - Dependency Checker
# ============================================================================
# Prüft und installiert automatisch alle benötigten Dependencies
# Kann standalone oder von anderen Skripten aufgerufen werden
# ============================================================================

param(
    [switch]$AutoInstall = $false,
    [switch]$Silent = $false
)

$ErrorActionPreference = "Continue"

# Farben (nur wenn nicht silent)
function Write-Success($msg) { if (-not $Silent) { Write-Host "✓ $msg" -ForegroundColor Green } }
function Write-Info($msg) { if (-not $Silent) { Write-Host "→ $msg" -ForegroundColor Cyan } }
function Write-Warn($msg) { if (-not $Silent) { Write-Host "⚠ $msg" -ForegroundColor Yellow } }
function Write-Err($msg) { if (-not $Silent) { Write-Host "✗ $msg" -ForegroundColor Red } }

# ============================================================================
# Functions
# ============================================================================

function Test-Command($cmd) {
    $null = Get-Command $cmd -ErrorAction SilentlyContinue
    return $?
}

function Test-WingetAvailable {
    return Test-Command "winget"
}

function Install-WithWinget($name, $wingetId) {
    if (-not (Test-WingetAvailable)) {
        Write-Err "winget nicht verfügbar! Bitte installiere '$name' manuell."
        return $false
    }
    
    Write-Info "Installiere $name mit winget..."
    
    try {
        $process = Start-Process -FilePath "winget" -ArgumentList "install", "--id", $wingetId, "--silent", "--accept-source-agreements", "--accept-package-agreements" -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            # Aktualisiere PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
            Write-Success "$name erfolgreich installiert!"
            return $true
        } else {
            Write-Err "Installation von $name fehlgeschlagen (Exit Code: $($process.ExitCode))"
            return $false
        }
    } catch {
        Write-Err "Fehler bei Installation von ${name}: $_"
        return $false
    }
}

# ============================================================================
# Dependency Definitions
# ============================================================================

$Dependencies = @(
    @{
        Name = "Git"
        Command = "git"
        WingetId = "Git.Git"
        Required = $true
        GetVersion = { (git --version) -replace "git version ", "" }
    },
    @{
        Name = "Node.js"
        Command = "node"
        WingetId = "OpenJS.NodeJS.LTS"
        Required = $true
        GetVersion = { node --version }
    },
    @{
        Name = "NPM"
        Command = "npm"
        WingetId = $null  # Kommt mit Node.js
        Required = $true
        GetVersion = { npm --version }
    },
    @{
        Name = "Cloudflare Tunnel"
        Command = "cloudflared"
        WingetId = "Cloudflare.cloudflared"
        Required = $false  # Nur für Tunnel nötig
        GetVersion = { (cloudflared --version 2>&1) -replace "cloudflared version ", "" -split " " | Select-Object -First 1 }
    }
)

# ============================================================================
# Main Check
# ============================================================================

function Check-AllDependencies {
    param(
        [switch]$Install = $false
    )
    
    $results = @{
        AllInstalled = $true
        AllRequired = $true
        Details = @()
    }
    
    foreach ($dep in $Dependencies) {
        $installed = Test-Command $dep.Command
        $version = $null
        
        if ($installed) {
            try {
                $version = & $dep.GetVersion
            } catch {
                $version = "unbekannt"
            }
            Write-Success "$($dep.Name) gefunden (v$version)"
        } else {
            if ($dep.Required) {
                Write-Warn "$($dep.Name) nicht gefunden (ERFORDERLICH)"
                $results.AllRequired = $false
            } else {
                Write-Warn "$($dep.Name) nicht gefunden (optional)"
            }
            $results.AllInstalled = $false
            
            # Auto-Install wenn gewünscht
            if ($Install -and $dep.WingetId) {
                if (Install-WithWinget $dep.Name $dep.WingetId) {
                    $installed = $true
                    try {
                        $version = & $dep.GetVersion
                    } catch {
                        $version = "installiert"
                    }
                }
            }
        }
        
        $results.Details += @{
            Name = $dep.Name
            Installed = $installed
            Required = $dep.Required
            Version = $version
        }
    }
    
    return $results
}

# ============================================================================
# Standalone Execution
# ============================================================================

if ($MyInvocation.InvocationName -ne ".") {
    # Wird direkt ausgeführt (nicht gesourced)
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           DEPENDENCY CHECK                                     ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    $results = Check-AllDependencies -Install:$AutoInstall
    
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Gray
    
    if ($results.AllRequired) {
        Write-Success "Alle erforderlichen Dependencies sind installiert!"
    } else {
        Write-Err "Einige erforderliche Dependencies fehlen!"
        Write-Host ""
        Write-Host "Führe aus mit -AutoInstall um fehlende automatisch zu installieren:" -ForegroundColor Yellow
        Write-Host "  .\check-dependencies.ps1 -AutoInstall" -ForegroundColor White
    }
    
    if (-not $results.AllInstalled) {
        Write-Host ""
        Write-Host "Fehlende optionale Dependencies können manuell installiert werden." -ForegroundColor Gray
    }
    
    Write-Host ""
    
    # Return exit code
    if ($results.AllRequired) {
        exit 0
    } else {
        exit 1
    }
}

# Export für andere Skripte
Export-ModuleMember -Function Check-AllDependencies, Test-Command, Install-WithWinget -ErrorAction SilentlyContinue
