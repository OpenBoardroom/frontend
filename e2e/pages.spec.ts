import { expect, test } from "@playwright/test";

test("the season page says what it will show", async ({ page }) => {
  await page.goto("/season");
  await expect(
    page.getByRole("heading", { level: 1, name: "This season" }),
  ).toBeVisible();
  await expect(page.getByText("This view is in development.")).toBeVisible();
  await expect(page).toHaveTitle("This season · OpenBoardroom");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://openboardroom.org/season",
  );
  await expect(
    page.getByRole("link", { name: "Read about OpenBoardroom" }),
  ).toHaveAttribute("href", "/");
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
