import { createReminderActionUrl } from "@/modules/reminders/email-actions";

type ReminderNotificationInput = {
  reminder: {
    id: string;
    title: string;
    dueAt: Date;
    note?: string | null;
    project: { name: string };
    contact: { name: string; company?: string | null; email?: string | null };
  };
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

function row(label: string, value?: string | null) {
  if (!value) {
    return "";
  }

  return `<tr><td style="padding:8px 0;color:#687064;width:150px;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 0;color:#20211f;font-weight:600;">${escapeHtml(value)}</td></tr>`;
}

export function buildReminderNotificationEmail({ reminder }: ReminderNotificationInput) {
  const closeUrl = createReminderActionUrl({ action: "close", reminderId: reminder.id });
  const sendUrl = createReminderActionUrl({ action: "send", reminderId: reminder.id });
  const postponeUrl = createReminderActionUrl({ action: "postpone", reminderId: reminder.id });
  const dueAt = formatDate(reminder.dueAt);
  const contact = reminder.contact.email
    ? `${reminder.contact.name} <${reminder.contact.email}>`
    : reminder.contact.name;

  const text = [
    `Relance a traiter: ${reminder.title}`,
    `Projet: ${reminder.project.name}`,
    `Contact: ${contact}`,
    reminder.contact.company ? `Entreprise: ${reminder.contact.company}` : null,
    `Echeance: ${dueAt}`,
    reminder.note ? `Note: ${reminder.note}` : null,
    "",
    `Classer la relance: ${closeUrl}`,
    `Reporter la relance: ${postponeUrl}`,
    `Envoyer la relance: ${sendUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#f5f6f3;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#20211f;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #d8ddd2;border-radius:8px;overflow:hidden;">
      <div style="padding:24px;border-bottom:1px solid #d8ddd2;background:#fafbf8;">
        <p style="margin:0 0 8px;color:#687064;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Relance a traiter</p>
        <h1 style="margin:0;font-size:22px;line-height:1.25;color:#20211f;">${escapeHtml(reminder.title)}</h1>
      </div>
      <div style="padding:24px;">
        <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:20px;">
          ${row("Projet", reminder.project.name)}
          ${row("Contact", contact)}
          ${row("Entreprise", reminder.contact.company)}
          ${row("Echeance", dueAt)}
          ${row("Note", reminder.note)}
        </table>
        <div style="display:block;margin-top:22px;">
          <a href="${escapeHtml(closeUrl)}" style="display:inline-block;margin:0 10px 10px 0;padding:12px 16px;border-radius:6px;background:#edf0ea;color:#20211f;text-decoration:none;font-weight:700;">Classer la relance</a>
          <a href="${escapeHtml(postponeUrl)}" style="display:inline-block;margin:0 10px 10px 0;padding:12px 16px;border-radius:6px;background:#fff3df;color:#7b3f08;text-decoration:none;font-weight:700;">Reporter</a>
          <a href="${escapeHtml(sendUrl)}" style="display:inline-block;margin:0 0 10px 0;padding:12px 16px;border-radius:6px;background:#236b5a;color:#ffffff;text-decoration:none;font-weight:700;">Envoyer la relance</a>
        </div>
        <p style="margin:18px 0 0;color:#687064;font-size:13px;line-height:1.5;">Ces liens sont signes et expirent automatiquement.</p>
      </div>
    </div>
  </body>
</html>`;

  return {
    subject: `Relance a traiter - ${reminder.title}`,
    text,
    html,
  };
}
