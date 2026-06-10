import { createHmac, timingSafeEqual } from "node:crypto";

export const sessionCookieName = "ra_session";

function getSecret(): string | null {
  return process.env.AUTH_SECRET ?? null;
}

export function signSession(value: string): string {
  const secret = getSecret();

  if (!secret) {
    throw new Error("AUTH_SECRET is required to create a session.");
  }

  const signature = createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${signature}`;
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

  const expected = createHmac("sha256", secret).update(value).digest("hex");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
