"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readRequiredText } from "@/lib/form";
import {
  getSessionMaxAgeSeconds,
  sessionCookieName,
  signSession,
} from "@/modules/auth/session";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
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

  if (!safeEqual(username, expectedUsername) || !safeEqual(passwordHash, expectedPasswordHash)) {
    throw new Error("Identifiants invalides.");
  }

  const session = signSession(username);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
  redirect("/login");
}
