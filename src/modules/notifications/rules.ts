import { ReminderStatus } from "@/generated/prisma/enums";
import { addHours } from "@/lib/date";
import { resolveReminderStatus, type ReminderStatusInput } from "@/modules/reminders/status";

export type NotificationCandidate = ReminderStatusInput & {
  lastNotifiedAt: Date | null;
};

export function shouldNotifyReminder(
  reminder: NotificationCandidate,
  now = new Date(),
  cooldownHours = 24,
): boolean {
  const status = resolveReminderStatus(reminder, now);

  if (status !== ReminderStatus.DUE && status !== ReminderStatus.OVERDUE) {
    return false;
  }

  if (!reminder.lastNotifiedAt) {
    return true;
  }

  return addHours(reminder.lastNotifiedAt, cooldownHours).getTime() <= now.getTime();
}
