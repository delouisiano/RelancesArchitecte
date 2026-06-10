# Cahier de conception - Relances Architecte

Date: 2026-06-10
Statut: base de conception pour reconstruction propre

## 1. Objectif du produit

Relances Architecte est une application web mono-utilisateur destinee a aider un architecte a suivre les relances artisans et a reduire les oublis dans le suivi de projets.

L'application doit permettre de centraliser les projets, les contacts artisans, les rappels de relance, les modeles de messages, les notifications et l'historique des actions effectuees.

Le produit vise un usage interne simple, fiable et maintenable. Il ne s'agit pas d'un SaaS multi-client.

## 2. Principes de conception

- Application mono-utilisateur.
- Interface sobre, rapide et orientee travail.
- Donnees faciles a sauvegarder et restaurer.
- Architecture claire par domaines metier.
- Taches de notification fiables et observables.
- Validation humaine avant l'envoi des relances.
- Deploiement VPS simple, documente et reproductible.
- Pas de complexite SaaS tant que le besoin reste mono-utilisateur.

## 3. Perimetre fonctionnel

L'application doit couvrir le cycle complet suivant:

1. Creer un projet.
2. Enregistrer un contact artisan.
3. Creer une relance liee a un projet et a un artisan.
4. Definir une date ou un delai de relance.
5. Recevoir une notification quand la relance est due.
6. Preparer un message de relance depuis un template.
7. Copier ou preparer le message pour envoi.
8. Marquer la relance comme relancee, reportee ou cloturee.
9. Conserver un historique minimal des actions.

## 4. Fonctionnalites non retenues

Ces fonctionnalites ne font pas partie de l'application cible actuelle:

- Multi-utilisateur.
- Gestion d'equipes.
- Facturation.
- Espace artisan.
- Envoi automatique de mails sans validation humaine.
- Application mobile native.
- Synchronisation calendrier.
- Gestion avancee de pieces jointes.
- Statistiques complexes.
- Roles admin/client/artisan.

## 5. Fonctionnalites detaillees

### 5.1 Authentification

L'application doit etre protegee par une authentification simple.

Fonctionnalites:

- Connexion avec un compte unique.
- Session persistante via cookie securise.
- Deconnexion.
- Identifiants configures via variables d'environnement.

Contraintes:

- Pas de creation de compte depuis l'interface.
- Pas de gestion multi-role.
- Pas de stockage des secrets en base de donnees.

### 5.2 Tableau de bord

Le tableau de bord doit donner une vision immediate de l'etat des relances.

Elements attendus:

- Nombre de relances dues aujourd'hui.
- Nombre de relances en retard.
- Nombre de relances a venir.
- Liste priorisee des relances urgentes.
- Acces rapide a la creation d'une relance.

### 5.3 Projets

Un projet represente un chantier, une mission ou un dossier suivi par l'architecte.

Champs:

- id
- nom
- description optionnelle
- statut: actif, archive
- date de creation
- date de mise a jour

Fonctionnalites:

- Creer un projet.
- Modifier un projet.
- Archiver un projet.
- Voir les relances associees.

### 5.4 Contacts artisans

Un contact represente une personne ou une entreprise a relancer.

Champs:

- id
- nom
- entreprise optionnelle
- email optionnel
- telephone optionnel
- notes optionnelles
- statut: actif, archive
- date de creation
- date de mise a jour

Fonctionnalites:

- Creer un contact.
- Modifier un contact.
- Archiver un contact.
- Reutiliser un contact dans plusieurs relances.

### 5.5 Relances

La relance est l'objet central de l'application.

Champs:

- id
- titre
- projetId
- contactId
- statut
- dateEcheance
- dateDerniereRelance optionnelle
- dateCloture optionnelle
- note
- templateId optionnel
- date de creation
- date de mise a jour

Statuts:

- a_venir
- due
- en_retard
- relancee
- reportee
- cloturee

Fonctionnalites:

- Creer une relance.
- Modifier une relance.
- Reporter une relance.
- Marquer comme relancee.
- Cloturer une relance.
- Archiver une relance.
- Filtrer par statut, projet, contact et date.
- Trier par echeance.

Regles:

- Une relance avec date d'echeance future est a venir.
- Une relance avec date d'echeance du jour est due.
- Une relance avec date d'echeance passee et non traitee est en retard.
- Une relance cloturee ne genere plus de notification.
- Une relance archivee reste consultable mais sort des vues de travail principales.

### 5.6 Templates de messages

Les templates servent a preparer des mails de relance coherents.

Champs:

- id
- nom
- sujet
- corps
- statut: actif, archive
- date de creation
- date de mise a jour

Variables disponibles:

- nom du projet
- nom du contact
- entreprise du contact
- date d'echeance
- note de la relance

Fonctionnalites:

- Creer un template.
- Modifier un template.
- Archiver un template.
- Previsualiser le rendu avec les donnees d'une relance.

### 5.7 Generation de mail

