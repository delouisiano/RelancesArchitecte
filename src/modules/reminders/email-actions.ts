import { createHmac, timingSafeEqual } from "node:crypto";
import { getActionSecret, getAppBaseUrl } from "@/lib/env";

export const reminderEmailActions = ["close", "send", "postpone"] as const;
export type ReminderEmailAction = (typeof reminderEmailActions)[number];

type TokenPayload = {
  action: ReminderEmailAction;
  reminderId: string;
  exp: number;
};

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", getActionSecret()).update(payload).digest("base64url");
}

function isReminderEmailAction(value: string): value is ReminderEmailAction {
  return reminderEmailActions.includes(value as ReminderEmailAction);
}

export function createReminderActionToken(input: {
  action: ReminderEmailAction;
  reminderId: string;
  expiresInSeconds?: number;
}) {
  const payload: TokenPayload = {
    action: input.action,
    reminderId: input.reminderId,
    exp: Math.floor(Date.now() / 1000) + (input.expiresInSeconds ?? 7 * 24 * 60 * 60),
  };
  const encodedPayload = base64url(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function createReminderActionUrl(input: {
  action: ReminderEmailAction;
  reminderId: string;
}) {
  const token = createReminderActionToken(input);
  return `${getAppBaseUrl()}/reminders/actions/${input.action}?token=${encodeURIComponent(token)}`;
}

export function verifyReminderActionToken(token: string, expectedAction: string) {
  if (!isReminderEmailAction(expectedAction)) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as TokenPayload;

    if (payload.action !== expectedAction || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
