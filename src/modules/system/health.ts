import { existsSync, statSync } from "node:fs";
import { resolveSqliteDatabasePath } from "@/lib/database-url";
import { prisma } from "@/lib/prisma";

export type HealthStatus = "ok" | "warning" | "error";

export type HealthCheck = {
  label: string;
  status: HealthStatus;
  message: string;
};

function envPresent(name: string) {
  return Boolean(process.env[name] || process.env[`${name}_FILE`]);
}

function boolStatus(condition: boolean): HealthStatus {
  return condition ? "ok" : "error";
}

export async function getSystemHealth() {
  const checks: HealthCheck[] = [];
  const databasePath = resolveSqliteDatabasePath();
  const databaseExists = existsSync(databasePath);
  const databaseSize = databaseExists ? statSync(databasePath).size : 0;

  checks.push({
    label: "Base SQLite",
    status: databaseExists && databaseSize > 0 ? "ok" : "error",
    message: databaseExists
      ? `${databasePath} (${Math.round(databaseSize / 1024)} Ko)`
      : `${databasePath} introuvable`,
  });

  const requiredEnv = [
    "DATABASE_URL",
    "APP_BASE_URL",
    "AUTH_USERNAME",
    "AUTH_PASSWORD_HASH",
    "AUTH_SECRET",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_FROM",
  ];

  const missingEnv = requiredEnv.filter((name) => !envPresent(name));
  checks.push({
    label: "Variables d'environnement",
    status: missingEnv.length === 0 ? "ok" : "error",
    message: missingEnv.length === 0
      ? "Configuration minimale presente."
      : `Manquantes: ${missingEnv.join(", ")}`,
  });

  checks.push({
    label: "Secret SMTP",
    status: envPresent("SMTP_PASSWORD") || envPresent("SMTP_PASSWORD_FILE") ? "ok" : "error",
    message: envPresent("SMTP_PASSWORD_FILE")
      ? "Mot de passe lu depuis un fichier secret."
      : envPresent("SMTP_PASSWORD")
        ? "Mot de passe configure en variable d'environnement."
        : "Aucun mot de passe SMTP configure.",
  });

  checks.push({
    label: "URL publique",
    status: process.env.APP_BASE_URL?.startsWith("https://") ? "ok" : "warning",
    message: process.env.APP_BASE_URL ?? "APP_BASE_URL non configuree.",
  });

  const [settings, projectCount, contactCount, reminderCount, dueCount, lastNotification] = await Promise.all([
    prisma.userSettings.findUnique({ where: { id: "default" } }),
    prisma.project.count(),
    prisma.contact.count(),
    prisma.reminder.count(),
    prisma.reminder.count({ where: { status: { in: ["DUE", "OVERDUE"] } } }),
    prisma.notificationLog.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  checks.push({
    label: "Parametres agence",
    status: boolStatus(Boolean(settings?.architectEmail)),
    message: settings?.architectEmail ? `Notifications vers ${settings.architectEmail}.` : "Aucun email de notification configure.",
  });

  checks.push({
    label: "Donnees metier",
    status: "ok",
    message: `${projectCount} projet(s), ${contactCount} contact(s), ${reminderCount} relance(s).`,
  });

  checks.push({
    label: "Relances dues",
    status: dueCount > 0 ? "warning" : "ok",
    message: dueCount > 0 ? `${dueCount} relance(s) dues ou en retard.` : "Aucune relance due actuellement.",
  });

  checks.push({
    label: "Derniere notification",
    status: lastNotification?.success === false ? "warning" : "ok",
    message: lastNotification
      ? `${lastNotification.success ? "Succes" : "Echec"} le ${lastNotification.createdAt.toISOString()}: ${lastNotification.message}`
      : "Aucune notification journalisee.",
  });

  const summary: HealthStatus = checks.some((check) => check.status === "error")
    ? "error"
    : checks.some((check) => check.status === "warning")
      ? "warning"
      : "ok";

  return { checkedAt: new Date(), summary, checks };
}
