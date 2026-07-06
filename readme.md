# Relances Architecte

Application metier Next.js pour suivre les dossiers d'architecture, centraliser les contacts artisans, preparer les modeles de mails et automatiser les notifications de relance.

## Objectif

L'application aide une agence d'architecture a suivre les relances artisans, fournisseurs ou interlocuteurs projet. Elle permet de :

- gerer des dossiers/projets ;
- gerer des contacts ;
- creer des modeles de mails ;
- creer et suivre des relances ;
- envoyer des notifications automatiques a l'architecte ;
- envoyer une relance au contact depuis un bouton email signe.

## Stack technique

- Next.js 16, App Router
- React 19
- TypeScript
- Tailwind CSS 4 via `src/app/globals.css`
- Prisma 7
- SQLite avec `better-sqlite3`
- Nodemailer pour SMTP
- systemd utilisateur et crontab fallback sur le VPS

## Arborescence

```text
src/app/                  Pages et routes Next.js
src/app/reminders/        Liste, detail et actions email des relances
src/app/projects/         Liste projets et page detail projet
src/modules/              Logique metier par domaine
src/modules/reminders/    Creation, statut, filtres, actions email, envoi au contact
src/modules/notifications Regles et rendu des notifications automatiques
src/modules/templates/    Rendu des modeles de mail avec variables
src/lib/                  Env, Prisma, mail, helpers formulaire/date
prisma/schema.prisma      Modele de donnees SQLite
ops/                      Units systemd de reference
docs/                     Documentation fonctionnelle et procedure client
```

## Donnees principales

Les tables importantes sont :

- `Project` : dossier suivi ;
- `Contact` : artisan, fournisseur ou interlocuteur ;
- `Template` : sujet et corps de mail reutilisables ;
- `Reminder` : relance rattachee a un projet et un contact ;
- `ReminderEvent` : historique d'une relance ;
- `NotificationLog` : resultat des notifications ;
- `UserSettings` : reglages globaux de l'agence.

## Statuts des relances

Les statuts sont definis dans `prisma/schema.prisma`.

```text
UPCOMING   A venir
DUE        A traiter aujourd'hui
OVERDUE    En retard
SENT       Relance envoyee
POSTPONED  Reportee
CLOSED     Cloturee
ARCHIVED   Archivee
```

Le statut affiche est recalcule par `resolveReminderStatus` selon la date d'echeance et le statut stocke. Une relance `SENT`, `CLOSED` ou `ARCHIVED` est finale.

## Modeles de mail

Un modele contient un sujet et un corps. Les variables principales sont :

```text
{{nomProjet}}
{{nomContact}}
{{entrepriseContact}}
{{echeance}}
{{note}}
{{nomArchitecte}}
```

Le rendu est gere par `src/modules/templates/render.ts`.

## Notifications et boutons email

Le script `npm run reminders:run` execute `src/scripts/send-due-reminders.ts`, qui appelle `sendDueReminders`.

Une relance est notifiable si :

- son statut calcule est `DUE` ou `OVERDUE` ;
- elle n'a jamais ete notifiee, ou son `lastNotifiedAt` est plus ancien que le cooldown configure.

Le cooldown est stocke dans `UserSettings.notificationCooldown`, en heures.

Les notifications envoyees a l'architecte sont des emails HTML avec resume de la relance et deux boutons :

- `Classer la relance` : passe la relance en `CLOSED` ;
- `Envoyer la relance` : envoie le modele au contact, puis passe la relance en `SENT`.

Les liens sont signes avec `ACTION_SECRET` dans `src/modules/reminders/email-actions.ts`. Ils expirent apres 7 jours.

## Configuration

Le fichier `.env` reste local au VPS et ne doit pas etre commite.

Exemple :

```env
DATABASE_URL="file:./dev.db"
APP_BASE_URL="https://architecte.delouisiano.fr"

SMTP_HOST="ssl0.ovh.net"
SMTP_PORT="465"
SMTP_USER="relances@atypik-interieur.com"
SMTP_PASSWORD_FILE="/home/openclaw/.config/relances-architecte/smtp-password"
SMTP_FROM="Atypik Interieur - Relances <relances@atypik-interieur.com>"

ACTION_SECRET="secret-long-aleatoire"
```

Le mot de passe SMTP est stocke hors depot dans :

```text
/home/openclaw/.config/relances-architecte/smtp-password
```

Permissions recommandees :

```bash
chmod 700 /home/openclaw/.config/relances-architecte
chmod 600 /home/openclaw/.config/relances-architecte/smtp-password
chmod 600 /home/openclaw/RelancesArchitecte/.env
```

## Commandes utiles

```bash
npm run lint
npm run build
npm start
npm run reminders:run
```

`npm test` est conserve comme commande neutre pour les pipelines, mais il n'y a plus de suite de tests automatisee active actuellement.

## Base SQLite

La base active est `dev.db` a la racine du projet.

Avant operation risquee :

```bash
mkdir -p backups
cp dev.db backups/dev.db.before-change-$(date -u +%Y%m%d-%H%M%S).sqlite
```

Pour supprimer une relance manuellement, supprimer d'abord ses `NotificationLog` et `ReminderEvent`, puis la ligne `Reminder`.

## Exploitation VPS

Le projet tourne sur le VPS dans :

```text
/home/openclaw/RelancesArchitecte
```

Service web :

```bash
systemctl --user status relances-architecte.service
systemctl --user restart relances-architecte.service
```

Timer de notifications :

```bash
systemctl --user status relances-reminders.timer
systemctl --user list-timers --all | grep relances
journalctl --user -u relances-reminders.service -n 50 --no-pager
```

Comme `linger` n'est pas actif sans privileges sudo, une crontab de secours garde l'app disponible et lance les relances si le timer systemd utilisateur n'est pas actif.

Voir la crontab :

```bash
crontab -l
```

## Workflow de maintenance

```bash
cd /home/openclaw/RelancesArchitecte
git status --short
npm run lint
npm run build
systemctl --user restart relances-architecte.service
curl -fsS -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3000/
git add .
git commit -m "Message clair"
git push origin rebuild-single-version
```

## Points de vigilance

- Ne jamais commiter `.env`, `dev.db`, les backups SQLite ou le fichier de mot de passe SMTP.
- `APP_BASE_URL` doit pointer vers le domaine public utilise dans les emails.
- Les boutons email sont des liens HTTP GET signes. Ils sont idempotents, mais certains clients mail peuvent previsualiser des liens.
- Les relances `DUE` et `OVERDUE` peuvent declencher des notifications au prochain passage du timer.
- Avant d'activer un timer sur une base de test, verifier les relances eligibles.
