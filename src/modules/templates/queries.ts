import { ArchiveStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function listActiveTemplates() {
  return prisma.template.findMany({
    where: { status: ArchiveStatus.ACTIVE },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });
}
