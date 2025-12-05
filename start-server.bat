@echo off
chcp 65001 >nul 2>&1
title Kernel Website - Server Start
color 0B

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           Kernel Website - Server wird gestartet...           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Wechsle ins Skript-Verzeichnis
cd /d "%~dp0"

:: Prüfe ob scripts Ordner existiert
if not exist "scripts" (
    echo [FEHLER] scripts Ordner nicht gefunden!
    pause
    exit /b 1
)

:: Starte PowerShell Start-Server-Skript
powershell -ExecutionPolicy Bypass -NoProfile -File "scripts\start-server.ps1"

:: Das Skript sollte nicht hier ankommen, wenn Server läuft
if %errorlevel% neq 0 (
    echo.
    echo [INFO] Server wurde beendet oder Fehler aufgetreten.
    pause
)
