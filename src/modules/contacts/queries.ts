import { ArchiveStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function listActiveContacts() {
  return prisma.contact.findMany({
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
