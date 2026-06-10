import test from "node:test";
import assert from "node:assert/strict";
import { ReminderStatus } from "@/generated/prisma/enums";
import { shouldNotifyReminder } from "@/modules/notifications/rules";

test("shouldNotifyReminder notifies due reminders without previous notification", () => {
  assert.equal(
    shouldNotifyReminder(
      {
        dueAt: new Date("2026-06-10T08:00:00Z"),
        status: ReminderStatus.UPCOMING,
        lastNotifiedAt: null,
      },
      new Date("2026-06-10T12:00:00Z"),
    ),
    true,
  );
});

test("shouldNotifyReminder respects cooldown", () => {
  assert.equal(
    shouldNotifyReminder(
      {
        dueAt: new Date("2026-06-10T08:00:00Z"),
        status: ReminderStatus.UPCOMING,
        lastNotifiedAt: new Date("2026-06-10T10:00:00Z"),
      },
      new Date("2026-06-10T12:00:00Z"),
      24,
    ),
    false,
  );
});

test("shouldNotifyReminder ignores closed reminders", () => {
  assert.equal(
    shouldNotifyReminder(
      {
        dueAt: new Date("2026-06-09T08:00:00Z"),
        status: ReminderStatus.CLOSED,
        lastNotifiedAt: null,
      },
      new Date("2026-06-10T12:00:00Z"),
    ),
    false,
  );
});
