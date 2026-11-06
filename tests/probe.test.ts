import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { Server } from "bun";
import { probeInstanceUrl } from "../src/checker/probe";

type Route = (request: Request) => Response;

const ROUTES: Record<string, Record<string, Route>> = {
  healthy: {
    "/readyz": () => Response.json({ ok: true }),
    "/api/whodis": () => new Response("deez nuts"),
  },
  booting: {
    "/readyz": () => Response.json({ ok: false }, { status: 503 }),
  },
  impostor: {
    "/readyz": () => Response.json({ ok: true }),
    "/api/whodis": () => new Response("hello"),
  },
  parked: {
    "/readyz": () => new Response("<html>for sale</html>", { status: 200 }),
  },
  challenged: {
    "/readyz": () =>
      new Response("<html>Just a moment...</html>", {
        status: 403,
        headers: { server: "cloudflare", "cf-mitigated": "challenge" },
      }),
  },
  redirecting: {
    "/readyz": () => Response.redirect("https://example.com/", 301),
  },
};

let server: Server<undefined>;

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    fetch: (request) => {
      const url = new URL(request.url);
      const [, scenario = "", ...rest] = url.pathname.split("/");
      const route = ROUTES[scenario]?.[`/${rest.join("/")}`];
      return route
        ? route(request)
        : new Response("not found", { status: 404 });
    },
  });
});

afterAll(() => {
  server.stop(true);
});

const probe = (scenario: string): ReturnType<typeof probeInstanceUrl> =>
  probeInstanceUrl(`http://localhost:${server.port}/${scenario}`);

describe("probeInstanceUrl", () => {
  test("ready degoog instance is up", async () => {
    const result = await probe("healthy");
    expect(result.status).toBe("up");
    expect(result.httpStatus).toBe(200);
    expect(result.latencyMs).toBeNumber();
  });

  test("503 with ok false is starting, not down", async () => {
    expect((await probe("booting")).status).toBe("starting");
  });

  test("healthy readiness without the degoog whodis answer is unverified", async () => {
    expect((await probe("impostor")).status).toBe("unverified");
  });

  test("200 html from a parked domain is down", async () => {
    expect((await probe("parked")).status).toBe("down");
  });

  test("cloudflare challenge is blocked, not down", async () => {
    expect((await probe("challenged")).status).toBe("blocked");
  });

  test("redirects are not followed", async () => {
    const result = await probe("redirecting");
    expect(result.status).toBe("down");
    expect(result.httpStatus).toBe(301);
  });

  test("missing health route is reported as such", async () => {
    expect((await probe("unknown")).status).toBe("no_health_endpoint");
  });

  test("unreachable host is down with a network error", async () => {
    const result = await probeInstanceUrl("http://127.0.0.1:1");
    expect(result.status).toBe("down");
    expect(result.httpStatus).toBeNull();
    expect(result.error).toBeString();
  });
});
