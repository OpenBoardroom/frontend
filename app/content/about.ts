// License: CC BY-NC-SA 4.0 plus an additional permission (see README.md, "License").
// Copied from architecture/docs/drafts/2026-11-21-about-page-copy.md, section 3.
// The draft stays the source of truth. Three sentences carry the spec §7.1
// tense edits ("will draft", "will review", "will be public", "will be
// logged publicly") because those features are not live yet. The fund
// example in "Why it matters" follows Quinn's 2026-11-22 copy change.

import {
  ALPHABET_8K,
  ALPHABET_PROXY,
  APPLE_8K,
  APPLE_PROXY,
  APPLE_PROXY_2024,
  BROADRIDGE_PROXYPULSE_2026,
  MICROSOFT_PROXY_2023,
  VANGUARD_NPORT_2021,
  VANGUARD_NPX_2022,
  VANGUARD_NPX_2024,
} from "./sources";

export type Inline =
  | string
  | { text: string; href: string }
  | { text: string; strong: true }
  | { text: string; em: true };
export type Block =
  | { kind: "p"; parts: Inline[] }
  | { kind: "ol" | "ul"; items: Inline[][] };
export type Section = { id: string; heading: string; blocks: Block[] };
export type Source = { n: number; text: string; href: string };

const strong = (text: string): Inline => ({ text, strong: true });
const em = (text: string): Inline => ({ text, em: true });

export const ABOUT: {
  title: string;
  description: string;
  sections: Section[];
  sources: Source[];
} = {
  title: "OpenBoardroom",
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
            "The information is technically public, but hard to use. It sits in proxy statements filed with the SEC, which often run past 40,000 words.",
            { text: "[1]", href: APPLE_PROXY_2024 },
            " Few people read them, and most individual investors don't vote: of the shares individuals hold directly, only about 28% were voted in 2025, while institutions such as pension funds and asset managers voted about 77% of theirs.",
            { text: "[2]", href: BROADRIDGE_PROXYPULSE_2026 },
          ],
        },
        {
          kind: "p",
          parts: [
            "Many more people own stock through funds, and the fund votes those shares for them. If you have a retirement account invested in an S&P 500 index fund, like the Vanguard 500 Index Fund or BlackRock's iShares IVV, that fund has been casting votes at hundreds of companies on your behalf. Funds must report every one of those votes each year, but the reports are after-the-fact, hard to find, and harder to read.",
            { text: "[3]", href: VANGUARD_NPX_2024 },
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
              " Discussion and a poll of where readers stand. The poll is a way to see opinion, not a vote, and it never changes the facts above it. ",
              em("(Coming later.)"),
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
            "Questions, corrections, or press: ",
            {
              text: "contact@openboardroom.org",
              href: "mailto:contact@openboardroom.org",
            },
            ".",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      n: 1,
      text: "Apple Inc. 2024 proxy statement (Form DEF 14A), about 45,000 words, measured by OpenBoardroom",
      href: APPLE_PROXY_2024,
    },
    {
      n: 1,
      text: "Microsoft Corporation 2023 proxy statement (Form DEF 14A), about 51,000 words, measured by OpenBoardroom",
      href: MICROSOFT_PROXY_2023,
    },
    {
      n: 2,
      text: "Broadridge, ProxyPulse 2026: shares voted as a share of shares owned, 2025 proxy season (retail 28.0%, institutional 76.6%)",
      href: BROADRIDGE_PROXYPULSE_2026,
    },
    {
      n: 3,
      text: "Example Form N-PX filing: Vanguard 500 Index Fund, votes for the year ending June 30, 2024",
      href: VANGUARD_NPX_2024,
    },
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
