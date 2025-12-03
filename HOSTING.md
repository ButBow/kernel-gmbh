# Self-Hosting Guide für kernel.gmbh

## Voraussetzungen
- Node.js 18+ oder Bun
- Cloudflare Account (kostenlos)
- Domain: kernel.gmbh (bei Cloudflare DNS)

## 1. Projekt bauen

```bash
# Dependencies installieren
npm install
# oder
bun install

# Production Build erstellen
npm run build
# oder
bun run build
```

Das erstellt einen `dist/` Ordner mit allen statischen Dateien.

## 2. Option A: Cloudflare Tunnel (Empfohlen)

### Cloudflare Tunnel installieren

**Windows:**
```powershell
# Als Admin ausführen
winget install --id Cloudflare.cloudflared
```

**Linux/Mac:**
```bash
# Linux
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Mac
brew install cloudflared
```

### Tunnel einrichten

```bash
# Bei Cloudflare anmelden
cloudflared tunnel login

# Tunnel erstellen
cloudflared tunnel create kernel-website

# DNS Route hinzufügen (nachdem Domain bei Cloudflare ist)
cloudflared tunnel route dns kernel-website kernel.gmbh
cloudflared tunnel route dns kernel-website www.kernel.gmbh
```

### Konfigurationsdatei erstellen

Erstelle `~/.cloudflared/config.yml`:

```yaml
tunnel: kernel-website
credentials-file: ~/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: kernel.gmbh
    service: http://localhost:3000
  - hostname: www.kernel.gmbh
    service: http://localhost:3000
  - service: http_status:404
```

### Lokalen Server starten + Tunnel

```bash
# Terminal 1: Statischen Server starten (siehe server.js unten)
node server.js

# Terminal 2: Tunnel starten
cloudflared tunnel run kernel-website
```

## 3. Option B: Nginx (für fortgeschrittene Nutzer)

Installiere nginx und verwende die `nginx.conf` Datei in diesem Repo.

## 4. Sicherheitshinweise

### ✅ Was Cloudflare Tunnel sicher macht:
- **Keine offenen Ports**: Dein PC öffnet keine eingehenden Ports
- **Verschlüsselter Tunnel**: Alle Daten gehen durch Cloudflares Netzwerk
- **DDoS-Schutz**: Cloudflare filtert Angriffe automatisch
- **WAF**: Web Application Firewall schützt vor Angriffen
- **SSL/TLS**: Automatisches HTTPS-Zertifikat

### ✅ Lokale Sicherheit (LAN):
- Der Server ist nur über Cloudflare erreichbar, nicht direkt im LAN
- Andere Geräte im LAN können nicht direkt auf den Server zugreifen
- Keine Portweiterleitung im Router nötig

### ⚠️ Empfehlungen:
1. Admin-Passwort ändern in `src/contexts/AuthContext.tsx`
2. Regelmäßig `npm audit` ausführen
3. Windows/Linux Firewall aktiviert lassen
4. Secondary PC mit aktuellem OS + Updates

## 5. Systemd Service (Linux - Autostart)

Erstelle `/etc/systemd/system/kernel-website.service`:

```ini
[Unit]
Description=Kernel Website
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/website
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable kernel-website
sudo systemctl start kernel-website
```

## 6. Kosten

| Service | Kosten |
|---------|--------|
| Cloudflare Tunnel | Kostenlos |
| kernel.gmbh Domain | ~10-15€/Jahr |
| Strom Secondary PC | ~20-50€/Jahr |
| **Gesamt** | **~30-65€/Jahr** |

## 7. Admin-Zugang

- URL: https://kernel.gmbh/admin/login
- Standard-Passwort: `Kernel#Admin2024!` (ÄNDERN!)

## 8. Backup

Regelmäßig die localStorage-Daten exportieren:
1. Admin → Einstellungen → Export
2. JSON-Datei sicher aufbewahren

---

## 9. Notion Integration (Kontaktformular)

Die Website kann Kontaktanfragen automatisch an eine Notion-Datenbank senden.

### 9.1 Notion Integration erstellen

1. Gehe zu **https://www.notion.so/my-integrations**
2. Klicke **"New integration"**
3. Name: `Kernel Website` (oder beliebig)
4. Capabilities:
   - ✅ Read content
   - ✅ Insert content
   - ❌ Update content (nicht nötig)
   - ❌ Delete content (nicht nötig)
