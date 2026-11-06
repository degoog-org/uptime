import { PurgeCSS } from "purgecss";
import subsetFont from "subset-font";

const DEGOOG_DIR = process.env.DEGOOG_DIR ?? "../degoog";
const THEME_CSS = `${DEGOOG_DIR}/src/public/themes/degoog-theme/style.css`;
const FONTAWESOME_CSS = `${DEGOOG_DIR}/src/public/icons/fontawesome/css/all.min.css`;
const FONTAWESOME_SOLID = `${DEGOOG_DIR}/src/public/icons/fontawesome/webfonts/fa-solid-900.woff2`;

const OUT_DIR = "web/vendor";
const OUT_THEME = `${OUT_DIR}/degoog.css`;
const OUT_ICONS = `${OUT_DIR}/fontawesome.css`;
const OUT_ICON_FONT = `${OUT_DIR}/fa-solid-900.woff2`;

const CONTENT = ["web/**/*.tsx", "web/**/*.ts", "web/index.html"];
const SAFELIST = {
  standard: ["html", "body", "a", "input", "select", "button", "h1", "h2", "p"],
  greedy: [/data-theme/, /prefers-color-scheme/],
};

const COLOR_SCHEME_AT_RULE = "@media (prefers-color-scheme";
const FONT_FACE_PATTERN = /@font-face\s*\{[^}]*\}/g;
const ICON_CODEPOINT_PATTERN =
  /(?:--fa|content)\s*:\s*["']\\([0-9a-f]{4,5})\s*["']/gi;

const _purge = async (path: string): Promise<string> => {
  const [result] = await new PurgeCSS().purge({
    content: CONTENT,
    css: [path],
    safelist: SAFELIST,
    keyframes: true,
    variables: false,
  });
  if (!result) throw new Error(`purge produced nothing for ${path}`);
  return result.css.replace(FONT_FACE_PATTERN, "").trim();
};

const _extractBlocks = (css: string, opener: string): string[] => {
  const blocks: string[] = [];
  let start = css.indexOf(opener);
  while (start !== -1) {
    let depth = 0;
    let end = css.indexOf("{", start);
    for (; end < css.length; end++) {
      if (css[end] === "{") depth++;
      else if (css[end] === "}" && --depth === 0) break;
    }
    blocks.push(css.slice(start, end + 1));
    start = css.indexOf(opener, end);
  }
  return blocks;
};

const _iconCodepoints = (...sheets: string[]): number[] => {
  const codepoints = new Set<number>();
  for (const sheet of sheets) {
    for (const match of sheet.matchAll(ICON_CODEPOINT_PATTERN)) {
      const hex = match[1];
      if (hex) codepoints.add(parseInt(hex, 16));
    }
  }
  return [...codepoints].sort((a, b) => a - b);
};

const _iconFontFace = (): string =>
  [
    "@font-face {",
    '  font-family: "Font Awesome 7 Free";',
    "  font-style: normal;",
    "  font-weight: 900;",
    "  font-display: block;",
    '  src: url("./fa-solid-900.woff2") format("woff2");',
    "}",
  ].join("\n");

const main = async (): Promise<void> => {
  const colorSchemes = _extractBlocks(
    await Bun.file(THEME_CSS).text(),
    COLOR_SCHEME_AT_RULE,
  );
  const theme = [await _purge(THEME_CSS), ...colorSchemes].join("\n\n");
  const icons = await _purge(FONTAWESOME_CSS);
  const codepoints = _iconCodepoints(theme, icons);

  const font = Buffer.from(await Bun.file(FONTAWESOME_SOLID).arrayBuffer());
  const subset = await subsetFont(font, String.fromCodePoint(...codepoints), {
    targetFormat: "woff2",
  });

  await Bun.write(OUT_THEME, `${theme}\n`);
  await Bun.write(OUT_ICONS, `${_iconFontFace()}\n\n${icons}\n`);
  await Bun.write(OUT_ICON_FONT, subset);

  console.log(
    `synced from ${DEGOOG_DIR}: theme ${(theme.length / 1024).toFixed(1)} KB, icons ${codepoints.length} glyphs ${(subset.length / 1024).toFixed(1)} KB`,
  );
};

await main();
