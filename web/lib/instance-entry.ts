export interface InstanceDraft {
  name: string;
  url: string;
  country: string;
  appearance: "default" | "custom";
  theme: string;
  cloudflare: "unknown" | "yes" | "no";
}

export interface InstanceEntry {
  id: string;
  name: string;
  clearnet: string[];
  tor: string[];
  i2p: string[];
  appearance: "default" | "custom";
  theme: string | null;
  country: string | null;
  cloudflare: boolean | null;
}

export type DraftError = "name" | "url" | "country" | "duplicate";

const COUNTRY_PATTERN = /^[A-Z]{2}$/;
const ENTRY_INDENT = "    ";

export const EMPTY_DRAFT: InstanceDraft = {
  name: "",
  url: "",
  country: "",
  appearance: "default",
  theme: "",
  cloudflare: "unknown",
};

export const toBaseUrl = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!url.hostname.includes(".")) return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
};

export const toInstanceId = (baseUrl: string): string =>
  new URL(baseUrl).hostname
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const validateDraft = (
  draft: InstanceDraft,
  existingIds: ReadonlySet<string>,
): DraftError[] => {
  const errors: DraftError[] = [];
  const baseUrl = toBaseUrl(draft.url);
  if (!draft.name.trim()) errors.push("name");
  if (!baseUrl) errors.push("url");
  else if (existingIds.has(toInstanceId(baseUrl))) errors.push("duplicate");
  if (draft.country && !COUNTRY_PATTERN.test(draft.country))
    errors.push("country");
  return errors;
};

export const buildEntry = (draft: InstanceDraft): InstanceEntry | null => {
  const baseUrl = toBaseUrl(draft.url);
  if (!baseUrl || !draft.name.trim()) return null;
  const custom = draft.appearance === "custom";
  return {
    id: toInstanceId(baseUrl),
    name: draft.name.trim(),
    clearnet: [baseUrl],
    tor: [],
    i2p: [],
    appearance: draft.appearance,
    theme: custom && draft.theme.trim() ? draft.theme.trim() : null,
    country: draft.country || null,
    cloudflare:
      draft.cloudflare === "unknown" ? null : draft.cloudflare === "yes",
  };
};

export const formatJsonEntry = (entry: InstanceEntry): string =>
  JSON.stringify(entry, null, 2)
    .split("\n")
    .map((line) => `${ENTRY_INDENT}${line}`)
    .join("\n");

export const formatMarkdownLine = (entry: InstanceEntry): string => {
  const url = entry.clearnet[0] ?? "";
  const suffix =
    entry.appearance === "custom" ? ` (${entry.theme ?? "Custom"})` : "";
  return `[${url}](${url})${suffix}`;
};

export const markdownSection = (entry: InstanceEntry): string =>
  entry.appearance === "custom" ? "Custom appearance" : "Default appearance";
