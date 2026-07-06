# Procedure d'installation client - Relances Architecte

Cette procedure decrit les actions a effectuer le jour de l'installation chez le client pour configurer l'environnement, demarrer l'application et activer les services dont elle depend.

Elle part du principe que l'application sera installee sur un VPS Linux avec systemd, Nginx, SQLite et Node.js.

## 1. Informations a recuperer avant l'installation

Avant de commencer, recuperer et valider les informations suivantes:

- nom de domaine ou sous-domaine final, par exemple `relances.client.fr`
- adresse e-mail de l'architecte qui recevra les notifications
- identifiant voulu pour la connexion a l'application
- mot de passe voulu pour la connexion
- parametres SMTP:
  - hote SMTP
  - port SMTP
  - utilisateur SMTP
  - mot de passe SMTP
  - adresse expediteur autorisee
- acces SSH au VPS
- utilisateur Linux qui executera l'application, par defaut `openclaw`
- chemin d'installation, par defaut `/home/openclaw/RelancesArchitecte`

Ne jamais noter les mots de passe en clair dans le repo, dans un ticket, dans un commit ou dans l'historique shell partage. Les secrets vont uniquement dans `.env`.

## 2. Verification du serveur

Se connecter au VPS:

```bash
ssh openclaw@ADRESSE_DU_VPS
```

Verifier les outils disponibles:

```bash
node --version
npm --version
sqlite3 --version
nginx -v
systemctl --version
```

Installer les paquets manquants si necessaire:

```bash
sudo apt update
sudo apt install -y nginx sqlite3 certbot python3-certbot-nginx
```

Node.js doit etre installe en version LTS recente. Si `node --version` retourne une version trop ancienne, installer une version LTS avant de continuer.

## 3. Recuperer ou mettre a jour le code

Aller dans le dossier applicatif:

```bash
cd /home/openclaw/RelancesArchitecte
```

Si le dossier n'existe pas encore:

```bash
cd /home/openclaw
git clone git@github.com:delouisiano/RelancesArchitecte.git
cd RelancesArchitecte
git checkout main
```

Si le dossier existe deja:

```bash
cd /home/openclaw/RelancesArchitecte
git fetch origin
git checkout main
git pull --ff-only origin main
```

Verifier l'etat Git:

```bash
git status -sb
git log --oneline -5
```

L'etat attendu est une branche propre, synchronisee avec `origin/main`.

## 4. Creer le fichier d'environnement

Creer `.env` depuis l'exemple:

```bash
cp .env.example .env
chmod 600 .env
```

Generer le hash SHA-256 du mot de passe applicatif:

```bash
read -s -p "Mot de passe application: " APP_PASSWORD; echo
APP_PASSWORD="$APP_PASSWORD" node -e "const crypto=require('crypto'); console.log(crypto.createHash('sha256').update(process.env.APP_PASSWORD).digest('hex'))"
unset APP_PASSWORD
```

Generer un secret de session:

```bash
openssl rand -hex 32
```

Editer `.env`:

```bash
nano .env
```

Exemple de structure attendue:

```env
DATABASE_URL="file:./dev.db"
APP_BASE_URL="https://relances.client.fr"

AUTH_USERNAME="architecte"
AUTH_PASSWORD_HASH="hash-sha256-du-mot-de-passe"
AUTH_SECRET="secret-long-aleatoire"
AUTH_SESSION_MAX_AGE_SECONDS="43200"

ARCHITECT_EMAIL="architecte@client.fr"
SMTP_HOST="smtp.client.fr"
SMTP_PORT="587"
SMTP_USER="utilisateur-smtp"
SMTP_PASSWORD_FILE="/home/openclaw/.config/relances-architecte/smtp-password"
SMTP_FROM="Relances Architecte <no-reply@client.fr>"
```

Points de controle:

