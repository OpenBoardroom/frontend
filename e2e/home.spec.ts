import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Must match the message e2e/fixture-github.ts injects into the commit feed.
const HOSTILE_MESSAGE = "<img src=x onerror=alert(1)>";

const HEADINGS = [
  "What OpenBoardroom is",
  "Why it matters",
  "How it works",
  "Our values",
  "Who runs it",
];

test("renders the About sections, the status panel, and three collapsed examples", async ({
  page,
}) => {
  await page.goto("/");
  for (const name of HEADINGS) {
    await expect(page.getByRole("heading", { name })).toBeVisible();
  }
  await expect(page.locator("aside")).toContainText("Foundations");
  const examples = page.locator("details.item");
  await expect(examples).toHaveCount(3);
  for (const example of await examples.all()) {
    await expect(example).not.toHaveAttribute("open", /.*/);
  }
});

test("opening an example shows vote distribution and community", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("details.item > summary").first().click();
  await expect(page.getByText("Vote distribution").first()).toBeVisible();
  await expect(
    page.getByText("Example content, not real users.").first(),
  ).toBeVisible();
});

test("commit messages render as text", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(HOSTILE_MESSAGE)).toBeVisible();
  await expect(page.locator("aside img")).toHaveCount(0);
});

test("meets WCAG AA", async ({ page }) => {
  await page.goto("/");
  for (const summary of await page.locator("details.item > summary").all()) {
    await summary.click();
  }
  await expect(page.locator("details.item[open]")).toHaveCount(3);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("redirect host", async ({ request }) => {
  const response = await request.get("/x?y=1", {
    headers: { host: "brdrmr.org" },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe("https://openboardroom.org/x?y=1");
});

test("phone width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(360);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("works without JavaScript", async ({ page }) => {
    await page.goto("/");
    const first = page.locator("details.item").first();
    await expect(first).not.toHaveAttribute("open", /.*/);
    await first.locator("> summary").click();
    await expect(first).toHaveAttribute("open", /.*/);
  });
});