L'application doit aider l'architecte a preparer le mail, sans l'envoyer automatiquement.

Fonctionnalites:

- Selectionner une relance.
- Choisir un template.
- Generer sujet et corps du message.
- Copier le sujet.
- Copier le corps du message.
- Ouvrir un brouillon via `mailto:` quand l'adresse du contact est disponible.

### 5.8 Notifications

L'application doit notifier l'architecte lorsqu'une relance devient due.

Fonctionnement:

- Une tache planifiee s'execute regulierement.
- Elle cherche les relances dues ou en retard non notifiees recemment.
- Elle envoie un email de notification a l'architecte.
- Elle enregistre un evenement dans l'historique.
- Elle journalise les erreurs d'envoi.

Regles:

- Ne pas spammer plusieurs fois la meme relance dans une courte periode.
- Ne pas notifier les relances cloturees.
- Ne pas notifier les relances archivees.
- Garder une trace de la derniere notification envoyee.

### 5.9 Historique

Chaque relance doit conserver un historique simple.

Evenements:

- creation
- modification
- report
- notification envoyee
- mail genere
- marque comme relancee
- cloture
- archivage

Champs:

- id
- reminderId
- type
- message
- metadata optionnelle
- date de creation

### 5.10 Parametres

La page parametres doit centraliser la configuration fonctionnelle.

Parametres:

- email de l'architecte
- nom de l'architecte ou de l'agence
- delai de rappel par defaut
- frequence de notification
- configuration SMTP via variables d'environnement pour les secrets

Les secrets ne doivent pas etre stockes en clair dans la base.

## 6. Technologies retenues

### Application

- Next.js
- React
- TypeScript
- Tailwind CSS

Justification:

- Convient a une application web mono-utilisateur.
- Permet de gerer interface, routes et actions serveur dans un meme projet.
- Evite de multiplier les services.
- Reste suffisamment structure pour une application maintenable.

### Base de donnees

- SQLite
- Prisma

Justification:

- Suffisant pour une application mono-utilisateur.
- Simple a sauvegarder.
- Facile a heberger sur VPS.
- Prisma apporte des migrations propres et un typage utile.

### Authentification

- Authentification mono-compte par variables d'environnement.
- Session cookie HTTP-only.

Justification:

- Le besoin est simple.
- La gestion d'utilisateurs serait une complexite inutile.

### Emails

- Nodemailer.
- SMTP configure par variables d'environnement.

### Taches planifiees

- systemd timer.

Justification:

- Plus fiable et observable qu'un cron manuel.
- Integrable avec journald.
- Redemarrage et diagnostic plus propres.

### Deploiement

- VPS Linux.
- Node.js LTS.
- Nginx reverse proxy.
- systemd service pour Next.js.
- systemd timer pour les notifications.

## 7. Architecture technique cible

Structure proposee:

```txt
src/
  app/
    login/
    dashboard/
    reminders/
    projects/
    contacts/
    templates/
    settings/
  modules/
    auth/
    reminders/
    projects/
    contacts/
    templates/
    notifications/
    settings/
  lib/
    db/
    mail/
    date/
    env/
    validation/
  scripts/
    send-due-reminders.ts
prisma/
  schema.prisma
docs/
  cahier-conception.md
```

Chaque module metier doit regrouper:

- schemas de validation
- fonctions de lecture/ecriture
- logique metier
- types associes

L'interface ne doit pas contenir directement la logique de notification ou les regles metier complexes.

## 8. Modele de donnees cible

Entites:

- UserSettings
- Project
- Contact
- Reminder
- Template
- ReminderEvent
- NotificationLog

Relations:

- Un projet peut avoir plusieurs relances.
- Un contact peut avoir plusieurs relances.
- Une relance appartient a un projet et a un contact.
- Une relance peut utiliser un template.
- Une relance possede plusieurs evenements.
- Une notification peut etre rattachee a une relance.

## 9. Exploitation VPS

Le deploiement doit inclure:

- installation des dependances via `npm ci`
- build via `npm run build`
- service systemd pour lancer l'application
- timer systemd pour les notifications
- Nginx en reverse proxy
- fichier `.env` documente
- backup quotidien de SQLite
- procedure de restauration
- logs consultables via `journalctl`

## 10. Qualite et maintenabilite

Exigences minimales:

- TypeScript strict.
- Validation serveur des formulaires.
- Migrations Prisma versionnees.
- Aucun secret commite.
- Pas de scripts temporaires dans le repo final.
- Pas de logique metier dispersee dans les composants React.
- Tests unitaires sur les regles de statut et notification.
- Documentation de lancement local et production.

Tests prioritaires:

- calcul du statut d'une relance
- detection des relances dues
- anti-spam notification
- generation de mail depuis template
- creation et report d'une relance

## 11. Parcours utilisateur principaux

### Parcours 1 - Creer une relance

