"use server";

import { revalidatePath } from "next/cache";
import { readOptionalText, readRequiredText } from "@/lib/form";
import { prisma } from "@/lib/prisma";

export async function updateSettings(formData: FormData) {
  await prisma.userSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      architectName: readOptionalText(formData, "architectName"),
      agencyName: readOptionalText(formData, "agencyName"),
      architectEmail: readRequiredText(formData, "architectEmail"),
      defaultReminderDays: Number(readRequiredText(formData, "defaultReminderDays")),
      notificationCooldown: Number(readRequiredText(formData, "notificationCooldown")),
    },
    update: {
      architectName: readOptionalText(formData, "architectName"),
      agencyName: readOptionalText(formData, "agencyName"),
      architectEmail: readRequiredText(formData, "architectEmail"),
      defaultReminderDays: Number(readRequiredText(formData, "defaultReminderDays")),
      notificationCooldown: Number(readRequiredText(formData, "notificationCooldown")),
    },
  });

  revalidatePath("/settings");
}
