import index from "../web/index.html";
import { STATUS_PATH } from "../src/config";

const PORT = Number(process.env.PORT ?? 4500);

const serveStatus = async (): Promise<Response> => {
  const file = Bun.file(STATUS_PATH);
  if (!(await file.exists())) {
    return Response.json(
      { error: `missing ${STATUS_PATH}, run bun run cron or bun run demo` },
      { status: 404 },
    );
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
    "/status.json": serveStatus,
  },
});

console.log(`degoog status running at ${server.url} serving ${STATUS_PATH}`);
