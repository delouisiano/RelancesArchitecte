"use server";

import { ReminderStatus } from "../generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/reminders";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

function chantierAnchor(value: string) {
  return `chantier-${value.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;
}

export async function updateReminder(formData: FormData) {
  const id = String(formData.get("id") || "");
  const projectName = String(formData.get("projectName") || "").trim();
  const artisanContact = String(formData.get("artisanContact") || "").trim();
  const chantierName = String(formData.get("chantierName") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const templateId = String(formData.get("templateId") || "").trim();
  const followUpDelayDays = Number(formData.get("followUpDelayDays"));
  const status = String(formData.get("status") || "") as ReminderStatus;
  const returnToChantier = String(formData.get("returnToChantier") || chantierName).trim();

  if (!id || !projectName || !chantierName || !artisanContact || !Number.isFinite(followUpDelayDays) || !Object.values(ReminderStatus).includes(status)) {
    redirect("/?error=invalid-update");
  }

  await prisma.reminder.update({
    where: { id },
    data: {
      projectName,
      chantierName,
      artisanName: artisanContact,
      artisanContact,
      note: note || null,
      templateId: templateId || null,
      followUpDelayDays,
      dueAt: addDays(new Date(), followUpDelayDays),
      status,
    },
  });

  redirect(`/#${chantierAnchor(returnToChantier || chantierName)}`);
}

export async function deleteReminder(formData: FormData) {
  const id = String(formData.get("id") || "");
  const returnToChantier = String(formData.get("returnToChantier") || "").trim();

  if (!id) {
    redirect("/?error=invalid-delete");
  }

  await prisma.reminder.delete({
    where: { id },
  });

  redirect(returnToChantier ? `/#${chantierAnchor(returnToChantier)}` : "/");
}

export async function createMailTemplate(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!title || !body) {
    redirect("/templates?error=invalid-create");
  }

  await prisma.mailTemplate.create({
    data: {
      id: randomUUID(),
      title,
      body,
    },
  });

  redirect("/templates");
}

export async function updateMailTemplate(formData: FormData) {
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!id || !title || !body) {
    redirect("/templates?error=invalid-update");
  }

  await prisma.mailTemplate.update({
    where: { id },
    data: {
      title,
      body,
    },
  });

  redirect("/templates");
}

export async function duplicateMailTemplate(formData: FormData) {
  const sourceId = String(formData.get("sourceId") || "");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!sourceId || !title || !body) {
    redirect("/templates?error=invalid-duplicate");
  }

  const source = await prisma.mailTemplate.findUnique({
    where: { id: sourceId },
  });

  if (!source) {
    redirect("/templates?error=missing-source");
  }

  await prisma.mailTemplate.create({
    data: {
      id: randomUUID(),
      title,
      body,
    },
  });

  redirect("/templates");
}
