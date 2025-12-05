#!/bin/bash
# ============================================
# KernelFlow Chatbot Server Startskript
# ============================================

echo ""
echo "========================================"
echo "  KernelFlow Chatbot Server"
echo "========================================"
echo ""

# Prüfe Python
if ! command -v python3 &> /dev/null; then
    echo "[FEHLER] Python3 ist nicht installiert."
    echo "         Installiere mit: sudo apt install python3"
    exit 1
fi

# Prüfe Ollama
echo "[INFO] Prüfe Ollama-Verbindung..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "[WARNUNG] Ollama scheint nicht zu laufen."
    echo "          Starte Ollama mit: ollama serve"
    echo ""
fi

echo "[INFO] Starte Python Chatbot-Server..."
echo ""

# Wechsle ins Script-Verzeichnis
cd "$(dirname "$0")"

# Starte Server
python3 chatbot_server.py
