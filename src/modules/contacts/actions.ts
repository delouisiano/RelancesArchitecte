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

export async function createContact(formData: FormData) {
  const name = readRequiredText(formData, "name");
  const company = readOptionalText(formData, "company");
  const email = readOptionalText(formData, "email");
  const phone = readOptionalText(formData, "phone");
  const notes = readOptionalText(formData, "notes");

  await prisma.contact.create({
    data: {
      name,
      company,
      email,
      phone,
      notes,
    },
  });

  revalidatePath("/contacts");
}

export async function archiveContact(formData: FormData) {
  const id = readRequiredText(formData, "id");

  await prisma.contact.update({
    where: { id },
    data: {
      status: ArchiveStatus.ARCHIVED,
    },
  });

  revalidatePath("/contacts");
}
