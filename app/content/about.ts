// Copied from architecture/docs/drafts/2026-11-21-about-page-copy.md, section 3.
// The draft stays the source of truth. Three sentences carry the spec §7.1
// tense edits ("will draft", "will review", "will be public", "will be
// logged publicly") because those features are not live yet.

export type Inline =
  | string
  | { text: string; href: string }
  | { text: string; strong: true };
export type Block =
  | { kind: "p"; parts: Inline[] }
  | { kind: "ol" | "ul"; items: Inline[][] };
export type Section = { id: string; heading: string; blocks: Block[] };
export type Source = { n: number; text: string; href: string };

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

const strong = (text: string): Inline => ({ text, strong: true });

export const ABOUT: {
  title: string;
  description: string;
  sections: Section[];
  sources: Source[];
} = {
  title: "OpenBoardroom: your seat at the table",
  description:
    "Every year, public companies put major decisions to a shareholder vote: who sits on the board, how executives are paid, whether to merge or move the company's legal home, and how to respond to proposals from shareholders.",
  sections: [
    {
      id: "what",
      heading: "What OpenBoardroom is",
      blocks: [
        {
          kind: "p",
          parts: [
            "OpenBoardroom is a free public platform for the distribution and discussion of corporate shareholder meetings from ballot items, to their proponents, to their results. It may sound dry, but anyone can engage with the movements of corporations that shape our lives.",
          ],
        },
      ],
    },
    {
      id: "why",
      heading: "Why it matters",
      blocks: [
        {
          kind: "p",
          parts: [
            "Every year, public companies put major decisions to a shareholder vote: who sits on the board, how executives are paid, whether to merge or move the company's legal home, and how to respond to proposals from shareholders. The outcomes reach well beyond investors, to the people who work for these companies, buy from them, and live near them.",
          ],
        },
        {
          kind: "p",
          parts: [
            "The information is technically public, but hard to use. It sits in proxy statements filed with the SEC, which often run past 40,000 words.[1] Few people read them, and most individual investors don't vote: of the shares individuals hold directly, only about 28% were voted in 2025, while institutions such as pension funds and asset managers voted about 77% of theirs.[2]",
          ],
        },
        {
          kind: "p",
          parts: [
            "Many more people own stock through funds, and the fund votes those shares for them. If you have a retirement account invested in a Vanguard target-date fund, or an S&P 500 index fund like BlackRock's iShares IVV, that fund has been casting votes at hundreds of companies on your behalf. Funds must report every one of those votes each year, but the reports are after-the-fact, hard to find, and harder to read.[3]",
          ],
        },
        {
          kind: "p",
          parts: [
            "OpenBoardroom makes these decisions easy to find, understand, and discuss, for shareholders and for everyone else they affect. It also shows how the largest funds and investors vote, so you can see whether the funds you own vote the way you would, and follow which shareholder campaigns are gaining or losing support over time.",
          ],
        },
      ],
    },
    {
      id: "how",
      heading: "How it works",
      blocks: [
        {
          kind: "p",
          parts: [
            "Every proposal on OpenBoardroom starts from the company's own filing with the SEC. Take Alphabet's 2024 proxy statement: a legal document of nearly 100 pages listing fourteen items for its June 2024 annual meeting.",
            { text: "[4]", href: ALPHABET_PROXY },
            " We read each filing and break it into the individual items on the ballot. Each item gets three clearly separated parts, plus a view of who holds the votes:",
          ],
        },
        {
          kind: "ol",
          items: [
            [
              strong("The facts."),
              " What's being decided, who proposed it, what the board recommends, what it takes to pass, and, after the meeting, how the vote turned out. Every fact links to the page of the filing it came from.",
            ],
            [
              strong("The arguments."),
              " The main case for and against, each attributed to whoever makes it (the proponent, the board, and later others such as large funds), written side by side at similar length. An AI model will draft these summaries from the filing, and a person will review each one before it's published. They summarize what others argue, never OpenBoardroom's view.",
            ],
            [
              strong("The community."),
              " Discussion and a poll of where readers stand. The poll is a way to see opinion, not a vote, and it never changes the facts above it. (Coming later.)",
            ],
          ],
        },
        {
          kind: "p",
          parts: [
            "Here are three proposals from recent annual meetings. Open any of them to see how OpenBoardroom presents a ballot item.",
          ],
        },
      ],
    },
    {
      id: "values",
      heading: "Our values",
      blocks: [
        {
          kind: "p",
          parts: [
            "OpenBoardroom is run with principles, and we'd rather state them than hide them. As an organization, we support:",
          ],
        },
        {
          kind: "ul",
          items: [
            [strong("Consumer rights")],
            [strong("Right to repair")],
            [strong("Human rights")],
            [strong("Animal welfare")],
            [strong("Environmental protection")],
          ],
        },
        {
          kind: "p",
          parts: [
            "We act on these openly and in our own name, although our purpose remains focused on maximizing shareholder and public engagement with corporate decisions.",
          ],
        },
        {
          kind: "p",
          parts: [
            "These values never shape the platform itself. Every proposal, from any side and on any issue, gets the same format, the same prominence, and the same standards for its summary. Proposals we'd personally support and proposals we'd oppose are presented identically. We never tell anyone how to vote. Our summary prompts, style rules, and a log of every correction will be public, so anyone can check that we keep that promise.",
          ],
        },
      ],
    },
    {
      id: "who",
      heading: "Who runs it",
      blocks: [
        {
          kind: "p",
          parts: [
            "OpenBoardroom was founded by Quinn Maloney and is operated today by Boardroom LLC, a California company. We're moving it to a nonprofit: a California nonprofit public benefit corporation that will apply for 501(c)(3) status. When that's done, the nonprofit will own the platform, its code, and its data.",
          ],
        },
        {
          kind: "p",
          parts: [
            "OpenBoardroom is self-funded by its founder, with no outside investors.",
          ],
        },
        { kind: "p", parts: ["We work in the open:"] },
        {
          kind: "ul",
          items: [
            [
              strong("Code:"),
              " the platform's code is open source under the AGPL-3.0 license, on GitHub at ",
              {
                text: "github.com/OpenBoardroom",
                href: "https://github.com/OpenBoardroom",
              },
              ".",
            ],
            [
              strong("Content:"),
              " our summaries are free to read and to reuse for news, research, and teaching, under a Creative Commons license (CC BY-NC-SA 4.0) with an added permission for those uses.",
            ],
            [
              strong("Corrections:"),
              " every change to something we've published will be logged publicly, with what changed and why.",
            ],
          ],
        },
        {
          kind: "p",
          parts: [
            "Questions, corrections, or press: contact@openboardroom.org.",
          ],
        },
      ],
    },
  ],
  // The draft's sources 1 to 3 (word counts, Broadridge, Form N-PX examples)
  // have no URLs yet, so they are not listed here; see the task 4 report.
  sources: [
    {
      n: 4,
      text: "Alphabet Inc. 2024 proxy statement (Form DEF 14A, filed 2024-04-26)",
      href: ALPHABET_PROXY,
    },
    {
      n: 4,
      text: "Alphabet Inc. vote results (Form 8-K, Item 5.07, filed 2024-06-13)",
      href: ALPHABET_8K,
    },
    {
      n: 5,
      text: "Apple Inc. 2022 proxy statement (Form DEF 14A, filed 2022-01-06)",
      href: APPLE_PROXY,
    },
    {
      n: 5,
      text: "Apple Inc. vote results (Form 8-K, Item 5.07)",
      href: APPLE_8K,
    },
    {
      n: 6,
      text: "Vanguard 500 Index Fund, Form N-PX, period ending June 30, 2024",
      href: VANGUARD_NPX_2024,
    },
    {
      n: 6,
      text: "Vanguard 500 Index Fund, Form N-PX, 2022",
      href: VANGUARD_NPX_2022,
    },
    {
      n: 6,
      text: "Vanguard 500 Index Fund, Form N-PORT, holdings on December 31, 2021",
      href: VANGUARD_NPORT_2021,
    },
  ],
};
