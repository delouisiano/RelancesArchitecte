import { NextResponse, type NextRequest } from "next/server";

const sessionCookieName = "ra_session";

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
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    return true;
  }

  const cookie = request.cookies.get(sessionCookieName)?.value;

  if (!cookie) {
    return false;
  }

  const [value, signature] = cookie.split(".");

  if (!value || !signature) {
    return false;
  }

  return (await sign(value, secret)) === signature;
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/login")) {
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
