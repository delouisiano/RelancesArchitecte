function readRequired(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
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
    password: readRequired("SMTP_PASSWORD"),
  };
}
