import { describe, expect, test } from "bun:test";
import {
  EMPTY_DRAFT,
  buildEntry,
  formatJsonEntry,
  formatMarkdownLine,
  toBaseUrl,
  validateDraft,
} from "../../web/lib/instance-entry";
import { parseInstances } from "../../src/instances/parse-instances";

describe("instance entry", () => {
  test("base url drops paths, trailing slashes and adds https when missing", () => {
    expect(toBaseUrl("search.example.org/")).toBe("https://search.example.org");
    expect(toBaseUrl("https://search.example.org/search?q=1")).toBe(
      "https://search.example.org",
    );
    expect(toBaseUrl("ftp://search.example.org")).toBeNull();
    expect(toBaseUrl("localhost")).toBeNull();
  });

  test("generated entry is accepted by the checker's own instances parser", () => {
    const entry = buildEntry({
      ...EMPTY_DRAFT,
      name: "Search Example",
      url: "https://search.example.org/",
      country: "IT",
      appearance: "custom",
      theme: "Zen",
      cloudflare: "yes",
    });
    if (!entry) throw new Error("expected an entry for a valid draft");
    expect(entry.id).toBe("search-example-org");
    expect(
      parseInstances({
        version: 1,
        instances: [JSON.parse(formatJsonEntry(entry))],
      }),
    ).toEqual([entry]);
    expect(formatMarkdownLine(entry)).toBe(
      "[https://search.example.org](https://search.example.org) (Zen)",
    );
  });

  test("an instance already in the list is flagged as a duplicate", () => {
    const draft = { ...EMPTY_DRAFT, name: "x", url: "degoog.org" };
    expect(validateDraft(draft, new Set(["degoog-org"]))).toEqual([
      "duplicate",
    ]);
  });
});
