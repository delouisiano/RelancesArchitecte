import { ReminderStatus } from "@/generated/prisma/enums";
import { isBeforeDay, isSameDay } from "@/lib/date";
import { isReminderFinalStatus } from "@/modules/reminders/transitions";

export type ReminderStatusInput = {
  dueAt: Date;
  status: ReminderStatus;
};

export function isFinalReminderStatus(status: ReminderStatus): boolean {
  return isReminderFinalStatus(status);
}

export function resolveReminderStatus(
  reminder: ReminderStatusInput,
  now = new Date(),
): ReminderStatus {
  if (isReminderFinalStatus(reminder.status)) {
    return reminder.status;
  }

  if (isBeforeDay(reminder.dueAt, now)) {
    return ReminderStatus.OVERDUE;
  }

  if (isSameDay(reminder.dueAt, now)) {
    return ReminderStatus.DUE;
  }

  if (reminder.status === ReminderStatus.POSTPONED) {
    return ReminderStatus.POSTPONED;
  }

  return ReminderStatus.UPCOMING;
}

export function getReminderStatusLabel(status: ReminderStatus): string {
  const labels: Record<ReminderStatus, string> = {
    [ReminderStatus.UPCOMING]: "A venir",
    [ReminderStatus.DUE]: "A traiter",
    [ReminderStatus.OVERDUE]: "En retard",
    [ReminderStatus.SENT]: "Relancee",
    [ReminderStatus.POSTPONED]: "Reportee",
    [ReminderStatus.CLOSED]: "Cloturee",
    [ReminderStatus.ARCHIVED]: "Archivee",
  };

  return labels[status];
}
