# Deploiement - Relances Architecte

## Prerequis

- VPS Linux.
- Node.js LTS.
- Nginx.
- SQLite.
- Acces systemd.
- Fichier `.env` configure depuis `.env.example`.

## Installation

```bash
cd /home/openclaw/RelancesArchitecte
npm ci
DATABASE_URL=file:./dev.db npx prisma migrate deploy
DATABASE_URL=file:./dev.db npx prisma generate
npm run build
```

## Service web

```bash
sudo cp ops/relances-architecte.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now relances-architecte.service
sudo systemctl status relances-architecte.service
```

Logs:

```bash
journalctl -u relances-architecte.service -f
```

## Notifications

```bash
sudo cp ops/relances-reminders.service /etc/systemd/system/
sudo cp ops/relances-reminders.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now relances-reminders.timer
sudo systemctl list-timers relances-reminders.timer
```

Execution manuelle:

```bash
npm run reminders:run
```

## Backup SQLite

```bash
chmod +x scripts/backup-sqlite.sh
scripts/backup-sqlite.sh
```

Backup quotidien via cron systeme ou timer systemd a ajouter selon l'hebergement final.

## Restauration

```bash
sudo systemctl stop relances-architecte.service
cp backups/dev-YYYYMMDDTHHMMSSZ.db dev.db
sudo systemctl start relances-architecte.service
```

## Nginx

Exemple de reverse proxy:

```nginx
server {
    listen 80;
    server_name relances.example.fr;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
