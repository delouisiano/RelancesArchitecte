import { notFound } from "next/navigation";
import {
  archiveReminder,
  closeReminder,
  markReminderSent,
  postponeReminder,
} from "@/modules/reminders/actions";
import { ReminderEventType } from "@/generated/prisma/enums";
import { getReminder } from "@/modules/reminders/queries";
import { getReminderStatusLabel, resolveReminderStatus } from "@/modules/reminders/status";
import { getSettings } from "@/modules/settings/queries";
import { renderTemplate } from "@/modules/templates/render";

export const dynamic = "force-dynamic";

const eventLabels: Record<ReminderEventType, string> = {
  [ReminderEventType.CREATED]: "Creation",
  [ReminderEventType.UPDATED]: "Mise a jour",
  [ReminderEventType.POSTPONED]: "Report",
  [ReminderEventType.NOTIFICATION_SENT]: "Notification envoyee",
  [ReminderEventType.NOTIFICATION_FAILED]: "Notification echouee",
  [ReminderEventType.MAIL_GENERATED]: "Message prepare",
  [ReminderEventType.SENT]: "Relance envoyee",
  [ReminderEventType.CLOSED]: "Cloture",
  [ReminderEventType.ARCHIVED]: "Archivage",
};

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ReminderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [reminder, settings] = await Promise.all([getReminder(id), getSettings()]);

  if (!reminder) {
    notFound();
  }

  const computedStatus = resolveReminderStatus(reminder);
  const renderedMail = reminder.template
    ? renderTemplate({
        subject: reminder.template.subject,
        body: reminder.template.body,
        projectName: reminder.project.name,
        contactName: reminder.contact.name,
        contactCompany: reminder.contact.company,
        dueAt: reminder.dueAt,
        note: reminder.note,
        architectName: settings?.architectName,
      })
    : null;
  const mailto =
    renderedMail && reminder.contact.email
      ? `mailto:${reminder.contact.email}?subject=${encodeURIComponent(
          renderedMail.subject,
        )}&body=${encodeURIComponent(renderedMail.body)}`
      : null;

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Relance</p>
          <h2>{reminder.title}</h2>
          <p>
            {reminder.project.name} · {reminder.contact.name}
          </p>
        </div>
        <span className="badge">{getReminderStatusLabel(computedStatus)}</span>
      </div>

      <div className="split">
        <article className="panel form-panel">
          <h3>Actions</h3>
          <form action={markReminderSent}>
            <input type="hidden" name="id" value={reminder.id} />
            <button className="button primary" type="submit">
              Marquer comme relancee
            </button>
          </form>
          <form action={postponeReminder} className="inline-form">
            <input type="hidden" name="id" value={reminder.id} />
            <label>
              Nouvelle echeance
              <input name="dueAt" type="date" required />
            </label>
            <button className="button" type="submit">
              Reporter
            </button>
          </form>
          <form action={closeReminder}>
            <input type="hidden" name="id" value={reminder.id} />
            <button className="button" type="submit">
              Cloturer
            </button>
          </form>
          <form action={archiveReminder}>
            <input type="hidden" name="id" value={reminder.id} />
            <button className="button" type="submit">
              Archiver
            </button>
          </form>
        </article>

        <div className="stack">
          <article className="panel">
            <h3>Message de relance</h3>
            {renderedMail ? (
              <div className="mail-preview">
                <strong>{renderedMail.subject}</strong>
                <pre>{renderedMail.body}</pre>
                {mailto ? (
                  <a className="button primary" href={mailto}>
                    Ouvrir le brouillon
                  </a>
                ) : (
                  <p className="muted">Ajoute un email au contact pour utiliser mailto.</p>
                )}
              </div>
            ) : (
              <p className="muted">Aucun modele associe a cette relance.</p>
            )}
          </article>

          <article className="panel">
            <h3>Historique</h3>
            {reminder.events.length === 0 ? (
              <p className="muted">Aucun evenement.</p>
            ) : (
              <ul className="record-list compact">
                {reminder.events.map((event) => (
                  <li key={event.id}>
                    <div>
                      <strong>{eventLabels[event.type]}</strong>
                      <p>{event.message}</p>
                      <span className="muted">{formatDateTime(event.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
