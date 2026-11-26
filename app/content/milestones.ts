// License: CC BY-NC-SA 4.0 plus an additional permission (see README.md, "License").
export type Milestone = {
  title: string;
  detail?: string;
  status: "done" | "in-progress" | "next" | "later";
  date?: string;
};

// Starting list from spec §7.3; Quinn edits it by PR.
export const MILESTONES: Milestone[] = [
  {
    title: "Foundations",
    detail: "Organization, repositories, working agreements",
    status: "done",
  },
  {
    title: "Ballot data pipeline",
    detail: "Discovery, fetching, extraction, and supplements for the S&P 100",
    status: "done",
  },
  {
    title: "Extraction, review, and vote results",
    detail:
      "2026 season extracted and checked; review tools built; vote results next",
    status: "in-progress",
  },
  { title: "Public site with real ballot items", status: "next" },
  { title: "Phase 1 launch for the 2027 proxy season", status: "later" },
];
