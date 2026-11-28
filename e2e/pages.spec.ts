import { expect, test } from "@playwright/test";

test("the ballot page says what it will show", async ({ page }) => {
  await page.goto("/ballot");
  await expect(
    page.getByRole("heading", { level: 1, name: "Ballot" }),
  ).toBeVisible();
  await expect(page.getByText("This view is in development.")).toBeVisible();
  await expect(page).toHaveTitle("Ballot · OpenBoardroom");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://openboardroom.org/ballot",
  );
  await expect(
    page.getByRole("link", { name: "Read about OpenBoardroom" }),
  ).toHaveAttribute("href", "/");
});

test("the old /season address redirects permanently to /ballot", async ({
  request,
}) => {
  const response = await request.get("/season?q=kept", { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe("/ballot");
});

test("explore echoes the search query, and shows nothing without one", async ({
  page,
}) => {
  await page.goto("/explore?q=water");
  await expect(page).toHaveTitle("Explore · OpenBoardroom");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://openboardroom.org/explore",
  );
  await expect(
    page.getByText("Search for “water” will work once Explore is ready."),
  ).toBeVisible();
  await page.goto("/explore");
  await expect(page.getByText(/Search for/)).toHaveCount(0);
});

test("a hostile query is shown as text", async ({ page }) => {
  let dialog = false;
  page.on("dialog", async (d) => {
    dialog = true;
    await d.dismiss();
  });
  const hostile = "<img src=x onerror=alert(1)>";
  await page.goto(`/explore?q=${encodeURIComponent(hostile)}`);
  await expect(
    page.getByText(`Search for “${hostile}”`, { exact: false }),
  ).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(0);
  expect(dialog).toBe(false);
});

test("a long query is capped at 200 characters", async ({ page }) => {
  await page.goto(`/explore?q=${"y".repeat(1000)}`);
  const text = await page.getByText(/Search for/).textContent();
  expect(text?.match(/y+/)?.[0]).toHaveLength(200);
});

test("a long query without spaces doesn't scroll the page sideways", async ({
  page,
}) => {
  // Final review: 200 unbroken characters pushed the page to 1705px wide.
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(`/explore?q=${"y".repeat(200)}`);
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(375);
});

test("the echoed query is isolated from the surrounding text", async ({
  page,
}) => {
  // A right-to-left override in the query can't reorder the sentence around it.
  await page.goto(`/explore?q=${encodeURIComponent("water‮abc")}`);
  await expect(page.locator("main bdi")).toHaveText("water‮abc");
});