1. L'architecte ouvre l'application.
2. Il cree ou selectionne un projet.
3. Il cree ou selectionne un contact artisan.
4. Il saisit le sujet de la relance.
5. Il choisit une date d'echeance.
6. Il ajoute une note.
7. La relance apparait dans la liste.

### Parcours 2 - Etre notifie

1. Le timer systemd lance le script de verification.
2. Le script trouve les relances dues.
3. L'application envoie un email de notification.
4. Un evenement est enregistre dans l'historique.

### Parcours 3 - Traiter une relance

1. L'architecte ouvre une relance due.
2. Il genere un mail depuis un template.
3. Il copie ou prepare le message.
4. Il marque la relance comme relancee.
5. Il choisit une nouvelle date si une relance future est necessaire.

### Parcours 4 - Cloturer une relance

1. L'architecte ouvre la relance.
2. Il indique que le sujet est traite.
3. La relance passe en statut cloturee.
4. Elle ne genere plus de notification.

## 12. Plan de realisation

### Phase 1 - Socle technique

- Nouveau projet propre.
- Configuration TypeScript, lint et formatting.
- Prisma + SQLite.
- Authentification mono-utilisateur.
- Layout principal.
- Configuration d'environnement.
- Service systemd de production.

### Phase 2 - Coeur metier

- CRUD projets.
- CRUD contacts.
- CRUD relances.
- Calcul des statuts.
- Filtres et tri.
- Historique des relances.

### Phase 3 - Templates et notifications

- CRUD templates.
- Generation de mail.
- Ouverture de brouillon via `mailto:`.
- Script de detection des relances dues.
- Envoi de notification.
- Timer systemd.
- Journalisation des notifications.

### Phase 4 - Stabilisation

- Tests.
- Backups.
- Documentation.
- Nettoyage UX.
- Verification production.

## 13. Definition de termine

L'application est consideree terminee si:

- l'architecte peut gerer projets, contacts et relances;
- les relances dues sont visibles et notifiees;
- un mail de relance peut etre genere depuis un template;
- le message peut etre copie ou prepare via `mailto:`;
- les relances peuvent etre reportees, archivees ou cloturees;
- l'application tourne via systemd;
- les notifications tournent via systemd timer;
- la base est sauvegardee automatiquement;
- la documentation explique installation, configuration, backup et restauration;
- les tests critiques passent.

## 14. Decisions fonctionnelles figees

### 14.1 Ecrans a construire

L'application cible contient les ecrans suivants:

- Connexion.
- Tableau de bord.
- Relances.
- Detail d'une relance.
- Projets.
- Contacts artisans.
- Templates de mail.
- Parametres.

Le tableau de bord est l'ecran d'accueil apres connexion.

### 14.2 Regles de statut des relances

Les statuts stockes en base sont:

- `UPCOMING`: relance a venir.
- `DUE`: relance due aujourd'hui.
- `OVERDUE`: relance en retard.
- `SENT`: relance effectuee.
- `POSTPONED`: relance reportee.
- `CLOSED`: relance cloturee.
- `ARCHIVED`: relance archivee.

Les statuts `DUE` et `OVERDUE` peuvent etre recalcules a partir de la date d'echeance et de l'etat de traitement.

Une relance cloturee ou archivee ne genere plus de notification.

### 14.3 Workflow de relance

Le workflow retenu est:

1. Creation de la relance.
2. Passage automatique en due ou overdue selon la date.
3. Notification email a l'architecte.
4. Generation manuelle du message de relance.
5. Copie du message ou ouverture d'un brouillon `mailto:`.
6. Marquage manuel comme relancee.
7. Choix manuel entre reporter, cloturer ou archiver.

L'application ne cree pas automatiquement une nouvelle echeance apres une relance. L'architecte choisit explicitement de reporter si necessaire.

### 14.4 Regles de notification

Le script de notification s'execute via systemd timer.

Regles:

- Notifier les relances due ou overdue.
- Ne pas notifier les relances sent, closed ou archived.
- Ne pas renvoyer plus d'une notification par relance sur une periode de 24 heures.
- Enregistrer chaque tentative dans `NotificationLog`.
- Enregistrer un evenement dans `ReminderEvent` quand une notification est envoyee.

### 14.5 Strategie de suppression

Les suppressions physiques sont evitees pour les entites metier.

Regle:

- Projet, contact, template et relance sont archives plutot que supprimes.
- Les donnees archivees restent consultables.
- Les vues principales masquent les donnees archivees par defaut.

### 14.6 Configuration

Les secrets sont uniquement dans `.env`.

Variables minimales:

- `DATABASE_URL`
- `APP_BASE_URL`
- `AUTH_USERNAME`
- `AUTH_PASSWORD_HASH`
- `AUTH_SECRET`
- `ARCHITECT_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

### 14.7 Critere de lancement du developpement

Le developpement peut commencer quand:

- le cahier de conception est versionne;
- la branche de reconstruction est creee;
- le schema Prisma cible est defini;
- la structure modulaire est creee;
- le premier build passe.
