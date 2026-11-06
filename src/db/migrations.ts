export const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE instances (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    clearnet TEXT NOT NULL,
    appearance TEXT NOT NULL,
    theme TEXT,
    country TEXT,
    cloudflare INTEGER,
    listed INTEGER NOT NULL DEFAULT 1,
    position INTEGER NOT NULL,
    first_seen_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL
  );

  CREATE TABLE runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at INTEGER NOT NULL,
    finished_at INTEGER NOT NULL,
    discarded INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL REFERENCES runs(id),
    instance_id TEXT NOT NULL REFERENCES instances(id),
    url TEXT NOT NULL,
    status TEXT NOT NULL,
    http_status INTEGER,
    latency_ms INTEGER,
    error TEXT,
    checked_at INTEGER NOT NULL
  );

  CREATE INDEX checks_instance_checked_at ON checks(instance_id, checked_at);
  CREATE INDEX checks_run_id ON checks(run_id);
  `,
];
