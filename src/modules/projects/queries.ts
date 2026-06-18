import { ArchiveStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

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