- `APP_BASE_URL` doit correspondre a l'URL finale.
- `AUTH_PASSWORD_HASH` doit etre le hash, pas le mot de passe en clair.
- `AUTH_SECRET` doit etre long et aleatoire.
- `SMTP_FROM` doit etre autorise par le fournisseur SMTP.
- `SMTP_PASSWORD_FILE` permet de garder le mot de passe SMTP hors du `.env` et hors du depot Git.

## 5. Installer les dependances et preparer la base

Installer les dependances:

```bash
npm ci
```

Appliquer les migrations Prisma:

```bash
set -a
. ./.env
set +a
npx prisma migrate deploy
npx prisma generate
```

Si l'installation doit partir avec des donnees de demonstration:

```bash
npm run db:seed
```

Si l'installation doit partir vide, ne pas lancer le seed. Si des donnees demo existent deja, les supprimer avec:

```bash
npm run db:clean-demo
``` 

Verifier que la base existe:

```bash
ls -lh dev.db
```

## 6. Compiler et tester l'application

Lancer les controles:

```bash
npm run lint
npm test
npm run build
```

Tous ces controles doivent passer avant de configurer les services systemd.

## 7. Installer le service web systemd

Copier le service:

```bash
sudo cp ops/relances-architecte.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now relances-architecte.service
```

Verifier le service:

```bash
sudo systemctl status relances-architecte.service --no-pager
journalctl -u relances-architecte.service -n 80 --no-pager
```

Tester l'application localement sur le VPS:

```bash
curl -I http://127.0.0.1:3000/
```

La reponse attendue est `HTTP/1.1 200 OK` ou une redirection vers la connexion si l'authentification est active.

## 8. Installer le timer de notifications

Copier le service et le timer:

```bash
sudo cp ops/relances-reminders.service /etc/systemd/system/
sudo cp ops/relances-reminders.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now relances-reminders.timer
```

Verifier le timer:

```bash
sudo systemctl list-timers relances-reminders.timer --no-pager
sudo systemctl status relances-reminders.timer --no-pager
```

Faire un test manuel du script de notification:

```bash
cd /home/openclaw/RelancesArchitecte
set -a
. ./.env
set +a
npm run reminders:run
```

Verifier les logs:

```bash
journalctl -u relances-reminders.service -n 80 --no-pager
```

## 9. Installer le timer de sauvegarde

Copier le service et le timer de backup:

```bash
sudo cp ops/relances-backup.service /etc/systemd/system/
sudo cp ops/relances-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now relances-backup.timer
```

Tester une sauvegarde manuelle:

```bash
cd /home/relances/RelancesArchitecte
set -a
. ./.env
set +a
npm run backup:db
```

Verifier la sante applicative:

```bash
npm run health:check
```

La page `/health` donne le meme diagnostic dans l'application.

## 10. Configurer Nginx

Creer le fichier Nginx:

```bash
sudo nano /etc/nginx/sites-available/relances-architecte
```

Contenu a adapter:

```nginx
server {
    listen 80;
    server_name relances.client.fr;

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

Activer le site:

```bash
sudo ln -s /etc/nginx/sites-available/relances-architecte /etc/nginx/sites-enabled/relances-architecte
sudo nginx -t
sudo systemctl reload nginx
```

Verifier depuis le VPS:

```bash
curl -I http://relances.client.fr/
```

## 10. Activer HTTPS

Lancer Certbot:

```bash
sudo certbot --nginx -d relances.client.fr
```

Verifier le renouvellement:

```bash
sudo certbot renew --dry-run
```

Mettre a jour `.env` si necessaire:

```env
APP_BASE_URL="https://relances.client.fr"
```

Redemarrer l'application apres modification de `.env`:

```bash
sudo systemctl restart relances-architecte.service
```

## 11. Configurer les backups SQLite

Tester le script de backup:

```bash
cd /home/openclaw/RelancesArchitecte
chmod +x scripts/backup-sqlite.sh
scripts/backup-sqlite.sh
ls -lh backups/
```

Creer un service systemd de backup:

```bash
sudo nano /etc/systemd/system/relances-backup.service
```

Contenu:

```ini
[Unit]
Description=Backup SQLite Relances Architecte