5. Klicke **"Submit"**
6. Kopiere den **"Internal Integration Token"** (beginnt mit `secret_`)

### 9.2 Notion Datenbank erstellen

Erstelle eine neue Datenbank in Notion mit folgenden Properties:

| Property | Typ | Pflicht |
|----------|-----|---------|
| Name | Title | ✅ |
| E-Mail | Email | ✅ |
| Telefon | Phone | ❌ |
| Firma | Text | ❌ |
| Anfrageart | Select | ❌ |
| Budget | Select | ❌ |
| Betreff | Text | ❌ |
| Status | Select | ✅ |
| Eingegangen | Date | ✅ |
| Hat Anhänge | Checkbox | ❌ |

**Select-Optionen für "Anfrageart":**
- Projektanfrage
- Support
- Zusammenarbeit
- Sonstiges

**Select-Optionen für "Budget":**
- Unter 1.000 €
- 1.000 - 5.000 €
- 5.000 - 10.000 €
- Über 10.000 €
- Noch unklar

**Select-Optionen für "Status":**
- Neu
- In Bearbeitung
- Beantwortet
- Abgeschlossen

### 9.3 Datenbank mit Integration teilen

1. Öffne deine Notion-Datenbank
2. Klicke rechts oben auf **"..."** → **"Connections"**
3. Suche nach deiner Integration (`Kernel Website`)
4. Klicke **"Confirm"**

### 9.4 Database ID kopieren

Die Database ID findest du in der URL deiner Notion-Datenbank:

```
https://www.notion.so/workspace/abc123def456...?v=...
                        ^^^^^^^^^^^^^^^^
                        Das ist die Database ID
```

Kopiere den Teil zwischen dem letzten `/` und dem `?`.

### 9.5 Server konfigurieren

Erstelle eine `.env` Datei im Projekt-Root:

```bash
# .env
NOTION_API_TOKEN=secret_xxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=abc123def456...
```

⚠️ **Wichtig**: Die `.env` Datei niemals ins Git-Repository hochladen!

### 9.6 Im Admin-Panel aktivieren

1. Gehe zu **Admin → Einstellungen → Integrationen**
2. Aktiviere den **Notion-Integration** Schalter
3. Trage die **Database ID** ein
4. Klicke **"Verbindung testen"**
5. Bei Erfolg: **Speichern**

### 9.7 Testen

1. Gehe zur Kontakt-Seite
2. Fülle das Formular aus
3. Sende die Anfrage
4. Prüfe in Notion, ob der Eintrag erscheint

### 9.8 Troubleshooting

**"NOTION_API_TOKEN nicht konfiguriert"**
→ Prüfe, ob die `.env` Datei existiert und den Token enthält

**"Datenbank nicht gefunden"**
→ Prüfe, ob die Database ID korrekt ist
→ Prüfe, ob die Datenbank mit der Integration geteilt wurde

**"Authentifizierung fehlgeschlagen"**
→ Prüfe, ob der API-Token korrekt kopiert wurde
→ Token muss mit `secret_` beginnen

**Anfragen erscheinen nicht in Notion**
→ Server-Logs prüfen: `node server.js`
→ Browser-Konsole auf Fehler prüfen

### 9.9 Benachrichtigungen in Notion

Notion sendet keine Push-Benachrichtigungen für neue Datenbankeinträge. Alternativen:

1. **Notion API Polling**: Externes Tool prüft regelmäßig auf neue Einträge
2. **Zapier/Make Integration**: Automatische Benachrichtigung bei neuen Einträgen
3. **E-Mail-Weiterleitung**: Resend.com Integration (siehe nächster Abschnitt)

---

## 10. API-Endpoints

Der Server stellt folgende API-Endpoints bereit:

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/contact` | POST | Kontaktformular an Notion senden |
| `/api/notion/test` | GET | Notion-Verbindung testen |
| `/api/notion/status` | GET | Notion-Konfiguration prüfen |

### POST /api/contact

```json
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "phone": "+41 79 123 45 67",
  "company": "Firma AG",
  "inquiryType": "Projektanfrage",
  "budget": "5.000 - 10.000 €",
  "subject": "Website Redesign",
  "message": "Ich möchte...",
  "hasAttachments": true,
  "notionDatabaseId": "optional-override"
}
```

### Rate Limiting

- Max. 5 Anfragen pro Minute pro IP
- Bei Überschreitung: HTTP 429 (Too Many Requests)
