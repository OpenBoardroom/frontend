// Three real proposals for the "How it works" example list. Figures and URLs
// come from the About draft's sources 4 to 6; titles, questions, arguments,
// and notes come from docs/design/example-list-v9.html. Where they differed,
// the draft won. Community content is invented and must be shown with the
// label in EXAMPLES_FINE_PRINT.

export type Holder = {
  name: string;
  pct: number;
  vote?: "For" | "Against" | "Abstain";
  voteNote?: string;
  parent?: string;
};
export type Argument = { by: string; points: string[] };
export type Example = {
  id: string;
  company: string;
  meeting: string;
  number: number;
  title: string;
  question: string;
  /** Kind of item, shown as the "Type" fact. */
  type: string;
  /** What the proposal asks for, shown as the "What it asks" fact. */
  asks: string;
  proponent: string;
  boardRecommendation: "For" | "Against";
  standard: string;
  result: {
    for: number;
    against: number;
    abstain: number;
    brokerNonVotes?: number;
    passed: boolean;
    pctFor: number;
  };
  holders: Holder[];
  othersPct: number;
  distributionNote?: string;
  arguments: { for: Argument; against: Argument };
  community: {
    poll: { support: number; oppose: number; unsure: number };
    comments: { author: string; text: string }[];
  };
  sources: { label: string; href: string }[];
};

const ALPHABET_PROXY =
  "https://www.sec.gov/Archives/edgar/data/1652044/000130817924000612/lgoog2024_def14a.htm";
const ALPHABET_8K =
  "https://www.sec.gov/Archives/edgar/data/1652044/000119312524160721/d805807d8k.htm";
const APPLE_PROXY =
  "https://www.sec.gov/Archives/edgar/data/320193/000119312522003583/d222670ddef14a.htm";
const APPLE_8K =
  "https://www.sec.gov/Archives/edgar/data/320193/000119312522066169/d294699d8k.htm";
const VANGUARD_NPX_2024 =
  "https://www.sec.gov/Archives/edgar/data/36405/000110465924094482/0001104659-24-094482-index.html";
const VANGUARD_NPX_2022 =
  "https://www.sec.gov/Archives/edgar/data/36405/000110465922094602/tm2221142d1_npx.txt";
const VANGUARD_NPORT_2021 =
  "https://www.sec.gov/Archives/edgar/data/36405/000175272422053926/primary_doc.xml";

const ALPHABET_STANDARD =
  "A majority of the voting power present votes for it (Class A: 1 vote per share; Class B: 10)";
const OTHER_VANGUARD =
  "Other Vanguard funds each report their own votes; not shown in this example";
const BLACKROCK_NOTE = "Reported on Form N-PX; not shown in this example";
const INDIVIDUAL_NOTE = "Individual; vote not disclosed";

const alphabetHolders = (
  vanguard500Vote: "For" | "Against",
  note?: string,
): Holder[] => [
  { name: "Larry Page", pct: 26.7, voteNote: INDIVIDUAL_NOTE },
  { name: "Sergey Brin", pct: 25.0, voteNote: INDIVIDUAL_NOTE },
  { name: "Eric E. Schmidt", pct: 3.8, voteNote: INDIVIDUAL_NOTE },
  { name: "The Vanguard Group", pct: 3.4, voteNote: OTHER_VANGUARD },
  {
    name: "Vanguard 500 Index Fund",
    pct: 1.0,
    vote: vanguard500Vote,
    ...(note === undefined ? {} : { voteNote: note }),
    parent: "The Vanguard Group",
  },
  { name: "BlackRock, Inc.", pct: 2.9, voteNote: BLACKROCK_NOTE },
];

