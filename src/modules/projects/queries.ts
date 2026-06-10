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
