import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ReminderEventType, ReminderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { verifyReminderActionToken } from "@/modules/reminders/email-actions";
import { sendReminderToContact } from "@/modules/reminders/send-reminder";
import {
  assertReminderCanBeClosed,
  assertReminderCanBePostponed,
} from "@/modules/reminders/transitions";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderResultPage(input: { title: string; message: string; status?: number }) {
  return new NextResponse(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(input.title)}</title></head><body style="margin:0;background:#f5f6f3;color:#20211f;font-family:Arial,Helvetica,sans-serif;display:grid;min-height:100vh;place-items:center;padding:24px;"><main style="max-width:560px;background:#fff;border:1px solid #d8ddd2;border-radius:8px;padding:24px;"><p style="margin:0 0 8px;color:#687064;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Relances Atypik Interieur</p><h1 style="margin:0 0 12px;font-size:24px;">${escapeHtml(input.title)}</h1><p style="margin:0;line-height:1.6;color:#687064;">${escapeHtml(input.message)}</p></main></body></html>`,
    {
      status: input.status ?? 200,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    },
  );
}

function getActionLabel(action: string) {
  if (action === "close") {
    return "Classer la relance";
  }

  if (action === "postpone") {
    return "Reporter la relance";
  }

  if (action === "send") {
    return "Envoyer la relance";
  }

  return "Executer l'action";
}

function renderConfirmationPage(input: { action: string; token: string }) {
  const title = "Confirmer l'action";
  const label = getActionLabel(input.action);

  return new NextResponse(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#f5f6f3;color:#20211f;font-family:Arial,Helvetica,sans-serif;display:grid;min-height:100vh;place-items:center;padding:24px;"><main style="max-width:560px;background:#fff;border:1px solid #d8ddd2;border-radius:8px;padding:24px;"><p style="margin:0 0 8px;color:#687064;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Relances Atypik Interieur</p><h1 style="margin:0 0 12px;font-size:24px;">${title}</h1><p style="margin:0 0 18px;line-height:1.6;color:#687064;">Cette action modifiera la relance. Confirme seulement si tu veux l'executer maintenant.</p><form method="post"><input type="hidden" name="token" value="${escapeHtml(input.token)}"><button type="submit" style="border:0;border-radius:6px;background:#20211f;color:#fff;font-weight:700;padding:11px 14px;cursor:pointer;">${escapeHtml(label)}</button></form></main></body></html>`,
    {
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    },
  );
}

async function closeReminder(reminderId: string) {
  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });

  if (!reminder) {
    throw new Error("Relance introuvable.");
  }

  const transition = assertReminderCanBeClosed(reminder.status);

  if (transition.alreadyClosed) {
    return { alreadyClosed: true };
  }

  await prisma.reminder.update({
    where: { id: reminderId },
    data: {
      status: ReminderStatus.CLOSED,
      closedAt: new Date(),
      events: {
        create: {
          type: ReminderEventType.CLOSED,
          message: "Relance classee depuis le bouton email.",
        },
      },
    },
  });

  return { alreadyClosed: false };
}

async function postponeReminder(reminderId: string) {
  const [reminder, settings] = await Promise.all([
    prisma.reminder.findUnique({ where: { id: reminderId } }),
    prisma.userSettings.findUnique({ where: { id: "default" } }),
  ]);

  if (!reminder) {
    throw new Error("Relance introuvable.");
  }

  assertReminderCanBePostponed(reminder.status);

  const days = settings?.defaultReminderDays ?? 7;
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + days);
  dueAt.setHours(9, 0, 0, 0);

  await prisma.reminder.update({
    where: { id: reminderId },
    data: {
      dueAt,
      status: ReminderStatus.POSTPONED,
      events: {
        create: {
          type: ReminderEventType.POSTPONED,
          message: `Relance reportee de ${days} jour(s) depuis le bouton email.`,
        },
      },
    },
  });

  return { dueAt, days };
}

async function executeReminderAction(action: string, token: string) {
  const payload = verifyReminderActionToken(token, action);

  if (!payload) {
    return renderResultPage({
      title: "Lien invalide ou expire",
      message: "Cette action ne peut pas etre executee. Ouvre la relance dans l'application si besoin.",
      status: 400,
    });
  }

  try {
    if (action === "close") {
      const result = await closeReminder(payload.reminderId);
      revalidatePath("/reminders");
      revalidatePath(`/reminders/${payload.reminderId}`);

      return renderResultPage({
        title: result.alreadyClosed ? "Relance deja classee" : "Relance classee",
        message: result.alreadyClosed
          ? "Aucune modification necessaire, cette relance etait deja classee."
          : "La relance a ete classee avec succes.",
      });
    }

    if (action === "postpone") {
      const result = await postponeReminder(payload.reminderId);
      revalidatePath("/reminders");
      revalidatePath(`/reminders/${payload.reminderId}`);

      return renderResultPage({
        title: "Relance reportee",
        message: `La relance a ete reportee de ${result.days} jour(s), au ${result.dueAt.toLocaleDateString("fr-FR")}.`,
      });
    }

    if (action === "send") {
      const result = await sendReminderToContact(payload.reminderId);
      revalidatePath("/reminders");
      revalidatePath(`/reminders/${payload.reminderId}`);

      return renderResultPage({
        title: result.alreadySent ? "Relance deja envoyee" : "Relance envoyee",
        message: result.alreadySent
          ? "Aucun nouvel email n'a ete envoye, cette relance etait deja marquee comme envoyee."
          : `La relance a ete envoyee a ${result.reminder.contact.email}.`,
      });
    }

    return renderResultPage({
      title: "Action inconnue",
      message: "Cette action n'est pas prise en charge.",
      status: 404,
    });
  } catch (error) {
    return renderResultPage({
      title: "Action impossible",
      message: error instanceof Error ? error.message : "Une erreur inconnue est survenue.",
      status: 400,
    });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return renderResultPage({
      title: "Lien invalide",
      message: "Le lien d'action ne contient pas de jeton de securite.",
      status: 400,
    });
  }

  const payload = verifyReminderActionToken(token, action);

  if (!payload) {
    return renderResultPage({
      title: "Lien invalide ou expire",
      message: "Cette action ne peut pas etre executee. Ouvre la relance dans l'application si besoin.",
      status: 400,
    });
  }

  return renderConfirmationPage({ action, token });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  const formData = await request.formData();
  const token = formData.get("token");

  if (typeof token !== "string" || !token) {
    return renderResultPage({
      title: "Lien invalide",
      message: "Le formulaire d'action ne contient pas de jeton de securite.",
      status: 400,
    });
  }

  return executeReminderAction(action, token);
}
