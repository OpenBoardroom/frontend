import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

const PAGES = ["/", "/ballot", "/explore"];
const LINKS = ["About", "Ballot", "Explore"];

async function expectBar(page: Page) {
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const name of LINKS) {
    await expect(nav.getByRole("link", { name, exact: true })).toBeAttached();
  }
  await expect(
    page.getByRole("searchbox", { name: "Search proposals" }),
  ).toBeVisible();
}

test("every page has the bar, the 404 page included", async ({ page }) => {
  for (const path of [...PAGES, "/no-such-page"]) {
    await page.goto(path);
    await expectBar(page);
  }
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});

test("the current page is marked", async ({ page }) => {
  await page.goto("/ballot");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Ballot" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(nav.getByRole("link", { name: "About" })).not.toHaveAttribute(
    "aria-current",
    /.*/,
  );
});

test("links and search work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Explore" })
    .click();
  await expect(page).toHaveURL(/\/explore$/);
  await page.getByRole("searchbox", { name: "Search proposals" }).fill("water");
  await page
    .getByRole("searchbox", { name: "Search proposals" })
    .press("Enter");
  await expect(page).toHaveURL(/\/explore\?q=water$/);
  await context.close();
});

test("on a phone the links fold into a menu and nothing overflows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  const menu = page.locator("details.nav-menu");
  await expect(menu).not.toHaveAttribute("open", /.*/);
  await expect(page.getByRole("link", { name: "Ballot" })).toBeHidden();
  await menu.locator("summary").click();
  for (const name of LINKS) {
    await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole("searchbox", { name: "Search proposals" }),
  ).toBeVisible();
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(375);
});

test("no accessibility violations on any page, at desktop and phone widths", async ({
  page,
}) => {
  // Final review: the phone bar hid the logo link's name, and the 404 page had no title.
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of [...PAGES, "/no-such-page"]) {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(results.violations, `${path} at ${width}px`).toEqual([]);
    }
  }
});

test("with JavaScript on, the phone menu closes after a link is chosen", async ({
  page,
}) => {
  // Final review: the bar outlives client-side navigation, so <details> stayed open.
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  const menu = page.locator("details.nav-menu");
  await menu.locator("summary").click();
  await menu.getByRole("link", { name: "Ballot" }).click();
  await expect(page).toHaveURL(/\/ballot$/);
  await expect(menu).not.toHaveAttribute("open", /.*/);
});
