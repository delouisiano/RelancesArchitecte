import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { resolveSqliteDatabasePath } from "@/lib/database-url";

function timestamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function pruneBackups(directory: string, retentionDays: number, now = Date.now()) {
  const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;
  let deleted = 0;

  for (const entry of readdirSync(directory)) {
    if (!entry.endsWith(".sqlite")) {
      continue;
    }

    const filePath = path.join(directory, entry);
    const stats = statSync(filePath);

    if (now - stats.mtimeMs > maxAgeMs) {
      rmSync(filePath);
      deleted += 1;
    }
  }

  return deleted;
}

function main() {
  const databasePath = resolveSqliteDatabasePath();

  if (!existsSync(databasePath)) {
    throw new Error(`Database file not found: ${databasePath}`);
  }

  const backupDir = path.resolve(process.cwd(), process.env.BACKUP_DIR ?? "backups/database");
  const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS ?? "30");

  mkdirSync(backupDir, { recursive: true });

  const backupPath = path.join(backupDir, `relances-${timestamp()}.sqlite`);
  copyFileSync(databasePath, backupPath);

  const deleted = Number.isFinite(retentionDays) && retentionDays > 0
    ? pruneBackups(backupDir, retentionDays)
    : 0;

  console.log(JSON.stringify({ backupPath, databasePath, deleted, retentionDays }));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
