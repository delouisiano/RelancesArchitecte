import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectWithReminders } from "@/modules/projects/queries";
import { getReminderStatusLabel } from "@/modules/reminders/status";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectWithReminders(id);

  if (!project) {
    notFound();
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Dossier</p>
          <h2>{project.name}</h2>
          {project.description ? <p>{project.description}</p> : null}
        </div>
        <Link className="button" href={`/reminders?projectId=${project.id}`}>
          Filtrer dans relances
        </Link>
      </div>

      <div className="grid">
        <article className="panel metric">
          <span className="muted">Relances du dossier</span>
          <strong>{project.reminders.length}</strong>
        </article>
        <article className="panel metric">
          <span className="muted">Derniere mise a jour</span>
          <strong>{project.updatedAt.toLocaleDateString("fr-FR")}</strong>
        </article>
      </div>

      <article className="panel list-panel">
        <div className="section-title">
          <h3>Relances assignees</h3>
          <span className="muted">{project.reminders.length} relance(s)</span>
        </div>
        {project.reminders.length === 0 ? (
          <p className="muted">Aucune relance assignee a ce dossier.</p>
        ) : (
          <ul className="record-list">
            {project.reminders.map((reminder) => (
              <li key={reminder.id}>
                <div>
                  <strong>{reminder.title}</strong>
                  <p>{reminder.contact.name}</p>
                  <span className="badge">
                    {getReminderStatusLabel(reminder.computedStatus)}
                  </span>
                  <span className="muted">
                    Echeance: {reminder.dueAt.toISOString().slice(0, 10)}
                  </span>
                </div>
                <Link className="button" href={`/reminders/${reminder.id}`}>
                  Ouvrir
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
