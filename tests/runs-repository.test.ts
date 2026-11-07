import { describe, expect, test } from "bun:test";
import { isCheckerFault } from "../src/checker/run-checks";
import { Database } from "bun:sqlite";
import { openDatabase } from "../src/db/client";
import { MIGRATIONS } from "../src/db/migrations";
import { syncInstances } from "../src/db/instances-repository";
import { recordRun } from "../src/db/runs-repository";
import type { CheckResult, Instance } from "../src/types";

const instance = (id: string): Instance => ({
  id,
  name: id,
  clearnet: [`https://${id}.example`],
  tor: [],
  i2p: [],
  appearance: "default",
  theme: null,
  country: null,
  cloudflare: null,
});

const check = (
  instanceId: string,
  overrides: Partial<CheckResult> = {},
): CheckResult => ({
  instanceId,
  url: `https://${instanceId}.example`,
  status: "up",
  httpStatus: 200,
  latencyMs: 120,
  error: null,
  checkedAt: 1,
  ...overrides,
});

describe("persistence", () => {
  test("instances removed from the list keep their history but are unlisted", () => {
    const db = openDatabase(":memory:");
    syncInstances(db, [instance("a"), instance("b")], 1);
    recordRun(db, {
      startedAt: 1,
      finishedAt: 2,
      discarded: false,
      results: [check("a"), check("b")],
    });
    syncInstances(db, [instance("a")], 3);

    const rows = db.query("SELECT id, listed FROM instances ORDER BY id").all();
    expect(rows).toEqual([
      { id: "a", listed: 1 },
      { id: "b", listed: 0 },
    ]);
    expect(
      db
        .query("SELECT COUNT(*) AS n FROM checks WHERE instance_id = 'b'")
        .get(),
    ).toEqual({ n: 1 });
  });

  test("reopening an existing database does not rerun migrations", () => {
    const path = `${import.meta.dir}/../data/test-${crypto.randomUUID()}.sqlite`;
    openDatabase(path).close();
    const db = openDatabase(path);
    expect(db.query("PRAGMA user_version").get()).toEqual({
      user_version: MIGRATIONS.length,
    });
    db.close();
    Bun.file(path).delete();
  });

  test("connection resets already stored as down are reclassified as blocked", () => {
    const path = `${import.meta.dir}/../data/test-${crypto.randomUUID()}.sqlite`;
    const legacy = new Database(path, { create: true });
    legacy.run(MIGRATIONS[0] ?? "");
    legacy.run("PRAGMA user_version = 1");
    legacy.run(
      "INSERT INTO instances (id, name, clearnet, appearance, listed, position, first_seen_at, last_seen_at) VALUES ('a', 'a', '[]', 'default', 1, 0, 1, 1)",
    );
    legacy.run("INSERT INTO runs (started_at, finished_at) VALUES (1, 1)");
    legacy.run(
      "INSERT INTO checks (run_id, instance_id, url, status, error, checked_at) VALUES (1, 'a', 'u', 'down', 'ECONNRESET: The socket connection was closed unexpectedly.', 1), (1, 'a', 'u', 'down', 'timeout', 2)",
    );
    legacy.close();

    const db = openDatabase(path);
    expect(
      db.query("SELECT status, error FROM checks ORDER BY checked_at").all(),
    ).toEqual([
      {
        status: "blocked",
        error: "ECONNRESET: The socket connection was closed unexpectedly.",
      },
      { status: "down", error: "timeout" },
    ]);
    db.close();
    Bun.file(path).delete();
  });
});

describe("isCheckerFault", () => {
  const networkDown = {
    status: "down" as const,
    httpStatus: null,
    error: "timeout",
  };

  test("every probe failing at network level is a checker fault", () => {
    expect(
      isCheckerFault([check("a", networkDown), check("b", networkDown)]),
    ).toBe(true);
  });

  test("one instance answering means the runner network is fine", () => {
    expect(
      isCheckerFault([
        check("a", networkDown),
        check("b", { status: "down", httpStatus: 502 }),
      ]),
    ).toBe(false);
  });

  test("a single instance going down is never treated as a checker fault", () => {
    expect(isCheckerFault([check("a", networkDown)])).toBe(false);
  });
});
