import { ReminderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { resolveReminderStatus } from "@/modules/reminders/status";

export type ReminderSort = "due-asc" | "due-desc" | "project" | "status";

export type ReminderFilters = {
  projectId?: string;
  status?: ReminderStatus;
  dueFrom?: Date;
  dueTo?: Date;
  sort?: ReminderSort;
};

export async function listWorkReminders(filters: ReminderFilters = {}) {
  const reminders = await prisma.reminder.findMany({
    where: {
      status: {
        not: ReminderStatus.ARCHIVED,
      },
      projectId: filters.projectId,
    },
    include: {
      project: true,
      contact: true,
      template: true,
    },
    orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
  });

  return reminders
    .map((reminder) => ({
      ...reminder,
      computedStatus: resolveReminderStatus(reminder),
    }))
    .filter((reminder) => {
      if (filters.status && reminder.computedStatus !== filters.status) {
        return false;
      }

      if (filters.dueFrom && reminder.dueAt < filters.dueFrom) {
        return false;
      }

      if (filters.dueTo && reminder.dueAt > filters.dueTo) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "due-desc":
          return b.dueAt.getTime() - a.dueAt.getTime();
        case "project":
          return a.project.name.localeCompare(b.project.name) || a.dueAt.getTime() - b.dueAt.getTime();
        case "status":
          return (
            a.computedStatus.localeCompare(b.computedStatus) ||
            a.dueAt.getTime() - b.dueAt.getTime()
          );
        case "due-asc":
        default:
          return a.dueAt.getTime() - b.dueAt.getTime();
      }
    });
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
