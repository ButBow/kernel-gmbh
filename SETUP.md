# 🚀 Kernel Website - Self-Hosting Setup Guide

## Quick-Start (3 Schritte)

```
1. setup.bat doppelklicken (als Administrator)
2. Option [1] wählen für vollständiges Setup
3. Fertig! Server läuft unter https://kernel.gmbh
```

---

## Inhaltsverzeichnis

1. [Systemvoraussetzungen](#systemvoraussetzungen)
2. [Erstinstallation](#erstinstallation)
3. [Täglicher Gebrauch](#täglicher-gebrauch)
4. [Cloudflare Tunnel Setup](#cloudflare-tunnel-setup)
5. [Konfiguration](#konfiguration)
6. [Troubleshooting](#troubleshooting)
7. [Notion Integration](#notion-integration)
8. [Sicherheit](#sicherheit)
9. [Kosten](#kosten)

---

## Systemvoraussetzungen

| Anforderung | Minimum | Empfohlen |
|-------------|---------|-----------|
| Betriebssystem | Windows 10 (64-bit) | Windows 11 |
| RAM | 4 GB | 8 GB |
| Speicher | 1 GB frei | 5 GB frei |
| Internet | Stabile Verbindung | Glasfaser |

**Wird automatisch installiert:**
- Git
- Node.js (LTS)
- Cloudflare Tunnel (cloudflared)

---

## Erstinstallation

### Schritt 1: Repository klonen

```powershell
# Öffne PowerShell und navigiere zum gewünschten Ordner
cd C:\Projekte

# Repository klonen
git clone https://github.com/DEIN-USERNAME/kernel-website.git
cd kernel-website
```

### Schritt 2: Setup ausführen

**Doppelklicke auf `setup.bat`** (oder Rechtsklick → "Als Administrator ausführen")

Das Setup-Menü erscheint:

```
╔════════════════════════════════════════════════════════════════╗
║           🚀 KERNEL WEBSITE - SETUP WIZARD                     ║
╠════════════════════════════════════════════════════════════════╣
║  [1] Vollständiges Setup (Erstinstallation)                    ║
║  [2] Nur Dependencies prüfen/installieren                      ║
║  [3] Git Pull + Build (Update)                                 ║
║  [4] Server starten (Quick-Start)                              ║
║  [5] Cloudflare Tunnel konfigurieren                           ║
║  [6] .env Datei erstellen/bearbeiten                           ║
║  [0] Beenden                                                   ║
╚════════════════════════════════════════════════════════════════╝
```

**Wähle Option [1]** für die Erstinstallation.

### Schritt 3: Cloudflare Tunnel einrichten

Beim ersten Mal wirst du aufgefordert, dich bei Cloudflare anzumelden:

1. Ein Browser-Fenster öffnet sich
2. Melde dich mit deinem Cloudflare-Konto an
3. Autorisiere den Tunnel
4. Kehre zum Terminal zurück

### Schritt 4: Fertig!

Nach erfolgreichem Setup siehst du:

```
╔════════════════════════════════════════════════════════════════╗
║              🚀 SERVER LÄUFT ERFOLGREICH!                      ║
╠════════════════════════════════════════════════════════════════╣
║  Lokal:      http://localhost:3000                             ║
║  Tunnel:     https://kernel.gmbh                               ║
║  Admin:      https://kernel.gmbh/admin/login                   ║
╠════════════════════════════════════════════════════════════════╣
║  Server-Fenster und Tunnel-Fenster offen lassen!               ║
║  Zum Stoppen: Beide Fenster schließen (oder Ctrl+C)            ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Täglicher Gebrauch

### Server starten

**Doppelklicke auf `start-server.bat`**

Das Skript:
1. Prüft ob ein Build existiert
2. Fragt optional nach Git Pull
3. Startet Server + Tunnel automatisch

### Server stoppen

- Schließe beide Fenster (Server + Tunnel)
- Oder drücke `Ctrl+C` in beiden Fenstern

### Updates einspielen

1. `setup.bat` ausführen
2. Option **[3] Git Pull + Build** wählen
3. Server neu starten

---

## Cloudflare Tunnel Setup

### Erstmalige Einrichtung

Falls noch kein Tunnel existiert:

```powershell
# 1. Bei Cloudflare anmelden
cloudflared tunnel login

# 2. Tunnel erstellen
cloudflared tunnel create kernel-website

# 3. DNS-Routen hinzufügen (Domain muss bei Cloudflare sein!)
cloudflared tunnel route dns kernel-website kernel.gmbh
cloudflared tunnel route dns kernel-website www.kernel.gmbh
```

### Tunnel-Konfiguration

Die Konfiguration wird automatisch erstellt unter:
- Windows: `%USERPROFILE%\.cloudflared\config.yml`

```yaml
tunnel: kernel-website
credentials-file: C:\Users\DEIN-USER\.cloudflared\<TUNNEL-ID>.json

ingress:
  - hostname: kernel.gmbh
    service: http://localhost:3000
  - hostname: www.kernel.gmbh
    service: http://localhost:3000
  - service: http_status:404
```

### Domain zu Cloudflare übertragen

1. Registriere/übertrage deine Domain zu Cloudflare
2. DNS-Einträge werden automatisch verwaltet
3. SSL/TLS wird automatisch bereitgestellt

---

## Konfiguration

### scripts/config.json

Diese Datei speichert deine Einstellungen:

```json
{
  "tunnelName": "kernel-website",
  "domain": "kernel.gmbh",
  "port": 3000,
  "autoPull": false,
  "lastBuild": "2024-12-05T10:30:00Z"
}
```

### .env Datei

Für Notion-Integration und andere Secrets:

```bash
# .env (im Projektroot)
NOTION_API_TOKEN=secret_xxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=abc123def456...
```

⚠️ **Wichtig:** Die `.env` Datei niemals ins Git-Repository hochladen!

---

## Troubleshooting

### Problem: "winget nicht gefunden"

**Lösung:** Windows aktualisieren oder App Installer manuell installieren:
1. Microsoft Store öffnen
2. "App Installer" suchen und installieren

### Problem: "Port 3000 bereits belegt"

**Lösung:** Das Setup bietet automatisch an, den blockierenden Prozess zu beenden.

Manuell:
```powershell
# Prozess auf Port 3000 finden
netstat -ano | findstr :3000

# Prozess beenden (PID ersetzen)
taskkill /PID 12345 /F
```

### Problem: "Build schlägt fehl"

**Lösungen:**
1. `node_modules` löschen und neu installieren:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   npm run build
   ```

2. Cache leeren:
   ```powershell
   npm cache clean --force
   ```

### Problem: "Cloudflare Tunnel verbindet nicht"

**Lösungen:**
1. Erneut anmelden: `cloudflared tunnel login`
2. Tunnel-Status prüfen: `cloudflared tunnel list`
3. Firewall prüfen (cloudflared muss ausgehende Verbindungen erlauben)

### Problem: "Git Pull Konflikte"

**Das Setup bietet 3 Optionen:**
1. **Stash:** Lokale Änderungen speichern, Pull, Änderungen wiederherstellen
2. **Reset:** Lokale Änderungen verwerfen (⚠️ Daten gehen verloren!)
3. **Abbrechen:** Manuell lösen

### Problem: "PowerShell-Skript wird blockiert"

**Lösung:** Ausführungsrichtlinie temporär ändern:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

Oder dauerhaft (als Administrator):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Notion Integration

Die Website kann Kontaktanfragen automatisch an Notion senden.

### Setup

1. **Notion Integration erstellen:**
   - Gehe zu https://www.notion.so/my-integrations
   - Erstelle neue Integration mit Read + Insert Rechten
   - Kopiere den API-Token

2. **Notion Datenbank erstellen:**

   | Property | Typ |
   |----------|-----|
   | Name | Title |
   | E-Mail | Email |
   | Telefon | Phone |
   | Firma | Text |
   | Anfrageart | Select |
   | Budget | Select |
   | Betreff | Text |
   | Status | Select |
   | Eingegangen | Date |
   | Hat Anhänge | Checkbox |

3. **Datenbank mit Integration teilen:**
   - Datenbank öffnen → "..." → "Connections" → Integration auswählen

4. **.env konfigurieren:**
   ```bash
   NOTION_API_TOKEN=secret_xxxxx
   NOTION_DATABASE_ID=xxxxx
   ```

5. **Im Admin-Panel aktivieren:**
   - Admin → Einstellungen → Integrationen
   - Notion aktivieren und Database ID eintragen

---

## Sicherheit

### ✅ Was Cloudflare Tunnel sicher macht

- **Keine offenen Ports:** Dein PC öffnet keine eingehenden Ports
- **Verschlüsselter Tunnel:** Alle Daten durch Cloudflares Netzwerk
- **DDoS-Schutz:** Automatische Filterung
- **WAF:** Web Application Firewall
- **SSL/TLS:** Automatisches HTTPS-Zertifikat

### ⚠️ Empfehlungen

1. **Admin-Passwort ändern** in `src/contexts/AuthContext.tsx`
2. Regelmäßig `npm audit` ausführen
3. Windows Firewall aktiviert lassen
4. Betriebssystem aktuell halten

### Admin-Zugang

- **URL:** https://kernel.gmbh/admin/login
- **Standard-Passwort:** `Kernel#Admin2024!` (UNBEDINGT ÄNDERN!)

---

## Kosten

| Service | Kosten |
|---------|--------|
| Cloudflare Tunnel | Kostenlos |
| kernel.gmbh Domain | ~10-15€/Jahr |
| Strom (24/7 Betrieb) | ~20-50€/Jahr |
| **Gesamt** | **~30-65€/Jahr** |

---

## Dateiübersicht

| Datei | Zweck |
|-------|-------|
| `setup.bat` | Haupt-Setup (Erstinstallation) |
| `start-server.bat` | Schnellstart (täglicher Gebrauch) |
| `scripts/setup.ps1` | Setup-Logik |
| `scripts/start-server.ps1` | Server-Start-Logik |
| `scripts/check-dependencies.ps1` | Dependency-Prüfung |
| `scripts/config.json` | Persistente Einstellungen |
| `server.js` | Node.js HTTP-Server |
| `.env` | Secrets (nicht im Git!) |

---

## API-Endpoints

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/contact` | POST | Kontaktformular |
| `/api/notion/test` | GET | Notion-Verbindung testen |
| `/api/notion/status` | GET | Notion-Status prüfen |

### Rate Limiting

- Max. 5 Anfragen pro Minute pro IP
- Bei Überschreitung: HTTP 429

---

## Support

Bei Problemen:
1. Dieses Dokument durchlesen
2. `setup.bat` → Option [2] für Dependency-Check
3. Server-Logs prüfen (im Server-Fenster)

---

*Letzte Aktualisierung: Dezember 2024*
