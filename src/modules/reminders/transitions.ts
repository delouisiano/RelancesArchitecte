import { ReminderStatus } from "@/generated/prisma/enums";

const finalStatuses = new Set<ReminderStatus>([
  ReminderStatus.SENT,
  ReminderStatus.CLOSED,
  ReminderStatus.ARCHIVED,
]);

export function isReminderFinalStatus(status: ReminderStatus): boolean {
  return finalStatuses.has(status);
}

export function assertReminderCanBeSent(status: ReminderStatus) {
  if (status === ReminderStatus.SENT) {
    return { alreadySent: true };
  }

  if (status === ReminderStatus.CLOSED || status === ReminderStatus.ARCHIVED) {
    throw new Error("Cette relance est deja classee ou archivee.");
  }

  return { alreadySent: false };
}

export function assertReminderCanBePostponed(status: ReminderStatus) {
  if (isReminderFinalStatus(status)) {
    throw new Error("Cette relance est deja finalisee.");
  }
}

export function assertReminderCanBeClosed(status: ReminderStatus) {
  if (status === ReminderStatus.CLOSED) {
    return { alreadyClosed: true };
  }

  if (status === ReminderStatus.SENT) {
    throw new Error("Cette relance est deja envoyee.");
  }

  if (status === ReminderStatus.ARCHIVED) {
    throw new Error("Cette relance est archivee.");
  }

  return { alreadyClosed: false };
}
