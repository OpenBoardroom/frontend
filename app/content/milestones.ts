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
    detail: "Discovery and fetching live for the S&P 100",
    status: "in-progress",
  },
  { title: "Extraction, review, and vote results", status: "next" },
  { title: "Public site with real ballot items", status: "later" },
  { title: "Phase 1 launch for the 2027 proxy season", status: "later" },
];
