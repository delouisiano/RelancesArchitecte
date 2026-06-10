"use server";

import { revalidatePath } from "next/cache";
import { ArchiveStatus } from "@/generated/prisma/enums";
import { readRequiredText } from "@/lib/form";
import { prisma } from "@/lib/prisma";

export async function createTemplate(formData: FormData) {
  await prisma.template.create({
    data: {
      name: readRequiredText(formData, "name"),
      subject: readRequiredText(formData, "subject"),
      body: readRequiredText(formData, "body"),
    },
  });

  revalidatePath("/templates");
}

export async function archiveTemplate(formData: FormData) {
  await prisma.template.update({
    where: { id: readRequiredText(formData, "id") },
    data: { status: ArchiveStatus.ARCHIVED },
  });

  revalidatePath("/templates");
}
