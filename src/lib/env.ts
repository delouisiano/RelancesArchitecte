import { readFileSync } from "node:fs";

function readRequired(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readSecret(name: string): string {
  const value = process.env[name];

  if (value) {
    return value;
  }

  const filePath = process.env[`${name}_FILE`];

  if (filePath) {
    const fileValue = readFileSync(filePath, "utf8").trim();

    if (fileValue) {
      return fileValue;
    }
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

export function getAuthConfig() {
  return {
    username: readRequired("AUTH_USERNAME"),
    passwordHash: readRequired("AUTH_PASSWORD_HASH"),
    secret: readRequired("AUTH_SECRET"),
  };
}

export function getMailConfig() {
  return {
    architectEmail: readRequired("ARCHITECT_EMAIL"),
    from: readRequired("SMTP_FROM"),
    host: readRequired("SMTP_HOST"),
    port: Number(readRequired("SMTP_PORT")),
    user: readRequired("SMTP_USER"),
    password: readSecret("SMTP_PASSWORD"),
  };
}

export function getAppBaseUrl() {
  return readRequired("APP_BASE_URL").replace(/\/$/, "");
}

export function getActionSecret() {
  return process.env.ACTION_SECRET || process.env.AUTH_SECRET || readRequired("ACTION_SECRET");
}
