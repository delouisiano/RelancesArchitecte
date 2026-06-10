"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ReminderEventType, ReminderStatus } from "@/generated/prisma/enums";
import { readOptionalText, readRequiredDate, readRequiredText } from "@/lib/form";
import { prisma } from "@/lib/prisma";
import { resolveReminderStatus } from "@/modules/reminders/status";

export async function createReminder(formData: FormData) {
  const dueAt = readRequiredDate(formData, "dueAt");
  const status = resolveReminderStatus({ dueAt, status: ReminderStatus.UPCOMING });

  const reminder = await prisma.reminder.create({
    data: {
      title: readRequiredText(formData, "title"),
      projectId: readRequiredText(formData, "projectId"),
      contactId: readRequiredText(formData, "contactId"),
      templateId: readOptionalText(formData, "templateId"),
      dueAt,
      note: readOptionalText(formData, "note"),
      status,
      events: {
        create: {
          type: ReminderEventType.CREATED,
          message: "Relance creee.",
        },
      },
    },
  });

  revalidatePath("/reminders");
  redirect(`/reminders/${reminder.id}`);
}

export async function markReminderSent(formData: FormData) {
  const id = readRequiredText(formData, "id");

  await prisma.reminder.update({
    where: { id },
    data: {
      status: ReminderStatus.SENT,
      lastSentAt: new Date(),
      events: {
        create: {
          type: ReminderEventType.SENT,
          message: "Relance marquee comme effectuee.",
        },
      },
    },
  });

  revalidatePath("/reminders");
  revalidatePath(`/reminders/${id}`);
}

export async function postponeReminder(formData: FormData) {
  const id = readRequiredText(formData, "id");
  const dueAt = readRequiredDate(formData, "dueAt");

  await prisma.reminder.update({
    where: { id },
    data: {
      dueAt,
      status: ReminderStatus.POSTPONED,
      events: {
        create: {
          type: ReminderEventType.POSTPONED,
          message: `Relance reportee au ${dueAt.toISOString().slice(0, 10)}.`,
        },
      },
    },
  });

  revalidatePath("/reminders");
  revalidatePath(`/reminders/${id}`);
}

export async function closeReminder(formData: FormData) {
  const id = readRequiredText(formData, "id");

  await prisma.reminder.update({
    where: { id },
    data: {
      status: ReminderStatus.CLOSED,
      closedAt: new Date(),
      events: {
        create: {
          type: ReminderEventType.CLOSED,
          message: "Relance cloturee.",
        },
      },
    },
  });

  revalidatePath("/reminders");
  revalidatePath(`/reminders/${id}`);
}

export async function archiveReminder(formData: FormData) {
  const id = readRequiredText(formData, "id");

  await prisma.reminder.update({
    where: { id },
    data: {
      status: ReminderStatus.ARCHIVED,
      events: {
        create: {
          type: ReminderEventType.ARCHIVED,
          message: "Relance archivee.",
        },
      },
    },
  });

  revalidatePath("/reminders");
  redirect("/reminders");
}
