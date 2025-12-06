#!/usr/bin/env python3
"""
KernelFlow Chatbot Backend Server
=================================
Ein einfacher Python-Server, der als Backend für den AI-Chatbot dient.
Kommuniziert mit Ollama für die KI-Antworten.

Voraussetzungen:
- Python 3.8+
- Ollama installiert und gestartet (https://ollama.com)
- Modell heruntergeladen (z.B. ollama pull llama3.2:latest)

Starten:
  python scripts/chatbot_server.py

Oder mit Custom Port:
  CHATBOT_PORT=8001 python scripts/chatbot_server.py

Der Server lauscht standardmäßig auf Port 8001.
"""

import os
import json
import re
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path

# Konfiguration
CHATBOT_PORT = int(os.environ.get('CHATBOT_PORT', 8001))
OLLAMA_URL = os.environ.get('OLLAMA_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'llama3.2:latest')
MAX_TOKENS = int(os.environ.get('MAX_TOKENS', 1024))
TEMPERATURE = float(os.environ.get('TEMPERATURE', 0.7))

# Pfade
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
DATA_DIR = PROJECT_ROOT / 'data'
CONFIG_FILE = SCRIPT_DIR / 'config.json'

# In-Memory Session Storage (wird bei Server-Neustart gelöscht)
# Key: session_id, Value: {"messages": [...], "created_at": datetime, "last_activity": datetime}
sessions = {}

# Session-Timeout in Sekunden (30 Minuten)
SESSION_TIMEOUT = 1800


def load_config():
    """Lädt Konfiguration aus config.json falls vorhanden."""
    config = {
        'ollama_url': OLLAMA_URL,
        'ollama_model': OLLAMA_MODEL,
        'max_tokens': MAX_TOKENS,
        'temperature': TEMPERATURE,
    }
    
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8-sig') as f:
                file_config = json.load(f)
                # Chatbot-spezifische Config
                chatbot_config = file_config.get('chatbot', {})
                config.update({
                    'ollama_url': chatbot_config.get('ollama_url', config['ollama_url']),
                    'ollama_model': chatbot_config.get('ollama_model', config['ollama_model']),
                    'max_tokens': chatbot_config.get('max_tokens', config['max_tokens']),
                    'temperature': chatbot_config.get('temperature', config['temperature']),
                })
        except Exception as e:
            print(f"⚠️  Config-Datei konnte nicht geladen werden: {e}")
    
    return config


def load_chatbot_settings():
    """Lädt Chatbot-Einstellungen aus content.json."""
    content_file = DATA_DIR / 'content.json'
    defaults = {
        'enabled': True,
        'welcomeMessage': 'Willkommen! Ich bin der KernelFlow Assistent.',
        'systemPromptMarkdown': '',
        'systemPromptAddition': '',
        'ollamaUrl': OLLAMA_URL,
        'ollamaModel': OLLAMA_MODEL,
        'maxTokens': MAX_TOKENS,
        'temperature': TEMPERATURE,
    }
    
    try:
        if content_file.exists():
            with open(content_file, 'r', encoding='utf-8') as f:
                content = json.load(f)
                chatbot_settings = content.get('settings', {}).get('chatbotSettings', {})
                return {**defaults, **chatbot_settings}
    except Exception as e:
        print(f"⚠️  content.json konnte nicht geladen werden: {e}")
    
    return defaults


def load_knowledge_base():
    """Lädt die Wissensbasis für den Chatbot."""
    knowledge_file = DATA_DIR / 'chatbot-wissensbasis.md'
    
    try:
        if knowledge_file.exists():
            with open(knowledge_file, 'r', encoding='utf-8') as f:
                return f.read()
    except Exception as e:
        print(f"⚠️  Wissensbasis konnte nicht geladen werden: {e}")
    
    return ''


def load_system_prompt():
    """Lädt den System-Prompt für den Chatbot."""
    settings = load_chatbot_settings()
    
    # Standard-Prompt
    base_prompt = "Du bist ein hilfreicher Assistent für die KernelFlow-Webseite. Antworte höflich und informativ auf Deutsch."
    
    # Prüfe auf hochgeladenes Markdown in den Einstellungen
    if settings.get('systemPromptMarkdown', '').strip():
        base_prompt = settings['systemPromptMarkdown']
    else:
        # Versuche neue Markdown-Datei zu laden (bevorzugt)
        prompt_file_md = DATA_DIR / 'chatbot-system-prompt.md'
        prompt_file_txt = DATA_DIR / 'chatbot-system-prompt.txt'
        
        try:
            if prompt_file_md.exists():
                with open(prompt_file_md, 'r', encoding='utf-8') as f:
                    base_prompt = f.read()
                print("✅ System-Prompt aus chatbot-system-prompt.md geladen")
            elif prompt_file_txt.exists():
                with open(prompt_file_txt, 'r', encoding='utf-8') as f:
                    base_prompt = f.read()
                print("✅ System-Prompt aus chatbot-system-prompt.txt geladen")
        except Exception as e:
            print(f"⚠️  System-Prompt Datei konnte nicht geladen werden: {e}")
    
    # Wissensbasis hinzufügen
    knowledge_base = load_knowledge_base()
    if knowledge_base:
        base_prompt += '\n\n---\n\n# WISSENSBASIS\n\n' + knowledge_base
        print("✅ Wissensbasis geladen und angehängt")
    
    # Füge zusätzliche Anweisungen aus Admin-Settings hinzu
    if settings.get('systemPromptAddition', '').strip():
        base_prompt += '\n\n---\n\n# ZUSÄTZLICHE ANWEISUNGEN\n\n' + settings['systemPromptAddition']
    
    return base_prompt


def get_live_data_context():
    """Lädt Live-Daten für den Chatbot-Kontext."""
    content_file = DATA_DIR / 'content.json'
    
    try:
        if not content_file.exists():
            return ''
        
        with open(content_file, 'r', encoding='utf-8') as f:
            content = json.load(f)
        
        live_data = []
        
        # Firmenname
        settings = content.get('settings', {})
        if settings.get('companyName'):
            live_data.append(f"FIRMENNAME: {settings['companyName']}")
        
        # Produkte/Services
        products = content.get('products', [])
        if products:
            products_list = []
            for p in products:
                if p.get('status') == 'published':
                    desc = p.get('shortDescription') or p.get('description') or 'Keine Beschreibung'
                    price = p.get('priceText') or 'Preis auf Anfrage'
                    products_list.append(f"- {p.get('name', 'Unbenannt')}: {desc} ({price})")
            if products_list:
                live_data.append("VERFÜGBARE SERVICES:\n" + '\n'.join(products_list))
        
        # Kategorien
        categories = content.get('categories', [])
        if categories:
            cat_list = [f"- {c.get('name', 'Unbenannt')}: {c.get('description', '')}" for c in categories]
            live_data.append("KATEGORIEN:\n" + '\n'.join(cat_list))
        
        # Kontaktdaten
        contact_info = []
        if settings.get('contactEmail'):
            contact_info.append(f"E-Mail: {settings['contactEmail']}")
        if settings.get('contactPhone'):
            contact_info.append(f"Telefon: {settings['contactPhone']}")
        if settings.get('contactLocation'):
            contact_info.append(f"Standort: {settings['contactLocation']}")
        if contact_info:
            live_data.append("KONTAKTDATEN:\n" + '\n'.join(contact_info))
        
        if live_data:
            return '\n\nLIVE_DATEN:\n' + '\n\n'.join(live_data)
        
    except Exception as e:
        print(f"⚠️  Live-Daten konnten nicht geladen werden: {e}")
    
    return ''


def sanitize_text(text):
    """Bereinigt Benutzereingaben."""
    if not text:
        return ''
    # Entferne potenziell gefährliche Zeichen
    text = re.sub(r'[<>]', '', text)
    text = re.sub(r'javascript:', '', text, flags=re.IGNORECASE)
    text = re.sub(r'on\w+=', '', text, flags=re.IGNORECASE)
    return text.strip()


def cleanup_old_sessions():
    """Entfernt abgelaufene Sessions."""
    now = datetime.now()
    expired = []
    for session_id, session in sessions.items():
        last_activity = session.get('last_activity', session.get('created_at'))
        if (now - last_activity).total_seconds() > SESSION_TIMEOUT:
            expired.append(session_id)
    
    for session_id in expired:
        del sessions[session_id]
        print(f"🗑️  Session {session_id[:8]}... abgelaufen und entfernt")


def call_ollama(messages, session_id=None):
    """Ruft Ollama API auf und gibt die Antwort zurück."""
    settings = load_chatbot_settings()
    system_prompt = load_system_prompt()
    live_context = get_live_data_context()
    
    # Vollständiger System-Prompt mit Live-Daten
    full_system_prompt = system_prompt + live_context
    
    # Nachrichten für Ollama vorbereiten
    ollama_messages = [
        {'role': 'system', 'content': full_system_prompt}
    ]
    
    # Konversationshistorie hinzufügen
    for msg in messages:
        ollama_messages.append({
            'role': msg['role'],
            'content': sanitize_text(msg['content'])
        })
    
    # Ollama URL und Modell aus Einstellungen
    ollama_url = settings.get('ollamaUrl', OLLAMA_URL)
    ollama_model = settings.get('ollamaModel', OLLAMA_MODEL)
    max_tokens = settings.get('maxTokens', MAX_TOKENS)
    temperature = settings.get('temperature', TEMPERATURE)
    
    try:
        request_data = json.dumps({
            'model': ollama_model,
            'messages': ollama_messages,
            'stream': False,
            'options': {
                'temperature': temperature,
                'top_p': 0.9,
                'num_predict': max_tokens,
            }
        }).encode('utf-8')
        
        req = urllib.request.Request(
            f"{ollama_url}/api/chat",
            data=request_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=120) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get('message', {}).get('content', 'Entschuldigung, ich konnte keine Antwort generieren.')
    
    except urllib.error.URLError as e:
        print(f"❌ Ollama Verbindungsfehler: {e}")
        raise Exception(f"Ollama nicht erreichbar. Ist Ollama gestartet? ({ollama_url})")
    except Exception as e:
        print(f"❌ Ollama Fehler: {e}")
        raise


class ChatbotHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler für den Chatbot."""
    
    def log_message(self, format, *args):
        """Überschreibt Standard-Logging für besseres Format."""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {args[0]}")
    
    def send_cors_headers(self):
        """Sendet CORS-Header für Cross-Origin-Requests."""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Session-ID')
    
    def send_json_response(self, data, status=200):
        """Sendet JSON-Response."""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Behandelt CORS Preflight-Requests."""
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Behandelt GET-Requests."""
        parsed = urlparse(self.path)
        
        if parsed.path == '/health':
            # Health-Check Endpoint
            self.send_json_response({
                'status': 'ok',
                'service': 'chatbot',
                'timestamp': datetime.now().isoformat(),
                'sessions_active': len(sessions)
            })
        
        elif parsed.path == '/config':
            # Gibt aktuelle Konfiguration zurück (ohne sensible Daten)
            settings = load_chatbot_settings()
            self.send_json_response({
                'enabled': settings.get('enabled', True),
                'model': settings.get('ollamaModel', OLLAMA_MODEL),
                'ollama_url': settings.get('ollamaUrl', OLLAMA_URL),
                'max_tokens': settings.get('maxTokens', MAX_TOKENS),
                'temperature': settings.get('temperature', TEMPERATURE),
            })
        
        elif parsed.path == '/test-ollama':
            # Testet Ollama-Verbindung
            settings = load_chatbot_settings()
            ollama_url = settings.get('ollamaUrl', OLLAMA_URL)
            try:
                req = urllib.request.Request(f"{ollama_url}/api/tags", method='GET')
                with urllib.request.urlopen(req, timeout=5) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    models = [m.get('name', 'unknown') for m in data.get('models', [])]
                    self.send_json_response({
                        'success': True,
                        'message': 'Ollama ist erreichbar',
                        'available_models': models,
                        'configured_model': settings.get('ollamaModel', OLLAMA_MODEL)
                    })
            except Exception as e:
                self.send_json_response({
                    'success': False,
                    'error': f'Ollama nicht erreichbar: {str(e)}',
                    'ollama_url': ollama_url,
                    'hint': 'Stelle sicher, dass Ollama gestartet ist (ollama serve)'
                }, status=503)
        
        else:
            self.send_json_response({'error': 'Not found'}, status=404)
    
    def do_POST(self):
        """Behandelt POST-Requests."""
        parsed = urlparse(self.path)
        
        if parsed.path == '/chat':
            try:
                # Body lesen
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length > 1024 * 1024:  # Max 1MB
                    self.send_json_response({'error': 'Request too large'}, status=413)
                    return
                
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))
                
                message = data.get('message', '').strip()
                if not message:
                    self.send_json_response({'error': 'Keine Nachricht angegeben'}, status=400)
                    return
                
                # Session-ID aus Header oder Body
                session_id = self.headers.get('X-Session-ID') or data.get('session_id')
                
                # Neue Session erstellen oder bestehende verwenden
                if not session_id or session_id not in sessions:
                    session_id = str(uuid.uuid4())
                    sessions[session_id] = {
                        'messages': [],
                        'created_at': datetime.now(),
                        'last_activity': datetime.now()
                    }
                    print(f"🆕 Neue Session erstellt: {session_id[:8]}...")
                
                session = sessions[session_id]
                session['last_activity'] = datetime.now()
                
                # Nachricht zur Historie hinzufügen
                session['messages'].append({
                    'role': 'user',
                    'content': message
                })
                
                # Ollama aufrufen mit vollständiger Konversationshistorie
                response_text = call_ollama(session['messages'], session_id)
                
                # Antwort zur Historie hinzufügen
                session['messages'].append({
                    'role': 'assistant',
                    'content': response_text
                })
                
                # Alte Sessions aufräumen
                cleanup_old_sessions()
                
                self.send_json_response({
                    'response': response_text,
                    'session_id': session_id
                })
                
            except json.JSONDecodeError:
                self.send_json_response({'error': 'Ungültiges JSON'}, status=400)
            except Exception as e:
                print(f"❌ Chat-Fehler: {e}")
                self.send_json_response({
                    'error': str(e),
                    'hint': 'Überprüfe die Ollama-Konfiguration in den Admin-Einstellungen'
                }, status=500)
        
        elif parsed.path == '/clear-session':
            # Session löschen
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))
                
                session_id = self.headers.get('X-Session-ID') or data.get('session_id')
                
                if session_id and session_id in sessions:
                    del sessions[session_id]
                    print(f"🗑️  Session {session_id[:8]}... gelöscht")
                    self.send_json_response({'success': True, 'message': 'Session gelöscht'})
                else:
                    self.send_json_response({'success': True, 'message': 'Session nicht gefunden'})
                    
            except Exception as e:
                self.send_json_response({'error': str(e)}, status=500)
        
        else:
            self.send_json_response({'error': 'Not found'}, status=404)


def main():
    """Hauptfunktion - startet den Server."""
    print("=" * 60)
    print("🤖 KernelFlow Chatbot Backend Server")
    print("=" * 60)
    
    # Konfiguration laden
    config = load_config()
    settings = load_chatbot_settings()
    
    print(f"\n📋 Konfiguration:")
    print(f"   Port: {CHATBOT_PORT}")
    print(f"   Ollama URL: {settings.get('ollamaUrl', config['ollama_url'])}")
    print(f"   Modell: {settings.get('ollamaModel', config['ollama_model'])}")
    print(f"   Max Tokens: {settings.get('maxTokens', config['max_tokens'])}")
    print(f"   Temperature: {settings.get('temperature', config['temperature'])}")
    
    # Teste Ollama-Verbindung
    print(f"\n🔍 Teste Ollama-Verbindung...")
    try:
        ollama_url = settings.get('ollamaUrl', config['ollama_url'])
        req = urllib.request.Request(f"{ollama_url}/api/tags", method='GET')
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            models = [m.get('name', 'unknown') for m in data.get('models', [])]
            print(f"   ✅ Ollama erreichbar!")
            print(f"   📦 Verfügbare Modelle: {', '.join(models) if models else 'Keine'}")
            
            model = settings.get('ollamaModel', config['ollama_model'])
            if model not in models:
                print(f"   ⚠️  Konfiguriertes Modell '{model}' nicht gefunden!")
                print(f"   💡 Installiere mit: ollama pull {model}")
    except Exception as e:
        print(f"   ❌ Ollama nicht erreichbar: {e}")
        print(f"   💡 Starte Ollama mit: ollama serve")
    
    # Prüfe Prompt-Dateien
    print(f"\n📄 Prompt-Dateien:")
    prompt_md = DATA_DIR / 'chatbot-system-prompt.md'
    prompt_txt = DATA_DIR / 'chatbot-system-prompt.txt'
    knowledge_file = DATA_DIR / 'chatbot-wissensbasis.md'
    
    if prompt_md.exists():
        print(f"   ✅ System-Prompt: chatbot-system-prompt.md")
    elif prompt_txt.exists():
        print(f"   ✅ System-Prompt: chatbot-system-prompt.txt")
    else:
        print(f"   ⚠️  Kein System-Prompt gefunden (Standard wird verwendet)")
    
    if knowledge_file.exists():
        print(f"   ✅ Wissensbasis: chatbot-wissensbasis.md")
    else:
        print(f"   ⚠️  Keine Wissensbasis gefunden")
    
    # Server starten
    print(f"\n🚀 Starte Server auf Port {CHATBOT_PORT}...")
    server = HTTPServer(('0.0.0.0', CHATBOT_PORT), ChatbotHandler)
    
    print(f"\n✅ Server läuft!")
    print(f"   📍 Local: http://localhost:{CHATBOT_PORT}")
    print(f"   📍 Health: http://localhost:{CHATBOT_PORT}/health")
    print(f"   📍 Test Ollama: http://localhost:{CHATBOT_PORT}/test-ollama")
    print(f"\n💡 Drücke Ctrl+C zum Beenden\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Server wird beendet...")
        server.shutdown()
        print("👋 Auf Wiedersehen!")


if __name__ == '__main__':
    main()