[Service]
Type=oneshot
User=openclaw
Group=openclaw
WorkingDirectory=/home/openclaw/RelancesArchitecte
ExecStart=/home/openclaw/RelancesArchitecte/scripts/backup-sqlite.sh
```

Creer le timer:

```bash
sudo nano /etc/systemd/system/relances-backup.timer
```

Contenu:

```ini
[Unit]
Description=Backup quotidien SQLite Relances Architecte

[Timer]
OnCalendar=*-*-* 03:30:00
Persistent=true
Unit=relances-backup.service

[Install]
WantedBy=timers.target
```

Activer le timer:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now relances-backup.timer
sudo systemctl list-timers relances-backup.timer --no-pager
```

Faire un test de restauration sur une copie, pas sur la base de production:

```bash
mkdir -p /tmp/relances-restore-test
cp backups/dev-*.db /tmp/relances-restore-test/test.db
sqlite3 /tmp/relances-restore-test/test.db "PRAGMA integrity_check;"
```

La reponse attendue est `ok`.

## 12. Verification fonctionnelle finale

Depuis un navigateur:

1. Ouvrir `https://relances.client.fr`.
2. Verifier que la page de connexion apparait.
3. Se connecter avec l'identifiant client.
4. Creer un projet.
5. Creer un contact avec e-mail.
6. Creer un modele de message.
7. Creer une relance avec une echeance proche.
8. Ouvrir la relance.
9. Verifier que le message de relance est genere.
10. Verifier que le bouton de brouillon mail fonctionne.
11. Marquer la relance comme relancee.
12. Reporter une relance.
13. Cloturer une relance.

Depuis le terminal:

```bash
curl -I https://relances.client.fr/
sudo systemctl status relances-architecte.service --no-pager
sudo systemctl status relances-reminders.timer --no-pager
sudo systemctl status relances-backup.timer --no-pager
sudo systemctl list-timers --no-pager | grep relances
```

## 13. Commandes utiles apres installation

Voir les logs web:

```bash
journalctl -u relances-architecte.service -f
```

Voir les logs de notification:

```bash
journalctl -u relances-reminders.service -f
```

Redemarrer l'application:

```bash
sudo systemctl restart relances-architecte.service
```

Relancer manuellement les notifications:

```bash
cd /home/openclaw/RelancesArchitecte
set -a
. ./.env
set +a
npm run reminders:run
```

Lancer un backup manuel:

```bash
cd /home/openclaw/RelancesArchitecte
scripts/backup-sqlite.sh
```

## 14. Rollback simple

Si une mise a jour casse l'application:

```bash
cd /home/openclaw/RelancesArchitecte
git log --oneline -5
git checkout COMMIT_STABLE
npm ci
npm run build
sudo systemctl restart relances-architecte.service
```

Si la base doit etre restauree:

```bash
sudo systemctl stop relances-architecte.service
cp backups/dev-YYYYMMDDTHHMMSSZ.db dev.db
sudo systemctl start relances-architecte.service
```

Faire une copie de la base actuelle avant toute restauration:

```bash
cp dev.db "dev-before-restore-$(date -u +%Y%m%dT%H%M%SZ).db"
```

## 15. Checklist de sortie

Avant de quitter l'installation, verifier:

- application accessible en HTTPS
- connexion fonctionnelle
- `.env` present et protege en `600`
- service web actif
- timer notifications actif
- timer backups actif
- backup manuel teste
- restauration testee sur copie avec `PRAGMA integrity_check`
- SMTP teste
- Nginx valide avec `nginx -t`
- Certbot dry-run OK
- client sait ou trouver l'URL, l'identifiant et la procedure de changement de mot de passe

Si un point est en echec, le noter explicitement avant de partir. Sinon, l'installation a seulement l'air terminee, ce qui est beaucoup moins pratique qu'une installation terminee.
