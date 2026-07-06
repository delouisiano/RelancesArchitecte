import { NextResponse, type NextRequest } from "next/server";

const sessionCookieName = "ra_session";
const publicPrefixes = ["/login", "/reminders/actions"];

type SessionPayload = {
  sub?: string;
  exp?: number;
};

async function sign(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
    const decoded = atob(padded.replaceAll("-", "+").replaceAll("_", "/"));
    return JSON.parse(decoded) as SessionPayload;
  } catch {
    return null;
  }
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    return false;
  }

  const cookie = request.cookies.get(sessionCookieName)?.value;

  if (!cookie) {
    return false;
  }

  const [value, signature] = cookie.split(".");

  if (!value || !signature) {
    return false;
  }

  if ((await sign(value, secret)) !== signature) {
    return false;
  }

  const payload = decodePayload(value);
  return Boolean(payload?.sub && payload.exp && payload.exp >= Math.floor(Date.now() / 1000));
}

export async function proxy(request: NextRequest) {
  if (publicPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (await hasValidSession(request)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
