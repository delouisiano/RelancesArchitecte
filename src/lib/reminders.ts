import { ReminderStatus } from "../generated/prisma/enums";

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getStatusLabel(status: ReminderStatus) {
  switch (status) {
    case ReminderStatus.PENDING:
      return "En attente";
    case ReminderStatus.DONE:
      return "Relancé";
    case ReminderStatus.RESPONDED:
      return "Répondu";
    case ReminderStatus.ABANDONED:
      return "Abandonné";
    default:
      return status;
  }
}

export function isOverdue(dueAt: Date, status: ReminderStatus) {
  return status === ReminderStatus.PENDING && dueAt.getTime() < Date.now();
}


export function getStatusTone(status: ReminderStatus) {
  switch (status) {
    case ReminderStatus.DONE:
      return "success";
    case ReminderStatus.RESPONDED:
      return "info";
    case ReminderStatus.ABANDONED:
      return "muted";
    case ReminderStatus.PENDING:
    default:
      return "pending";
  }
}
