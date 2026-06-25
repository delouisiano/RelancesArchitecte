import Link from "next/link";

const sections = [
  {
    title: "Tableau de bord",
    text: "La page d'accueil donne les priorites du jour: relances a traiter, relances en retard et relances a venir. Elle affiche aussi les dossiers recents pour reprendre rapidement le fil.",
    href: "/",
    action: "Commencer par cette page chaque matin.",
  },
  {
    title: "Relances",
    text: "Cette section contient les echeances artisans. Chaque relance est rattachee a un projet, a un contact et, si besoin, a un modele de message.",
    href: "/reminders",
    action: "Ouvrir une relance pour la traiter, la reporter ou cloturer le sujet.",
  },
  {
    title: "Projets",
    text: "Les projets regroupent le contexte d'un dossier: chantier, mission, client ou phase de travail. Ils servent de classeur pour les relances.",
    href: "/projects",
    action: "Creer un projet avant de multiplier les relances dessus.",
  },
  {
    title: "Contacts",
    text: "Les contacts representent les artisans, entreprises ou interlocuteurs a relancer. Un contact bien renseigne evite les recherches au moment d'envoyer le message.",
    href: "/contacts",
    action: "Verifier le nom et l'email avant de generer un mail de relance.",
  },
  {
    title: "Modeles",
    text: "Les modeles preparent les textes reutilisables. Ils servent de base pour generer un message coherent sans reecrire la meme relance a la main.",
    href: "/templates",
    action: "Garder quelques modeles courts par situation courante.",
  },
  {
    title: "Parametres",
    text: "Les parametres stockent les informations fonctionnelles: architecte, agence, email de notification et delais par defaut. Les secrets techniques restent sur le VPS.",
    href: "/settings",
    action: "Ajuster ici les valeurs par defaut de l'application.",
  },
];

const workflow = [
  "Creer ou verifier le projet concerne.",
  "Ajouter le contact artisan si l'entreprise n'existe pas encore.",
  "Creer une relance avec une date d'echeance claire.",
  "Associer un modele si un mail type doit etre prepare.",
  "Traiter les relances dues depuis la page Relances ou le tableau de bord.",
  "Reporter, marquer comme envoyee ou cloturer la relance selon la situation.",
];

const statusNotes = [
  {
    label: "A traiter",
    text: "La relance arrive a echeance aujourd'hui. C'est le haut de la pile, pas une suggestion decorative.",
  },
  {
    label: "En retard",
    text: "L'echeance est depassee. A regarder en priorite pour eviter que le dossier dorme dans un coin.",
  },
  {
    label: "A venir",
    text: "La relance est programmee plus tard. Elle reste visible sans polluer les urgences.",
  },
  {
    label: "Envoyee, reportee, cloturee",
    text: "Ces etats permettent de garder l'historique et de savoir si une action reste attendue.",
  },
];

export default function ManualPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Manuel</p>
          <h2>Mode d&apos;emploi de l&apos;application</h2>
          <p>
            Reference rapide pour comprendre les sections, suivre le bon ordre de
            travail et utiliser les relances sans transformer l&apos;outil en tableur
            maudit.
          </p>
        </div>
      </div>

      <section className="manual-grid" aria-label="Sections de l&apos;application">
        {sections.map((section) => (
          <article className="panel manual-card" key={section.title}>
            <div>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
            </div>
            <div className="manual-card-footer">
              <span className="muted">{section.action}</span>
              <Link className="button" href={section.href}>
                Ouvrir
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="manual-layout">
        <article className="panel manual-flow">
          <p className="eyebrow">Routine conseillee</p>
          <h3>Cycle de travail</h3>
          <ol className="manual-steps">
            {workflow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="panel manual-flow">
          <p className="eyebrow">Statuts</p>
          <h3>Comment lire les priorites</h3>
          <ul className="manual-notes">
            {statusNotes.map((note) => (
              <li key={note.label}>
                <strong>{note.label}</strong>
                <span>{note.text}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <article className="panel manual-flow">
        <p className="eyebrow">Notifications</p>
        <h3>Fonctionnement automatique</h3>
        <p>
          Le VPS peut executer une tache planifiee qui cherche les relances dues et
          envoie une notification a l&apos;adresse configuree dans les parametres. La
          notification signale qu&apos;une action est necessaire; l&apos;envoi final du mail
          de relance reste une decision humaine.
        </p>
      </article>
    </section>
  );
}
