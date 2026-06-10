"use server";

import { revalidatePath } from "next/cache";
import { ArchiveStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

function readRequiredText(formData: FormData, field: string): string {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Le champ ${field} est obligatoire.`);
  }

  return value.trim();
}

function readOptionalText(formData: FormData, field: string): string | null {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

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
