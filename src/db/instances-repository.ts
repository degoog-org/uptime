import type { Database } from "bun:sqlite";
import type { Instance } from "../types";

const _toFlag = (value: boolean | null): number | null =>
  value === null ? null : Number(value);

export const syncInstances = (
  db: Database,
  instances: readonly Instance[],
  now: number,
): void => {
  const upsert = db.prepare(`
    INSERT INTO instances (id, name, clearnet, appearance, theme, country, cloudflare, listed, position, first_seen_at, last_seen_at)
    VALUES ($id, $name, $clearnet, $appearance, $theme, $country, $cloudflare, 1, $position, $now, $now)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      clearnet = excluded.clearnet,
      appearance = excluded.appearance,
      theme = excluded.theme,
      country = excluded.country,
      cloudflare = excluded.cloudflare,
      listed = 1,
      position = excluded.position,
      last_seen_at = excluded.last_seen_at
  `);
  const unlistMissing = db.prepare(
    "UPDATE instances SET listed = 0 WHERE id NOT IN (SELECT value FROM json_each($ids))",
  );

  db.transaction(() => {
    instances.forEach((instance, position) => {
      upsert.run({
        id: instance.id,
        name: instance.name,
        clearnet: JSON.stringify(instance.clearnet),
        appearance: instance.appearance,
        theme: instance.theme,
        country: instance.country,
        cloudflare: _toFlag(instance.cloudflare),
        position,
        now,
      });
    });
    unlistMissing.run({
      ids: JSON.stringify(instances.map((instance) => instance.id)),
    });
  })();
};
