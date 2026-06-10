import test from "node:test";
import assert from "node:assert/strict";
import { ReminderStatus } from "@/generated/prisma/enums";
import { resolveReminderStatus } from "@/modules/reminders/status";

test("resolveReminderStatus keeps final statuses", () => {
  const dueAt = new Date("2026-06-01T12:00:00Z");
  const now = new Date("2026-06-10T12:00:00Z");

  assert.equal(
    resolveReminderStatus({ dueAt, status: ReminderStatus.CLOSED }, now),
    ReminderStatus.CLOSED,
  );
});

test("resolveReminderStatus returns overdue for past due dates", () => {
  assert.equal(
    resolveReminderStatus(
      {
        dueAt: new Date("2026-06-09T12:00:00Z"),
        status: ReminderStatus.UPCOMING,
      },
      new Date("2026-06-10T12:00:00Z"),
    ),
    ReminderStatus.OVERDUE,
  );
});

test("resolveReminderStatus returns due for same-day dates", () => {
  assert.equal(
    resolveReminderStatus(
      {
        dueAt: new Date("2026-06-10T08:00:00Z"),
        status: ReminderStatus.UPCOMING,
      },
      new Date("2026-06-10T12:00:00Z"),
    ),
    ReminderStatus.DUE,
  );
});
