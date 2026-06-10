import { ReminderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { resolveReminderStatus } from "@/modules/reminders/status";

export async function listWorkReminders() {
  const reminders = await prisma.reminder.findMany({
    where: {
      status: {
        not: ReminderStatus.ARCHIVED,
      },
    },
    include: {
      project: true,
      contact: true,
      template: true,
    },
    orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
  });

  return reminders.map((reminder) => ({
    ...reminder,
    computedStatus: resolveReminderStatus(reminder),
  }));
}

export async function getReminder(id: string) {
  return prisma.reminder.findUnique({
    where: { id },
    include: {
      project: true,
      contact: true,
      template: true,
      events: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}
