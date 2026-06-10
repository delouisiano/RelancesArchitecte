"use server";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readRequiredText } from "@/lib/form";
import { sessionCookieName, signSession } from "@/modules/auth/session";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function login(formData: FormData) {
  const username = readRequiredText(formData, "username");
  const password = readRequiredText(formData, "password");
  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedPasswordHash = process.env.AUTH_PASSWORD_HASH;

  if (!expectedUsername || !expectedPasswordHash) {
    throw new Error("AUTH_USERNAME et AUTH_PASSWORD_HASH doivent etre configures.");
  }

  const passwordHash = hashPassword(password);

  if (username !== expectedUsername || passwordHash !== expectedPasswordHash) {
    throw new Error("Identifiants invalides.");
  }

  const session = signSession(`${username}:${Date.now()}`);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  redirect("/login");
}
