"use server";

import { revalidatePath } from "next/cache";
import { ArchiveStatus } from "@/generated/prisma/enums";
import { readOptionalText, readRequiredText } from "@/lib/form";
import { prisma } from "@/lib/prisma";

export async function createProject(formData: FormData) {
  const name = readRequiredText(formData, "name");
  const description = readOptionalText(formData, "description");

  await prisma.project.create({
    data: {
      name,
      description,
    },
  });

  revalidatePath("/projects");
}

export async function archiveProject(formData: FormData) {
  const id = readRequiredText(formData, "id");

  await prisma.project.update({
    where: { id },
    data: {
      status: ArchiveStatus.ARCHIVED,
    },
  });

  revalidatePath("/projects");
}
