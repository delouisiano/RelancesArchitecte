import Link from "next/link";
import { createReminder } from "@/modules/reminders/actions";
import { listWorkReminders } from "@/modules/reminders/queries";
import { getReminderStatusLabel } from "@/modules/reminders/status";
import { listActiveContacts } from "@/modules/contacts/queries";
import { listActiveProjects } from "@/modules/projects/queries";
import { listActiveTemplates } from "@/modules/templates/queries";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const [reminders, projects, contacts, templates] = await Promise.all([
    listWorkReminders(),
    listActiveProjects(),
    listActiveContacts(),
    listActiveTemplates(),
  ]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Relances</p>
          <h2>Suivi des echeances</h2>
          <p>
            Cree, filtre et traite les relances artisans sans perdre le fil du dossier.
          </p>
        </div>
      </div>

      <div className="split">
        <form action={createReminder} className="panel form-panel">
          <h3>Nouvelle relance</h3>
          <label>
            Titre
            <input name="title" required placeholder="Relancer le devis plomberie" />
          </label>
          <label>
            Projet
            <select name="projectId" required>
              <option value="">Choisir un projet</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Contact
            <select name="contactId" required>
              <option value="">Choisir un contact</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Modele de message
            <select name="templateId">
              <option value="">Aucun modele</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Date d&apos;echeance
            <input name="dueAt" type="date" required />
          </label>
          <label>
            Note
            <textarea name="note" rows={4} />
          </label>
          <button className="button primary" type="submit">
            Creer la relance
          </button>
        </form>

        <article className="panel">
          <div className="section-title">
            <h3>Relances actives</h3>
            <span className="muted">{reminders.length} relance(s)</span>
          </div>
          {reminders.length === 0 ? (
            <p className="muted">Aucune relance active pour le moment.</p>
          ) : (
            <ul className="record-list">
              {reminders.map((reminder) => (
                <li key={reminder.id}>
                  <div>
                    <strong>{reminder.title}</strong>
                    <p>
                      {reminder.project.name} · {reminder.contact.name}
                    </p>
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
      </div>
    </section>
  );
}
