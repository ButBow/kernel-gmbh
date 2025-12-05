@echo off
chcp 65001 >nul 2>&1
title Kernel Website - Setup Wizard
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           Kernel Website - Setup wird gestartet...            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Wechsle ins Skript-Verzeichnis
cd /d "%~dp0"

:: Prüfe ob scripts Ordner existiert
if not exist "scripts" (
    echo [FEHLER] scripts Ordner nicht gefunden!
    echo Bitte stelle sicher, dass du im richtigen Verzeichnis bist.
    pause
    exit /b 1
)

:: Prüfe ob PowerShell verfügbar ist
where powershell >nul 2>&1
if %errorlevel% neq 0 (
    echo [FEHLER] PowerShell nicht gefunden!
    echo Bitte installiere PowerShell oder verwende Windows 10/11.
    pause
    exit /b 1
)

:: Starte PowerShell Setup-Skript
powershell -ExecutionPolicy Bypass -NoProfile -File "scripts\setup.ps1"

:: Prüfe Exit-Code
if %errorlevel% neq 0 (
    echo.
    echo [WARNUNG] Setup wurde mit Fehlern beendet.
    echo Bitte prüfe die Ausgabe oben.
)

echo.
echo Drücke eine beliebige Taste zum Beenden...
pause >nul
