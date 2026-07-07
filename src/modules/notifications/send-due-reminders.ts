import { ReminderEventType, ReminderStatus } from "@/generated/prisma/enums";
import { sendMail } from "@/lib/mail";
import { buildReminderNotificationEmail } from "@/modules/notifications/reminder-notification-email";
import { prisma } from "@/lib/prisma";
import { shouldNotifyReminder } from "@/modules/notifications/rules";
import { resolveReminderStatus } from "@/modules/reminders/status";

export async function sendDueReminders(now = new Date()) {
  const settings = await prisma.userSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    throw new Error("Les parametres doivent etre configures avant les notifications.");
  }

  const reminders = await prisma.reminder.findMany({
    where: {
      status: {
        in: [
          ReminderStatus.UPCOMING,
          ReminderStatus.DUE,
          ReminderStatus.OVERDUE,
          ReminderStatus.POSTPONED,
        ],
      },
    },
    include: {
      project: true,
      contact: true,
    },
  });

  let sent = 0;
  let failed = 0;

  for (const reminder of reminders) {
    const computedStatus = resolveReminderStatus(reminder, now);

    if (computedStatus !== reminder.status) {
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: computedStatus },
      });
    }

    if (
      !shouldNotifyReminder(
        { ...reminder, status: computedStatus },
        now,
        settings.notificationCooldown,
      )
    ) {
      continue;
    }

    try {
      const email = buildReminderNotificationEmail({ reminder });

      await sendMail({
        to: settings.architectEmail,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          lastNotifiedAt: now,
          notificationLogs: {
            create: {
              success: true,
              message: "Notification envoyee.",
            },
          },
          events: {
            create: {
              type: ReminderEventType.NOTIFICATION_SENT,
              message: "Notification email envoyee a l'architecte.",
            },
          },
        },
      });
      sent += 1;
    } catch (error) {
      await prisma.notificationLog.create({
        data: {
          reminderId: reminder.id,
          success: false,
          message: error instanceof Error ? error.message : "Erreur inconnue.",
        },
      });
      failed += 1;
    }
  }

  return {
    checked: reminders.length,
    sent,
    failed,
  };
}
