// License: CC BY-NC-SA 4.0 plus an additional permission (see README.md, "License").
// The site's navigation and the pages for the data views still in development
// (spec 2026-11-26-site-navigation-shell-design.md). The copy says what each
// view will show and invents no data.

export type NavLink = { label: string; to: string };
export type Page = { title: string; description: string };

export const NAV_LINKS: readonly NavLink[] = [
  { label: "About", to: "/" },
  { label: "This season", to: "/season" },
  { label: "Explore", to: "/explore" },
];

export const SEARCH_LABEL = "Search proposals";

export const PAGES: { season: Page; explore: Page } = {
  season: {
    title: "This season",
    description:
      "An overview of the 2026 ballot at S&P 100 companies: each item, what the vote decides, who put it forward, and the board's recommendation. This view is in development.",
  },
  explore: {
    title: "Explore",
    description:
      "Browse and search ballot items by company, topic, and who put them forward. This view is in development.",
  },
};
