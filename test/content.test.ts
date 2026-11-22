import { describe, expect, test } from "vitest";
import { ABOUT, type Block, type Inline } from "../app/content/about";
import { EXAMPLES, EXAMPLES_FINE_PRINT } from "../app/content/examples";
import { MILESTONES } from "../app/content/milestones";

function inlineText(part: Inline): string {
  return typeof part === "string" ? part : part.text;
}

function blockText(block: Block): string {
  if (block.kind === "p") return block.parts.map(inlineText).join("");
  return block.items.map((item) => item.map(inlineText).join("")).join("\n");
}

const ABOUT_TEXT = ABOUT.sections
  .flatMap((s) => [s.heading, ...s.blocks.map(blockText)])
  .join("\n");

function inlineLinks(): string[] {
  const parts = ABOUT.sections.flatMap((section) =>
    section.blocks.flatMap((block) =>
      block.kind === "p" ? block.parts : block.items.flat(),
    ),
  );
  return parts.flatMap((part) =>
    typeof part !== "string" && "href" in part ? [part.href] : [],
  );
}

describe("ABOUT", () => {
  test("has the five sections in order", () => {
    expect(ABOUT.sections.map((s) => s.heading)).toEqual([
      "What OpenBoardroom is",
      "Why it matters",
      "How it works",
      "Our values",
      "Who runs it",
    ]);
  });

  test("title and description", () => {
    expect(ABOUT.title).toBe("OpenBoardroom: your seat at the table");
    expect(ABOUT.description).toMatch(/^Every year, public companies/);
    expect(ABOUT.description.endsWith("from shareholders.")).toBe(true);
  });

  test("tense rule: nothing not yet live is described as live", () => {
    for (const banned of [
      "are public, so anyone can check",
      "An AI model drafts these summaries",
      "is logged publicly",
    ]) {
      expect(ABOUT_TEXT).not.toContain(banned);
    }
    for (const required of [
      "will be public",
      "will draft",
      "will be logged publicly",
    ]) {
      expect(ABOUT_TEXT).toContain(required);
    }
  });

  test("the tense edits keep the rest of each sentence intact", () => {
    expect(ABOUT_TEXT).toContain(
      "An AI model will draft these summaries from the filing, and a person will review each one before it's published.",
    );
    expect(ABOUT_TEXT).toContain(
      "Our summary prompts, style rules, and a log of every correction will be public, so anyone can check that we keep that promise.",
    );
    expect(ABOUT_TEXT).toContain(
      "every change to something we've published will be logged publicly, with what changed and why.",
    );
  });

  test("every URL is https", () => {
    const urls = [
      ...ABOUT.sources.map((s) => s.href),
      ...EXAMPLES.flatMap((e) => e.sources.map((s) => s.href)),
      ...inlineLinks(),
    ];
    expect(urls.length).toBeGreaterThan(10);
    for (const url of urls) expect(url).toMatch(/^https:\/\//);
  });

  test("sources are numbered and non-empty", () => {
    for (const s of ABOUT.sources) {
      expect(Number.isInteger(s.n)).toBe(true);
      expect(s.text.length).toBeGreaterThan(0);
    }
  });
});

describe("EXAMPLES", () => {
  test("are in the spec's order", () => {
    expect(
      EXAMPLES.map((e) => `${e.company} ${e.meeting} P${e.number}`),
    ).toEqual([
      "Alphabet Inc. June 7, 2024 P14",
      "Apple Inc. March 4, 2022 P7",
      "Alphabet Inc. June 7, 2024 P9",
    ]);
    expect(EXAMPLES.map((e) => e.id)).toEqual([
      "alphabet-2024-p14",
      "apple-2022-p7",
      "alphabet-2024-p9",
    ]);
  });

  test("each example's pctFor matches its counts", () => {
    expect(EXAMPLES.map((e) => e.result.pctFor)).toEqual([14.2, 33.7, 31.3]);
    for (const { result: r } of EXAMPLES) {
      expect(Math.round((1000 * r.for) / (r.for + r.against)) / 10).toBe(
        r.pctFor,
      );
    }
  });

  test("holders plus others sum to 100 within 0.2", () => {
    for (const e of EXAMPLES) {
      const top = e.holders
        .filter((h) => h.parent === undefined)
        .reduce((sum, h) => sum + h.pct, 0);
      expect(Math.abs(top + e.othersPct - 100)).toBeLessThanOrEqual(0.2);
    }
  });

  test("nested fund slices sit inside their parent's share", () => {
    for (const e of EXAMPLES) {
      for (const h of e.holders.filter((x) => x.parent !== undefined)) {
        const parent = e.holders.find((p) => p.name === h.parent);
        expect(parent).toBeDefined();
        expect(h.pct).toBeLessThanOrEqual(parent?.pct ?? 0);
      }
    }
  });

  test("every argument is attributed and has points", () => {
    for (const e of EXAMPLES) {
      for (const side of [e.arguments.for, e.arguments.against]) {
        expect(side.by.length).toBeGreaterThan(0);
        expect(side.points.length).toBeGreaterThan(0);
      }
    }
  });

  test("community polls add to 100 and comments are present", () => {
    for (const e of EXAMPLES) {
      const p = e.community.poll;
      expect(p.support + p.oppose + p.unsure).toBe(100);
      expect(e.community.comments).toHaveLength(3);
    }
  });

  test("each example links its proxy statement and vote results", () => {
    for (const e of EXAMPLES) {
      expect(e.sources.length).toBeGreaterThanOrEqual(2);
    }
  });

  test("fine print", () => {
    expect(EXAMPLES_FINE_PRINT).toContain(
      "Examples were chosen to show different kinds of proposals; they aren't recommendations.",
    );
    expect(EXAMPLES_FINE_PRINT).toContain(
      "These example summaries were written by hand from the filings. On the live site, an AI model will draft them and a person will review each one.",
    );
    expect(EXAMPLES_FINE_PRINT).toContain("Example content, not real users.");
  });
});

describe("MILESTONES", () => {
  test("exactly one item is in progress", () => {
    expect(MILESTONES.filter((m) => m.status === "in-progress")).toHaveLength(
      1,
    );
  });

  test("the five from the spec, in order", () => {
    expect(MILESTONES.map((m) => m.status)).toEqual([
      "done",
      "in-progress",
      "next",
      "later",
      "later",
    ]);
    expect(MILESTONES.map((m) => m.title)).toEqual([
      "Foundations",
      "Ballot data pipeline",
      "Extraction, review, and vote results",
      "Public site with real ballot items",
      "Phase 1 launch for the 2027 proxy season",
    ]);
  });
});
