import { ReminderEventType, ReminderStatus } from "@/generated/prisma/enums";
import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { assertReminderCanBeSent } from "@/modules/reminders/transitions";
import { renderTemplate } from "@/modules/templates/render";

const pendingReminderSends = new Set<string>();

function buildFallbackMessage(input: {
  title: string;
  projectName: string;
  contactName: string;
  note?: string | null;
  architectName?: string | null;
  agencyName?: string | null;
}) {
  return {
    subject: `Relance - ${input.projectName}`,
    body: [
      `Bonjour ${input.contactName},`,
      "",
      `Je me permets de vous relancer concernant: ${input.title}.`,
      `Projet: ${input.projectName}`,
      input.note ? `Note: ${input.note}` : null,
      "",
      "Merci par avance pour votre retour.",
      "",
      input.architectName ?? input.agencyName ?? "",
    ]
      .filter((line) => line !== null)
      .join("\n"),
  };
}

export async function sendReminderToContact(reminderId: string) {
  if (pendingReminderSends.has(reminderId)) {
    throw new Error("Un envoi est deja en cours pour cette relance.");
  }

  pendingReminderSends.add(reminderId);

  try {
    const [reminder, settings] = await Promise.all([
      prisma.reminder.findUnique({
        where: { id: reminderId },
        include: { project: true, contact: true, template: true },
      }),
      prisma.userSettings.findUnique({ where: { id: "default" } }),
    ]);

    if (!reminder) {
      throw new Error("Relance introuvable.");
    }

    if (!reminder.contact.email) {
      throw new Error("Le contact de cette relance n'a pas d'email.");
    }

    const transition = assertReminderCanBeSent(reminder.status);

    if (transition.alreadySent) {
      return { reminder, alreadySent: true };
    }

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
      : buildFallbackMessage({
          title: reminder.title,
          projectName: reminder.project.name,
          contactName: reminder.contact.name,
          note: reminder.note,
          architectName: settings?.architectName,
          agencyName: settings?.agencyName,
        });

    await sendMail({
      to: reminder.contact.email,
      subject: renderedMail.subject,
      text: renderedMail.body,
    });

    const updatedReminder = await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        status: ReminderStatus.SENT,
        lastSentAt: new Date(),
        events: {
          create: {
            type: ReminderEventType.SENT,
            message: `Relance envoyee a ${reminder.contact.email}.`,
          },
        },
      },
      include: { project: true, contact: true, template: true },
    });

    return { reminder: updatedReminder, alreadySent: false };
  } finally {
    pendingReminderSends.delete(reminderId);
  }
}
