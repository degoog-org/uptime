import tailwind from "bun-plugin-tailwind";
import { rmSync } from "fs";

const OUT_DIR = "dist";
const INDEX_PATH = `${OUT_DIR}/index.html`;
const REPOSITORY = process.env.GITHUB_REPOSITORY ?? "degoog-org/uptime";
const STATUS_URL =
  process.env.STATUS_URL ??
  `https://raw.githubusercontent.com/${REPOSITORY}/data/status.json`;

const contentSecurityPolicy = (statusUrl: string): string => {
  const connectSources = URL.canParse(statusUrl)
    ? `'self' ${new URL(statusUrl).origin}`
    : "'self'";
  return [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self'",
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
};

const addContentSecurityPolicy = async (
  path: string,
  policy: string,
): Promise<void> => {
  const html = await Bun.file(path).text();
  const rewritten = new HTMLRewriter()
    .on("meta[charset]", {
      element: (element) => {
        element.after(
          `<meta http-equiv="Content-Security-Policy" content="${policy}" />`,
          { html: true },
        );
      },
    })
    .transform(html);
  await Bun.write(path, rewritten);
};

rmSync(OUT_DIR, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: ["web/index.html"],
  outdir: OUT_DIR,
  target: "browser",
  minify: true,
  publicPath: "./",
  plugins: [tailwind],
  define: {
    __STATUS_URL__: JSON.stringify(STATUS_URL),
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

await addContentSecurityPolicy(INDEX_PATH, contentSecurityPolicy(STATUS_URL));

for (const output of result.outputs) {
  console.log(
    `${output.path.replace(`${process.cwd()}/`, "")} ${(output.size / 1024).toFixed(1)} KB`,
  );
}
console.log(`status url ${STATUS_URL}`);
