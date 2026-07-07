"use server";

import { revalidatePath } from "next/cache";
import {
  readOptionalText,
  readRequiredEmail,
  readRequiredPositiveInteger,
} from "@/lib/form";
import { prisma } from "@/lib/prisma";

export async function updateSettings(formData: FormData) {
  const data = {
    architectName: readOptionalText(formData, "architectName"),
    agencyName: readOptionalText(formData, "agencyName"),
    architectEmail: readRequiredEmail(formData, "architectEmail"),
    defaultReminderDays: readRequiredPositiveInteger(formData, "defaultReminderDays"),
    notificationCooldown: readRequiredPositiveInteger(formData, "notificationCooldown"),
  };

  await prisma.userSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...data,
    },
    update: data,
  });

  revalidatePath("/settings");
}
