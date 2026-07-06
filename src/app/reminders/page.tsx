import Link from "next/link";
import { ReminderStatus } from "@/generated/prisma/enums";
import { CreateDialog } from "@/components/create-dialog";
import { createReminder } from "@/modules/reminders/actions";
import { listWorkReminders, type ReminderFilters, type ReminderSort } from "@/modules/reminders/queries";
import { getReminderStatusLabel } from "@/modules/reminders/status";
import { listActiveContacts } from "@/modules/contacts/queries";
import { listActiveProjects } from "@/modules/projects/queries";
import { listActiveTemplates } from "@/modules/templates/queries";

export const dynamic = "force-dynamic";

const statusOptions: ReminderStatus[] = [
  ReminderStatus.DUE,
  ReminderStatus.OVERDUE,
  ReminderStatus.UPCOMING,
  ReminderStatus.SENT,
  ReminderStatus.POSTPONED,
  ReminderStatus.CLOSED,
];

const sortOptions: { value: ReminderSort; label: string }[] = [
  { value: "due-asc", label: "Echeance proche" },
  { value: "due-desc", label: "Echeance lointaine" },
  { value: "project", label: "Projet" },
  { value: "status", label: "Tag / statut" },
];

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseDateParam(value: string | undefined, endOfDay = false) {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseStatus(value: string | undefined) {
  return statusOptions.includes(value as ReminderStatus) ? (value as ReminderStatus) : undefined;
}

function parseSort(value: string | undefined): ReminderSort {
  return sortOptions.some((option) => option.value === value) ? (value as ReminderSort) : "due-asc";
}

export default async function RemindersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const selectedProjectId = getSingleParam(params.projectId) ?? "";
  const selectedStatus = parseStatus(getSingleParam(params.status));
  const dueFromValue = getSingleParam(params.dueFrom) ?? "";
  const dueToValue = getSingleParam(params.dueTo) ?? "";
  const selectedSort = parseSort(getSingleParam(params.sort));
  const filters: ReminderFilters = {
    projectId: selectedProjectId || undefined,
    status: selectedStatus,
    dueFrom: parseDateParam(dueFromValue),
    dueTo: parseDateParam(dueToValue, true),
    sort: selectedSort,
  };

  const [reminders, projects, contacts, templates] = await Promise.all([
    listWorkReminders(filters),
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

      <form className="panel filter-panel" method="get" action="/reminders">
        <label>
          Tag / statut
          <select name="status" defaultValue={selectedStatus ?? ""}>
            <option value="">Tous</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {getReminderStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Projet
          <select name="projectId" defaultValue={selectedProjectId}>
            <option value="">Tous les projets</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Echeance debut
          <input name="dueFrom" type="date" defaultValue={dueFromValue} />
        </label>
        <label>
          Echeance fin
          <input name="dueTo" type="date" defaultValue={dueToValue} />
        </label>
        <label>
          Tri
          <select name="sort" defaultValue={selectedSort}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="filter-actions">
          <button className="button primary" type="submit">
            Filtrer
          </button>
          <Link className="button" href="/reminders">
            Reinitialiser
          </Link>
        </div>
      </form>

      <div className="center-list">
        <article className="panel list-panel">
          <div className="section-title">
            <h3>Relances actives</h3>
            <span className="muted">{reminders.length} relance(s)</span>
          </div>
          {reminders.length === 0 ? (
            <p className="muted">Aucune relance ne correspond aux filtres.</p>
          ) : (
            <ul className="record-list">
              {reminders.map((reminder) => (
                <li key={reminder.id}>
                  <div>
                    <strong>{reminder.title}</strong>
                    <p>
                      <Link href={`/projects/${reminder.project.id}`}>
                        {reminder.project.name}
                      </Link>{" "}
                      · {reminder.contact.name}
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

      <CreateDialog buttonLabel="Ajouter une relance" title="Nouvelle relance">
        <form action={createReminder} className="panel form-panel">
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
      </CreateDialog>
    </section>
  );
}
