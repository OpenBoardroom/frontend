// License: CC BY-NC-SA 4.0 plus an additional permission (see README.md, "License").
// The site's navigation and the pages for the data views still in development
// (spec 2026-11-26-site-navigation-shell-design.md). The copy says what each
// view will show and invents no data.

export type NavLink = { label: string; to: string };
export type Page = { title: string; description: string };

export const NAV_LINKS: readonly NavLink[] = [
  { label: "About", to: "/" },
  { label: "Ballot", to: "/ballot" },
  { label: "Explore", to: "/explore" },
];

export const SEARCH_LABEL = "Search proposals";

export const PAGES: { ballot: Page; explore: Page } = {
  ballot: {
    title: "Ballot",
    description:
      "An overview of the items on S&P 100 companies' upcoming shareholder ballots: what each vote decides, who put it forward, and the board's recommendation. This view is in development.",
  },
  explore: {
    title: "Explore",
    description:
      "Browse and search ballot items by company, topic, and who put them forward. This view is in development.",
  },
};
