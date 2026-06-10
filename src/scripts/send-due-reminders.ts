import { prisma } from "@/lib/prisma";
import { sendDueReminders } from "@/modules/notifications/send-due-reminders";

async function main() {
  const result = await sendDueReminders();
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), ...result }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