export const EXAMPLES: Example[] = [
  {
    id: "alphabet-2024-p14",
    company: "Alphabet Inc.",
    meeting: "June 7, 2024",
    number: 14,
    title: "Report on Online Safety for Children",
    question:
      "Should Alphabet set targets and report yearly on whether YouTube is reducing harm to children?",
    type: "Stockholder proposal (a request; not binding)",
    asks: "Within a year, adopt targets and publish a yearly report with measures of whether YouTube and Alphabet are reducing actual harm to children",
    proponent: "Boston Common Asset Management",
    boardRecommendation: "Against",
    standard: ALPHABET_STANDARD,
    result: {
      for: 1_788_616_887,
      against: 10_768_198_081,
      abstain: 95_641_307,
      passed: false,
      pctFor: 14.2,
    },
    holders: alphabetHolders("Against"),
    othersPct: 38.2,
    distributionNote:
      "If Page and Brin voted all their shares against, about 36% of everyone else's votes cast were in favor.",
    arguments: {
      for: {
        by: "The proponent",
        points: [
          "Online platforms expose children to risks from exploitation and grooming to privacy violations; it cites YouTube's $170 million FTC settlement over children's data and new laws in the EU, UK, and US, and says Alphabet's steps rely on parental choice without targets investors can judge.",
        ],
      },
      against: {
        by: "The board",
        points: [
          "Google builds child-specific protections into its products (YouTube Kids, supervised accounts, SafeSearch), publishes its child-safety policies and enforcement data, and already meets new regulatory reporting rules, so another report would add little useful information.",
        ],
      },
    },
    community: {
      poll: { support: 71, oppose: 17, unsure: 12 },
      comments: [
        {
          author: "example_reader_1",
          text: 'Targets are the point. "We have policies" doesn\'t tell you whether anything got better.',
        },
        {
          author: "example_reader_2",
          text: "They already report to regulators in several countries. A separate shareholder report sounds like duplicate paperwork.",
        },
        {
          author: "example_reader_3",
          text: "Which harms would the metrics measure? That seems like the hard part.",
        },
      ],
    },
    sources: [
      { label: "Proxy statement, p. 102", href: ALPHABET_PROXY },
      { label: "Vote results (Form 8-K)", href: ALPHABET_8K },
      { label: "Vanguard 500 Index Fund Form N-PX", href: VANGUARD_NPX_2024 },
    ],
  },
  {
    id: "apple-2022-p7",
    company: "Apple Inc.",
    meeting: "March 4, 2022",
    number: 7,
    title: "Report on Forced Labor",
    question:
      "Should Apple report on how well its policies protect workers in its supply chain from forced labor?",
    type: "Shareholder proposal (a request; not binding)",
    asks: "A board-overseen report on suppliers at significant risk of forced labor, corrective actions taken, and grievance mechanisms for affected workers, posted on Apple's website",
    proponent:
      "Not named in the filing (Apple provides proponents' names on request)",
    boardRecommendation: "Against",
    standard:
      "A majority of shares present and voting vote for it, and that majority is also a majority of the quorum",
    result: {
      for: 3_225_431_798,
      against: 6_341_269_524,
      abstain: 135_292_674,
      brokerNonVotes: 3_360_214_513,
      passed: false,
      pctFor: 33.7,
    },
    holders: [
      { name: "The Vanguard Group", pct: 7.68, voteNote: OTHER_VANGUARD },
      {
        name: "Vanguard 500 Index Fund",
        pct: 2.0,
        vote: "Against",
        voteNote: "with the board",
        parent: "The Vanguard Group",
      },
      { name: "BlackRock, Inc.", pct: 6.47, voteNote: BLACKROCK_NOTE },
      {
        name: "Berkshire Hathaway / Warren E. Buffett",
        pct: 5.56,
        voteNote: "Not a fund; votes on this item not disclosed",
      },
    ],
    othersPct: 80.3,
    distributionNote:
      "One vote per share; the three largest holders together hold about 20% of the vote, and no one controls the outcome.",
    arguments: {
      for: {
        by: "The proponent",
        points: [
          "Apple relies on hundreds of suppliers, some reported to be linked to China's forced-labor programs involving Uyghurs, which several governments have called genocide; with US legislation pending to bar goods from the region, a report would reduce regulatory risk.",
        ],
      },
      against: {
        by: "The board",
        points: [
          "Apple has zero tolerance for forced labor and found none in 1,121 supplier assessments in 2020, or in 23 audits of the nine suppliers the proposal cites; it already reports on these protections every year, so the report would duplicate existing disclosures.",
        ],
      },
    },
    community: {
      poll: { support: 63, oppose: 22, unsure: 15 },
      comments: [
        {
          author: "example_reader_1",
          text: "Audits run by the company don't settle it. Grievance numbers would tell you more.",
        },
        {
          author: "example_reader_2",
          text: "Over a thousand assessments a year and an annual report already. What would this add?",
        },
        {
          author: "example_reader_3",
          text: "A third of votes for it seems like a lot. Did support go up the next year?",
        },
      ],
    },
    sources: [
      { label: "Proxy statement, p. 79", href: APPLE_PROXY },
      { label: "Vote results (Form 8-K)", href: APPLE_8K },
      { label: "Vanguard 500 Index Fund Form N-PX", href: VANGUARD_NPX_2022 },
      {
        label: "Vanguard 500 Index Fund Form N-PORT (December 31, 2021)",
        href: VANGUARD_NPORT_2021,
      },
    ],
  },
  {
    id: "alphabet-2024-p9",
    company: "Alphabet Inc.",
    meeting: "June 7, 2024",
    number: 9,
    title: "Equal Shareholder Voting",
    question:
      "Should every Alphabet share get one vote, phasing out the 10 votes per share held mostly by its founders?",
    type: "Stockholder proposal (a request; not binding)",
    asks: "A plan to move all stock to one vote per share, phased in over about seven years",
    proponent: "NorthStar Asset Management, Inc. Funded Pension Plan",
    boardRecommendation: "Against",
    standard: ALPHABET_STANDARD,
    result: {
      for: 3_957_900_469,
      against: 8_675_994_919,
      abstain: 18_560_887,
      brokerNonVotes: 584_773_150,
      passed: false,
      pctFor: 31.3,
    },
    holders: alphabetHolders("For", "against the board"),
    othersPct: 38.2,
    distributionNote:
      "Page and Brin hold 51.7% of the voting power through Class B shares. If they voted all their shares against, about 77% of everyone else's votes cast were in favor.",
    arguments: {
      for: {
        by: "The proponent",
        points: [
          "Class B shares give Page and Brin over 51% of the voting power while they own less than 12% of the stock, so public shareholders lack an equal voice; investor groups such as the Council of Institutional Investors recommend phasing out dual-class structures within seven years.",
        ],
      },
      against: {
        by: "The board",
        points: [
          "The multi-class structure has given the company long-term stability, insulating it from short-term pressure while it delivered strong returns; an independent chair, independent committees, and a majority-independent board keep management accountable.",
        ],
      },
    },
    community: {
      poll: { support: 58, oppose: 27, unsure: 15 },
      comments: [
        {
          author: "example_reader_1",
          text: "If I own the stock, my vote should count the same as anyone else's per share.",
        },
        {
          author: "example_reader_2",
          text: "The founders' control is part of what I bought into. It lets them make long bets that quarterly pressure would kill.",
        },
        {
          author: "example_reader_3",
          text: "Woah, I own that index fund. Interesting that it voted for this when the board was against. A seven-year phase-out sounds reasonable, but what do other dual-class companies do?",
        },
      ],
    },
    sources: [
      { label: "Proxy statement, p. 87", href: ALPHABET_PROXY },
      { label: "Vote results (Form 8-K)", href: ALPHABET_8K },
      { label: "Vanguard 500 Index Fund Form N-PX", href: VANGUARD_NPX_2024 },
    ],
  },
];

export const EXAMPLES_FINE_PRINT: string[] = [
  "Examples were chosen to show different kinds of proposals; they aren't recommendations.",
  "Styling and layout are illustrative; UX is still in development.",
  "Coming later: how the funds you own voted on each item.",
  "These example summaries were written by hand from the filings. On the live site, an AI model will draft them and a person will review each one.",
  "Example content, not real users.",
];
