import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthConfig } from "@/lib/env";

export const sessionCookieName = "ra_session";
export const defaultSessionMaxAgeSeconds = 12 * 60 * 60;

type SessionPayload = {
  sub: string;
  iat: number;
  exp: number;
};

function getSecret(): string | null {
  return getAuthConfig().secret;
}

export function getSessionMaxAgeSeconds(): number {
  const configured = Number(process.env.AUTH_SESSION_MAX_AGE_SECONDS);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : defaultSessionMaxAgeSeconds;
}

function signValue(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function signSession(username: string): string {
  const secret = getSecret();

  if (!secret) {
    throw new Error("AUTH_SECRET is required to create a session.");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: username,
    iat: now,
    exp: now + getSessionMaxAgeSeconds(),
  };
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${signValue(value, secret)}`;
}

export function verifySessionCookie(cookieValue?: string): boolean {
  const secret = getSecret();

  if (!secret || !cookieValue) {
    return false;
  }

  const [value, signature] = cookieValue.split(".");

  if (!value || !signature) {
    return false;
  }

  const expected = signValue(value, secret);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionPayload;
    return Boolean(payload.sub) && payload.exp >= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
