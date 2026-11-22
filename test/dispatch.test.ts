import { expect, test, vi } from "vitest";
import { dispatch } from "../app/server/dispatch";

function setup(assetStatus = 200) {
  const assets = vi.fn(
    async () => new Response("asset", { status: assetStatus }),
  );
  const router = vi.fn(async () => new Response("router"));
  const run = (request: Request) => dispatch(request, assets, router);
  return { assets, router, run };
}

test("redirect host gets a 301 without touching assets or router", async () => {
  const { assets, router, run } = setup();
  const res = await run(new Request("https://brdrmr.com/favicon.ico"));
  expect(res.status).toBe(301);
  expect(assets).not.toHaveBeenCalled();
  expect(router).not.toHaveBeenCalled();
});

test("redirect applies to POST too", async () => {
  const { run } = setup();
  const res = await run(
    new Request("https://brdrmr.com/x", { method: "POST" }),
  );
  expect(res.status).toBe(301);
});

test("GET asset hit is served from assets", async () => {
  const { router, run } = setup(200);
  const res = await run(new Request("https://openboardroom.org/a.js"));
  expect(await res.text()).toBe("asset");
  expect(router).not.toHaveBeenCalled();
});

test("GET asset 404 falls through to the router", async () => {
  const { router, run } = setup(404);
  const res = await run(new Request("https://openboardroom.org/"));
  expect(await res.text()).toBe("router");
  expect(router).toHaveBeenCalledOnce();
});

test.each(["POST", "PUT", "DELETE"])(
  "%s skips assets and goes to the router",
  async (method) => {
    const { assets, router, run } = setup();
    const res = await run(
      new Request("https://openboardroom.org/x", { method }),
    );
    expect(await res.text()).toBe("router");
    expect(assets).not.toHaveBeenCalled();
    expect(router).toHaveBeenCalledOnce();
  },
);
