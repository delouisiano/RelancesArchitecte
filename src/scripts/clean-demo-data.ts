import { prisma } from "@/lib/prisma";

async function main() {
  const [projects, contacts, templates] = await Promise.all([
    prisma.project.findMany({ where: { id: { startsWith: "demo-" } }, select: { id: true } }),
    prisma.contact.findMany({ where: { id: { startsWith: "demo-" } }, select: { id: true } }),
    prisma.template.findMany({ where: { id: { startsWith: "demo-" } }, select: { id: true } }),
  ]);

  const projectIds = projects.map((project) => project.id);
  const contactIds = contacts.map((contact) => contact.id);
  const templateIds = templates.map((template) => template.id);
  const reminders = await prisma.reminder.findMany({
    where: {
      OR: [
        { id: { startsWith: "demo-" } },
        { projectId: { in: projectIds } },
        { contactId: { in: contactIds } },
        { templateId: { in: templateIds } },
      ],
    },
    select: { id: true },
  });
  const reminderIds = reminders.map((reminder) => reminder.id);

  await prisma.$transaction([
    prisma.notificationLog.deleteMany({ where: { reminderId: { in: reminderIds } } }),
    prisma.reminderEvent.deleteMany({ where: { reminderId: { in: reminderIds } } }),
    prisma.reminder.deleteMany({ where: { id: { in: reminderIds } } }),
    prisma.project.deleteMany({ where: { id: { in: projectIds } } }),
    prisma.contact.deleteMany({ where: { id: { in: contactIds } } }),
    prisma.template.deleteMany({ where: { id: { in: templateIds } } }),
  ]);

  console.log(JSON.stringify({
    deletedReminders: reminderIds.length,
    deletedProjects: projectIds.length,
    deletedContacts: contactIds.length,
    deletedTemplates: templateIds.length,
  }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
