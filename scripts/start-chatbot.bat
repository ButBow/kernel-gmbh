@echo off
REM ============================================
REM KernelFlow Chatbot Server Startskript
REM ============================================

echo.
echo ========================================
echo   KernelFlow Chatbot Server
echo ========================================
echo.

REM Prüfe Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FEHLER] Python ist nicht installiert oder nicht im PATH.
    echo          Bitte installiere Python 3.8+ von https://python.org
    pause
    exit /b 1
)

REM Prüfe Ollama
echo [INFO] Pruefe Ollama-Verbindung...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNUNG] Ollama scheint nicht zu laufen.
    echo           Starte Ollama mit: ollama serve
    echo.
)

echo [INFO] Starte Python Chatbot-Server...
echo.

cd /d %~dp0
python chatbot_server.py

pause
