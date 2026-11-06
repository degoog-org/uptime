import { describe, expect, test } from "bun:test";
import type { CheckStatus, InstanceStatus } from "../../src/shared/status";
import {
  DEFAULT_FILTERS,
  filterInstances,
  type InstanceFilters,
} from "../../web/lib/filter-instances";
import { readFilters, writeFilters } from "../../web/lib/filter-params";

const instance = (
  id: string,
  overrides: Partial<InstanceStatus> = {},
  status: CheckStatus | null = "up",
): InstanceStatus => ({
  id,
  name: id,
  country: null,
  cloudflare: null,
  appearance: "default",
  theme: null,
  current: status,
  lastCheckedAt: 1,
  urls: [
    {
      url: `https://${id}.example`,
      status: status ?? "up",
      httpStatus: 200,
      latencyMs: 100,
      error: null,
      checkedAt: 1,
    },
  ],
  uptime: { "24h": 100, "7d": 100, "30d": 100, "90d": 100 },
  avgLatency24h: 100,
  latency24h: [],
  daily: [],
  ...overrides,
});

const INSTANCES = [
  instance("alpha", { country: "DE", cloudflare: true }),
  instance("beta", { appearance: "custom", theme: "Zen" }, "down"),
  instance("gamma", {}, "starting"),
  instance("delta", {}, "blocked"),
];

const ids = (filters: Partial<InstanceFilters>): string[] =>
  filterInstances(INSTANCES, { ...DEFAULT_FILTERS, ...filters }).map(
    (entry) => entry.id,
  );

describe("filterInstances", () => {
  test("issues covers down and degraded instances but not unknown ones", () => {
    expect(ids({ status: "issues" })).toEqual(["beta", "gamma"]);
  });

  test("search matches hosts and theme names, every term must match", () => {
    expect(ids({ query: "gamma.example" })).toEqual(["gamma"]);
    expect(ids({ query: "zen" })).toEqual(["beta"]);
    expect(ids({ query: "zen alpha" })).toEqual([]);
  });

  test("cloudflare no includes instances where it is unknown", () => {
    expect(ids({ cloudflare: "no" })).toEqual(["beta", "gamma", "delta"]);
  });

  test("filters combine", () => {
    expect(
      ids({ country: "DE", status: "operational", cloudflare: "yes" }),
    ).toEqual(["alpha"]);
  });
});

describe("filter params", () => {
  test("round trip keeps only non default values and unrelated params", () => {
    const filters: InstanceFilters = {
      ...DEFAULT_FILTERS,
      query: "zen",
      status: "issues",
    };
    const search = writeFilters(filters, "?utm=x");
    expect(search).toBe("?utm=x&q=zen&status=issues");
    expect(readFilters(search)).toEqual(filters);
  });

  test("unknown values from a hand edited url fall back to defaults", () => {
    expect(
      readFilters("?status=nope&country=germany&cloudflare=maybe"),
    ).toEqual(DEFAULT_FILTERS);
  });
});
