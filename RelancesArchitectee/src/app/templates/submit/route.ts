import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "create");
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (intent === "create") {
    if (!title || !body) {
      return NextResponse.redirect(new URL("/templates?error=invalid-create", request.url), 303);
    }

    await prisma.mailTemplate.create({
      data: {
        id: randomUUID(),
        title,
        body,
      },
    });

    return NextResponse.redirect(new URL("/templates", request.url), 303);
  }

  if (intent === "update") {
    const id = String(formData.get("id") || "");

    if (!id || !title || !body) {
      return NextResponse.redirect(new URL("/templates?error=invalid-update", request.url), 303);
    }

    await prisma.mailTemplate.update({
      where: { id },
      data: { title, body },
    });

    return NextResponse.redirect(new URL("/templates", request.url), 303);
  }

  if (intent === "duplicate") {
    const sourceId = String(formData.get("sourceId") || "");

    if (!sourceId || !title || !body) {
      return NextResponse.redirect(new URL("/templates?error=invalid-duplicate", request.url), 303);
    }

    const source = await prisma.mailTemplate.findUnique({
      where: { id: sourceId },
    });

    if (!source) {
      return NextResponse.redirect(new URL("/templates?error=missing-source", request.url), 303);
    }

    await prisma.mailTemplate.create({
      data: {
        id: randomUUID(),
        title,
        body,
      },
    });

    return NextResponse.redirect(new URL("/templates", request.url), 303);
  }

  return NextResponse.redirect(new URL("/templates?error=unknown-intent", request.url), 303);
}
