import { ReminderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { shouldNotifyReminder } from "@/modules/notifications/rules";

async function main() {
  const now = new Date();
  const reminders = await prisma.reminder.findMany({
    where: {
      status: {
        in: [ReminderStatus.UPCOMING, ReminderStatus.DUE, ReminderStatus.OVERDUE],
      },
    },
    select: {
      id: true,
      title: true,
      dueAt: true,
      status: true,
      lastNotifiedAt: true,
    },
  });

  const dueReminders = reminders.filter((reminder) =>
    shouldNotifyReminder(reminder, now),
  );

  console.log(
    JSON.stringify({
      checkedAt: now.toISOString(),
      checked: reminders.length,
      due: dueReminders.length,
    }),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
