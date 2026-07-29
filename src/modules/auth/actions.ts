"use server";

import { createHash, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthConfig } from "@/lib/env";
import { readRequiredText } from "@/lib/form";
import {
  getSessionMaxAgeSeconds,
  sessionCookieName,
  signSession,
} from "@/modules/auth/session";

const maxLoginFailures = 5;
const loginWindowMs = 15 * 60 * 1000;

export type LoginState = {
  error?: string;
};

type LoginAttempt = {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number;
};

const loginAttempts = new Map<string, LoginAttempt>();

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function hashPasswordScrypt(
  password: string,
  salt: string,
  options: { N: number; r: number; p: number },
): string {
  return scryptSync(password, salt, 64, options).toString("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyPassword(password: string, expectedHash: string): boolean {
  if (expectedHash.startsWith("scrypt$")) {
    const [, rawN, rawR, rawP, salt, storedHash] = expectedHash.split("$");
    const N = Number(rawN);
    const r = Number(rawR);
    const p = Number(rawP);

    if (!salt || !storedHash || !Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
      return false;
    }

    return safeEqual(hashPasswordScrypt(password, salt, { N, r, p }), storedHash);
  }

  return safeEqual(hashPassword(password), expectedHash);
}

function getClientAddress(headerStore: Headers): string {
  const forwardedFor = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || headerStore.get("x-real-ip") || "unknown";
}

function getAttemptKey(username: string, clientAddress: string): string {
  return `${clientAddress}:${username.toLowerCase()}`;
}

function assertLoginAllowed(key: string): LoginState | null {
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt) {
    return null;
  }

  if (attempt.lockedUntil > now) {
    return {
      error: "Trop de tentatives. Réessayez dans quelques minutes.",
    };
  }

  if (now - attempt.firstAttemptAt > loginWindowMs) {
    loginAttempts.delete(key);
  }

  return null;
}

function recordFailedLogin(key: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  const nextAttempt =
    attempt && now - attempt.firstAttemptAt <= loginWindowMs
      ? { ...attempt, count: attempt.count + 1 }
      : { count: 1, firstAttemptAt: now, lockedUntil: 0 };

  if (nextAttempt.count >= maxLoginFailures) {
    nextAttempt.lockedUntil = now + loginWindowMs;
  }

  loginAttempts.set(key, nextAttempt);
}

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const username = readRequiredText(formData, "username");
  const password = readRequiredText(formData, "password");
  const authConfig = getAuthConfig();
  const headerStore = await headers();
  const attemptKey = getAttemptKey(username, getClientAddress(headerStore));
  const blockedState = assertLoginAllowed(attemptKey);

  if (blockedState) {
    return blockedState;
  }

  if (!safeEqual(username, authConfig.username) || !verifyPassword(password, authConfig.passwordHash)) {
    recordFailedLogin(attemptKey);
    return {
      error: "Mauvais identifiant ou mot de passe.",
    };
  }

  loginAttempts.delete(attemptKey);

  const session = signSession(username);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
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
