import Link from "next/link";
import { ReminderStatus } from "@/generated/prisma/enums";
import { listActiveProjectsByLastInteraction } from "@/modules/projects/queries";
import { listWorkReminders } from "@/modules/reminders/queries";
import { getReminderStatusLabel } from "@/modules/reminders/status";

export const dynamic = "force-dynamic";

const statuses = [
  {
    status: ReminderStatus.DUE,
    description: "Relance a traiter aujourd'hui.",
  },
  {
    status: ReminderStatus.OVERDUE,
    description: "Relance dont l'echeance est depassee.",
  },
  {
    status: ReminderStatus.UPCOMING,
    description: "Relance programmee pour plus tard.",
  },
  {
    status: ReminderStatus.SENT,
    description: "Relance deja envoyee a l'entreprise.",
  },
  {
    status: ReminderStatus.POSTPONED,
    description: "Relance reportee a une nouvelle date.",
  },
  {
    status: ReminderStatus.CLOSED,
    description: "Sujet cloture, aucune action attendue.",
  },
];

export default async function DashboardPage() {
  const [reminders, projects] = await Promise.all([
    listWorkReminders(),
    listActiveProjectsByLastInteraction(),
  ]);

  const countByStatus = new Map<ReminderStatus, number>();
  for (const reminder of reminders) {
    countByStatus.set(
      reminder.computedStatus,
      (countByStatus.get(reminder.computedStatus) ?? 0) + 1,
    );
  }

  const metrics = [
    {
      label: "A traiter aujourd'hui",
      value: countByStatus.get(ReminderStatus.DUE) ?? 0,
    },
    {
      label: "En retard",
      value: countByStatus.get(ReminderStatus.OVERDUE) ?? 0,
    },
    {
      label: "A venir",
      value: countByStatus.get(ReminderStatus.UPCOMING) ?? 0,
    },
  ];

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Tableau de bord</p>
          <h2>Priorites de relance</h2>
          <p>
            Vue d&apos;ensemble des relances a traiter, des echeances en retard et des
            relances a venir.
          </p>
        </div>
        <Link className="button" href="/reminders">
          Voir les relances
        </Link>
      </div>

      <div className="grid">
        {metrics.map((metric) => (
          <article className="panel metric" key={metric.label}>
            <span className="muted">{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <section className="dossier-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Dossiers</p>
            <h3>Dossiers recents</h3>
          </div>
          <Link className="button" href="/projects">
            Voir tous
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="muted">Aucun projet actif pour le moment.</p>
        ) : (
          <ul className="dossier-grid">
            {projects.map((project) => (
              <li key={project.id}>
                <Link className="dossier-card" href={`/projects/${project.id}`}>
                  <span className="dossier-tab" aria-hidden="true" />
                  <strong>{project.name}</strong>
                  {project.description ? <p>{project.description}</p> : null}
                  <div className="dossier-meta">
                    <span>{project._count.reminders} relance(s)</span>
                    <span>
                      {project.lastInteractionAt.toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <article className="panel">
        <h3>Lecture des statuts</h3>
        <ul className="status-list">
          {statuses.map((item) => (
            <li key={item.status}>
              <span>{getReminderStatusLabel(item.status)}</span>
              <span className="muted">{item.description}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
