import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { MIGRATIONS } from "./migrations";

interface UserVersionRow {
  user_version: number;
}

const _migrate = (db: Database): void => {
  const row = db.query<UserVersionRow, []>("PRAGMA user_version").get();
  const current = row?.user_version ?? 0;
  MIGRATIONS.slice(current).forEach((sql, offset) => {
    db.transaction(() => {
      db.run(sql);
      db.run(`PRAGMA user_version = ${current + offset + 1}`);
    })();
  });
};

export const openDatabase = (path: string): Database => {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true, strict: true });
  db.run("PRAGMA journal_mode = DELETE");
  db.run("PRAGMA foreign_keys = ON");
  _migrate(db);
  return db;
};
