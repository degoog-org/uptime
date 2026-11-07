import index from "../web/index.html";
import { DAYS_DIR, STATUS_PATH } from "../src/config";

const PORT = Number(process.env.PORT ?? 4500);
const DAY_FILE_PATTERN = /^\d{4}-\d{2}-\d{2}\.json$/;

const serveJson = async (path: string): Promise<Response> => {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    return Response.json({ error: `missing ${path}` }, { status: 404 });
  }
  return new Response(file, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
};

const server = Bun.serve({
  port: PORT,
  development: true,
  routes: {
    "/": index,
    "/status.json": () => serveJson(STATUS_PATH),
    "/days/:file": (request) =>
      DAY_FILE_PATTERN.test(request.params.file)
        ? serveJson(`${DAYS_DIR}/${request.params.file}`)
        : Response.json({ error: "not found" }, { status: 404 }),
  },
});

console.log(
  `degoog status running at ${server.url} serving ${STATUS_PATH} and ${DAYS_DIR}`,
);
