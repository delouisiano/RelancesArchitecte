import path from "node:path";

export function resolveSqliteDatabasePath(databaseUrl = process.env.DATABASE_URL) {
  const value = databaseUrl ?? "file:./dev.db";

  if (!value.startsWith("file:")) {
    throw new Error("Only SQLite file: DATABASE_URL values are supported.");
  }

  const rawPath = value.slice("file:".length).split("?")[0];
  const normalizedPath = rawPath.startsWith("./") ? rawPath.slice(2) : rawPath;

  if (!normalizedPath || normalizedPath === ":memory:") {
    throw new Error("DATABASE_URL must point to a persistent SQLite file.");
  }

  return path.isAbsolute(normalizedPath)
    ? normalizedPath
    : path.resolve(/*turbopackIgnore: true*/ process.cwd(), normalizedPath);
}
