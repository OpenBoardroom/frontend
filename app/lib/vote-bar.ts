import type { Holder } from "../content/examples";

export type BarSegment = {
  label: string;
  pct: number;
  nested: { label: string; pct: number }[];
};

export const EVERYONE_ELSE = "Everyone else";

/**
 * Groups holders into the voting-power bar's segments: top-level holders in
 * order, each with the funds inside it, then everyone else. A nested fund's
 * share is already counted in its parent's, so it never gets its own segment.
 */
export function barSegments(
  holders: Holder[],
  othersPct: number,
): BarSegment[] {
  const names = new Set(holders.map((h) => h.name));
  const isNested = (h: Holder) => h.parent !== undefined && names.has(h.parent);
  const segments: BarSegment[] = holders
    .filter((h) => !isNested(h))
    .map((h) => ({
      label: h.name,
      pct: h.pct,
      nested: holders
        .filter((c) => isNested(c) && c.parent === h.name)
        .map((c) => ({ label: c.name, pct: c.pct })),
    }));
  segments.push({ label: EVERYONE_ELSE, pct: othersPct, nested: [] });
  return segments;
}

/** Palette slot for a holder group; each maps to a `--ob-*` color. */
export type Swatch = "holder" | "fund" | "inst" | "inst2" | "inst3" | "rest";

export type HolderGroup = {
  color: Swatch;
  members: Holder[];
  /** Funds listed inside this group's single member (its fund family). */
  nested: Holder[];
};

const SINGLE_COLORS = ["inst2", "inst3"] as const;

/**
 * Groups top-level holders for color and legend. The data has no holder kind,
 * so the mockup's scheme is derived: a fund family (a holder with funds
 * inside it) is "inst"; consecutive holders that share a vote note and cast
 * no reported vote (the Alphabet founders) form one "holder" group; every
 * other holder takes the next institution color.
 */
export function holderGroups(holders: Holder[]): HolderGroup[] {
  const names = new Set(holders.map((h) => h.name));
  const nestedIn = (name: string) => holders.filter((h) => h.parent === name);
  const raw: { members: Holder[]; nested: Holder[] }[] = [];
  for (const h of holders) {
    if (h.parent !== undefined && names.has(h.parent)) continue;
    const nested = nestedIn(h.name);
    const prev = raw.at(-1);
    const last = prev?.members.at(-1);
    const joins =
      prev !== undefined &&
      last !== undefined &&
      prev.nested.length === 0 &&
      nested.length === 0 &&
      h.vote === undefined &&
      last.vote === undefined &&
      h.voteNote !== undefined &&
      h.voteNote === last.voteNote;
    if (joins) prev.members.push(h);
    else raw.push({ members: [h], nested });
  }
  let single = 0;
  return raw.map((g) => {
    let color: Swatch;
    if (g.nested.length > 0) color = "inst";
    else if (g.members.length > 1) color = "holder";
    else color = SINGLE_COLORS[single++ % SINGLE_COLORS.length] ?? "inst2";
    return { color, ...g };
  });
}

/** A percentage at the data's precision (up to 2 decimals), never fewer than 1. */
export function formatPct(n: number): string {
  const r = Math.round(n * 100) / 100;
  return `${Number.isInteger(r) ? r.toFixed(1) : String(r)}%`;
}
