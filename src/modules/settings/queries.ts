import { prisma } from "@/lib/prisma";

export async function getSettings() {
  return prisma.userSettings.findUnique({
    where: { id: "default" },
  });
}
