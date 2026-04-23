import nodemailer from "nodemailer";
import { formatDate } from "./reminders";

type ReminderEmailInput = {
  to: string;
  projectName: string;
  artisanName: string;
  artisanContact: string;
  note?: string | null;
  dueAt: Date;
  appUrl: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || 587);

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  };
}

export async function sendReminderEmail(input: ReminderEmailInput) {
  const smtp = getSmtpConfig();

  if (!smtp) {
    console.log("[email disabled] Rappel en attente", {
      to: input.to,
      projectName: input.projectName,
      artisanName: input.artisanName,
      dueAt: input.dueAt.toISOString(),
    });
    return { sent: false };
  }

  const transporter = nodemailer.createTransport(smtp);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Relance Architecte <noreply@example.com>",
    to: input.to,
    subject: `Relance à vérifier, ${input.projectName}`,
    text: [
      `Le délai de relance est dépassé pour le projet ${input.projectName}.`,
      `Artisan: ${input.artisanName}`,
      `Contact: ${input.artisanContact}`,
      `Échéance: ${formatDate(input.dueAt)}`,
      input.note ? `Note: ${input.note}` : null,
      `Ouvrir l'application: ${input.appUrl}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return { sent: true };
}
