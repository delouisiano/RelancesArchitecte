import "dotenv/config";
import { prisma } from "../lib/prisma";
import { sendReminderEmail } from "../lib/email";

async function main() {
  const architectEmail = process.env.ARCHITECT_EMAIL;
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  if (!architectEmail) {
    throw new Error("ARCHITECT_EMAIL est requis.");
  }

  const dueReminders = await prisma.reminder.findMany({
    where: {
      status: "PENDING",
      dueAt: { lte: new Date() },
      notificationSentAt: null,
    },
    orderBy: { dueAt: "asc" },
  });

  for (const reminder of dueReminders) {
    const result = await sendReminderEmail({
      to: architectEmail,
      projectName: reminder.projectName,
      artisanName: reminder.artisanName,
      artisanContact: reminder.artisanContact,
      note: reminder.note,
      dueAt: reminder.dueAt,
      appUrl,
    });

    if (result.sent) {
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { notificationSentAt: new Date() },
      });
    }
  }

  console.log(`Processed ${dueReminders.length} due reminders.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
