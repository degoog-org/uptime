import { describe, expect, test } from "bun:test";
import { parseInstances } from "../src/instances/parse-instances";

const valid = {
  id: "degoog-org",
  name: "degoog.org",
  clearnet: ["https://degoog.org"],
  appearance: "default" as const,
};

describe("parseInstances", () => {
  test("parses a copy of the official instances file", async () => {
    const raw: unknown = await Bun.file(
      `${import.meta.dir}/fixtures/instances.json`,
    ).json();
    const instances = parseInstances(raw);
    expect(instances.length).toBeGreaterThan(0);
    expect(instances.every((instance) => instance.clearnet.length > 0)).toBe(
      true,
    );
  });

  test("tolerates unknown fields and fills optional ones", () => {
    const [instance] = parseInstances({
      version: 1,
      instances: [{ ...valid, futureField: 1 }],
    });
    expect(instance).toEqual({
      ...valid,
      tor: [],
      i2p: [],
      theme: null,
      country: null,
      cloudflare: null,
    });
  });

  test("skips invalid entries and duplicate ids instead of failing the run", () => {
    const instances = parseInstances({
      version: 1,
      instances: [valid, { ...valid }, { ...valid, id: "Bad Id" }, "nope"],
    });
    expect(instances.map((instance) => instance.id)).toEqual(["degoog-org"]);
  });

  test("drops urls with paths or non http schemes", () => {
    const [instance] = parseInstances({
      version: 1,
      instances: [
        {
          ...valid,
          clearnet: [
            "https://ok.example",
            "https://x.example/path",
            "ftp://x.example",
          ],
        },
      ],
    });
    expect(instance?.clearnet).toEqual(["https://ok.example"]);
  });

  test("refuses an unknown schema version", () => {
    expect(() => parseInstances({ version: 2, instances: [] })).toThrow();
  });
});
