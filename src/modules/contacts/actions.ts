"use server";

import { revalidatePath } from "next/cache";
import { ArchiveStatus } from "@/generated/prisma/enums";
import { readOptionalEmail, readOptionalText, readRequiredText } from "@/lib/form";
import { prisma } from "@/lib/prisma";

export async function createContact(formData: FormData) {
  const name = readRequiredText(formData, "name");
  const company = readOptionalText(formData, "company");
  const email = readOptionalEmail(formData, "email");
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
