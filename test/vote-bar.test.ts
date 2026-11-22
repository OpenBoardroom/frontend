import { describe, expect, test } from "vitest";
import type { Holder } from "../app/content/examples";
import { EXAMPLES } from "../app/content/examples";
import { barSegments, formatPct, holderGroups } from "../app/lib/vote-bar";

const holders: Holder[] = [
  { name: "Founder A", pct: 26.7 },
  { name: "Family", pct: 7.68 },
  { name: "Fund in family", pct: 2.0, parent: "Family" },
  { name: "Other fund", pct: 1.5, parent: "Family" },
  { name: "Manager B", pct: 6.47 },
];

describe("barSegments", () => {
  test("top-level holders in the given order, then Everyone else", () => {
    expect(barSegments(holders, 55.1).map((s) => s.label)).toEqual([
      "Founder A",
      "Family",
      "Manager B",
      "Everyone else",
    ]);
  });

  test("a holder with a parent sits in its parent's nested list, not as its own segment", () => {
    const segments = barSegments(holders, 55.1);
    expect(segments.find((s) => s.label === "Family")?.nested).toEqual([
      { label: "Fund in family", pct: 2.0 },
      { label: "Other fund", pct: 1.5 },
    ]);
    expect(segments.find((s) => s.label === "Founder A")?.nested).toEqual([]);
    expect(segments.at(-1)?.nested).toEqual([]);
  });

  test("percentages are unchanged", () => {
    expect(barSegments(holders, 55.1).map((s) => s.pct)).toEqual([
      26.7, 7.68, 6.47, 55.1,
    ]);
  });

  test("a holder whose parent is missing is kept as a top-level segment", () => {
    const orphan: Holder[] = [{ name: "Lonely fund", pct: 1, parent: "Gone" }];
    expect(barSegments(orphan, 99)).toEqual([
      { label: "Lonely fund", pct: 1, nested: [] },
      { label: "Everyone else", pct: 99, nested: [] },
    ]);
  });

  test("works on the real Apple example", () => {
    const apple = EXAMPLES.find((e) => e.id === "apple-2022-p7");
    if (!apple) throw new Error("missing Apple example");
    expect(barSegments(apple.holders, apple.othersPct)).toEqual([
      {
        label: "The Vanguard Group",
        pct: 7.68,
        nested: [{ label: "Vanguard 500 Index Fund", pct: 2.0 }],
      },
      { label: "BlackRock, Inc.", pct: 6.47, nested: [] },
      {
        label: "Berkshire Hathaway / Warren E. Buffett",
        pct: 5.56,
        nested: [],
      },
      { label: "Everyone else", pct: 80.3, nested: [] },
    ]);
  });
});

describe("holderGroups", () => {
  const alphabet = EXAMPLES.find((e) => e.id === "alphabet-2024-p14");
  const apple = EXAMPLES.find((e) => e.id === "apple-2022-p7");
  if (!alphabet || !apple) throw new Error("missing examples");

  test("matches the mockup's colors for Alphabet", () => {
    const groups = holderGroups(alphabet.holders);
    expect(groups.map((g) => [g.color, g.members.map((m) => m.name)])).toEqual([
      ["holder", ["Larry Page", "Sergey Brin", "Eric E. Schmidt"]],
      ["inst", ["The Vanguard Group"]],
      ["inst2", ["BlackRock, Inc."]],
    ]);
    expect(groups[1]?.nested.map((n) => n.name)).toEqual([
      "Vanguard 500 Index Fund",
    ]);
  });

  test("matches the mockup's colors for Apple", () => {
    expect(holderGroups(apple.holders).map((g) => g.color)).toEqual([
      "inst",
      "inst2",
      "inst3",
    ]);
  });

  test("a holder with a vote is never merged into a group", () => {
    const groups = holderGroups([
      { name: "A", pct: 1, voteNote: "n" },
      { name: "B", pct: 1, voteNote: "n", vote: "For" },
    ]);
    expect(groups.map((g) => g.members.length)).toEqual([1, 1]);
  });

  test("extra single holders cycle through the institution colors", () => {
    const many: Holder[] = ["A", "B", "C"].map((name) => ({ name, pct: 1 }));
    expect(holderGroups(many).map((g) => g.color)).toEqual([
      "inst2",
      "inst3",
      "inst2",
    ]);
  });
});

describe("formatPct", () => {
  test("keeps the data's precision, with at least one decimal", () => {
    expect([25, 2, 7.68, 80.3, 14.2].map(formatPct)).toEqual([
      "25.0%",
      "2.0%",
      "7.68%",
      "80.3%",
      "14.2%",
    ]);
  });

  test("rounds float noise away", () => {
    expect(formatPct(3.4 - 1.0)).toBe("2.4%");
  });
});
