import { ArchiveStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { resolveReminderStatus } from "@/modules/reminders/status";

export async function listActiveProjects() {
  return prisma.project.findMany({
    where: {
      status: ArchiveStatus.ACTIVE,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        name: "asc",
      },
    ],
    include: {
      _count: {
        select: {
          reminders: true,
        },
      },
    },
  });
}

export async function getProjectWithReminders(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      reminders: {
        where: {
          status: {
            not: "ARCHIVED",
          },
        },
        include: {
          contact: true,
          template: true,
        },
        orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
      },
      _count: {
        select: {
          reminders: true,
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  return {
    ...project,
    reminders: project.reminders.map((reminder) => ({
      ...reminder,
      computedStatus: resolveReminderStatus(reminder),
    })),
  };
}

export async function listActiveProjectsByLastInteraction() {
  const projects = await prisma.project.findMany({
    where: {
      status: ArchiveStatus.ACTIVE,
    },
    include: {
      reminders: {
        include: {
          events: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      },
      _count: {
        select: {
          reminders: true,
        },
      },
    },
  });

  return projects
    .map((project) => {
      const interactionDates = [
        project.updatedAt,
        ...project.reminders.flatMap((reminder) => [
          reminder.updatedAt,
          ...reminder.events.map((event) => event.createdAt),
        ]),
      ];
      const lastInteractionAt = new Date(
        Math.max(...interactionDates.map((date) => date.getTime())),
      );

      return {
        ...project,
        lastInteractionAt,
      };
    })
    .sort((a, b) => {
      const byInteraction =
        b.lastInteractionAt.getTime() - a.lastInteractionAt.getTime();

      return byInteraction || a.name.localeCompare(b.name);
    });
}
