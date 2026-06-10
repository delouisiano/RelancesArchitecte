import { ReminderStatus } from "@/generated/prisma/enums";
import { isBeforeDay, isSameDay } from "@/lib/date";

const finalStatuses = new Set<ReminderStatus>([
  ReminderStatus.SENT,
  ReminderStatus.CLOSED,
  ReminderStatus.ARCHIVED,
]);

export type ReminderStatusInput = {
  dueAt: Date;
  status: ReminderStatus;
};

export function isFinalReminderStatus(status: ReminderStatus): boolean {
  return finalStatuses.has(status);
}

export function resolveReminderStatus(
  reminder: ReminderStatusInput,
  now = new Date(),
): ReminderStatus {
  if (isFinalReminderStatus(reminder.status)) {
    return reminder.status;
  }

  if (isBeforeDay(reminder.dueAt, now)) {
    return ReminderStatus.OVERDUE;
  }

  if (isSameDay(reminder.dueAt, now)) {
    return ReminderStatus.DUE;
  }

  return ReminderStatus.UPCOMING;
}

export function getReminderStatusLabel(status: ReminderStatus): string {
  const labels: Record<ReminderStatus, string> = {
    [ReminderStatus.UPCOMING]: "A venir",
    [ReminderStatus.DUE]: "Due",
    [ReminderStatus.OVERDUE]: "En retard",
    [ReminderStatus.SENT]: "Relancee",
    [ReminderStatus.POSTPONED]: "Reportee",
    [ReminderStatus.CLOSED]: "Cloturee",
    [ReminderStatus.ARCHIVED]: "Archivee",
  };

  return labels[status];
}
