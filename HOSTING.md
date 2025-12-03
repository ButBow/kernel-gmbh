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
