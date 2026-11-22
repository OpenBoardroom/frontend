import type { Holder } from "~/content/examples";
import {
  barSegments,
  EVERYONE_ELSE,
  formatPct,
  type HolderGroup,
  type Swatch as SwatchColor,
} from "~/lib/vote-bar";

export type BarPiece = {
  key: string;
  /** A palette class: c-for, c-against, c-unsure, c-holder, c-fund, c-inst… */
  color: string;
  pct: number;
  title?: string;
  opacity?: number;
  /** Drawn as a continuation of the previous piece (no divider). */
  joined?: boolean;
};

/**
 * A horizontal stacked bar. Purely visual: every bar on the page sits next to
 * a text legend carrying the same numbers, so it is hidden from screen readers.
 */
export function VoteBar({
  pieces,
  size,
}: {
  pieces: BarPiece[];
  size?: "small" | "poll";
}) {
  return (
    <div className={size ? `bar bar-${size}` : "bar"} aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.key}
          className={p.joined ? `${p.color} joined` : p.color}
          style={{
            width: `${p.pct}%`,
            ...(p.opacity === undefined ? {} : { opacity: p.opacity }),
          }}
          title={p.title}
        />
      ))}
    </div>
  );
}

const MEMBER_OPACITY = [1, 0.75, 0.5];

export function Swatch({ color }: { color: SwatchColor }) {
  return <span className={`swatch c-${color}`} aria-hidden="true" />;
}

/** The voting-power bar: each holder, funds inside their family, then everyone else. */
export function PowerBar({
  holders,
  othersPct,
  groups,
}: {
  holders: Holder[];
  othersPct: number;
  groups: HolderGroup[];
}) {
  const style = new Map<string, { color: SwatchColor; opacity?: number }>();
  for (const g of groups) {
    g.members.forEach((m, i) => {
      const opacity = MEMBER_OPACITY[i] ?? 0.5;
      style.set(m.name, {
        color: g.color,
        ...(opacity < 1 ? { opacity } : {}),
      });
    });
  }
  const pieces: BarPiece[] = barSegments(holders, othersPct).flatMap((s) => {
    if (s.label === EVERYONE_ELSE) {
      return [
        {
          key: s.label,
          color: "c-rest",
          pct: s.pct,
          title: `${s.label} ${formatPct(s.pct)}`,
        },
      ];
    }
    const st = style.get(s.label) ?? { color: "inst2" };
    const inner = s.nested.reduce((sum, n) => sum + n.pct, 0);
    const nested: BarPiece[] = s.nested.map((n) => ({
      key: n.label,
      color: "c-fund",
      pct: n.pct,
      title: `${n.label} ${formatPct(n.pct)}`,
    }));
    const rest = s.pct - inner;
    const label = s.nested.length > 0 ? `Rest of ${s.label}` : s.label;
    return [
      ...nested,
      {
        key: s.label,
        color: `c-${st.color}`,
        pct: rest,
        title: `${label} ${formatPct(rest)}`,
        ...(st.opacity === undefined ? {} : { opacity: st.opacity }),
        joined: s.nested.length > 0,
      },
    ];
  });
  return <VoteBar pieces={pieces} />;
}
