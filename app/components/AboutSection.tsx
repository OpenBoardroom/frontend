import type { ReactNode } from "react";
import {
  ABOUT,
  type Block,
  type Inline,
  type Section,
  type Source,
} from "~/content/about";
import { ExampleList } from "./ExampleList";

const CITATION = /^\[(\d+)\]$/;

export const sourceAnchor = (n: number) => `source-${n}`;

function InlinePart({ part }: { part: Inline }): ReactNode {
  if (typeof part === "string") return part;
  if ("href" in part) {
    // Citation markers jump to their entry in the sources list below.
    const citation = CITATION.exec(part.text);
    if (citation) {
      return (
        <sup className="cite">
          <a href={`#${sourceAnchor(Number(citation[1]))}`}>{part.text}</a>
        </sup>
      );
    }
    return <a href={part.href}>{part.text}</a>;
  }
  if ("strong" in part) return <strong>{part.text}</strong>;
  return <em>{part.text}</em>;
}

function Parts({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((part, i) => (
        // Parts are static content in fixed order, so the index is a stable key.
        // biome-ignore lint/suspicious/noArrayIndexKey: static, never reordered
        <InlinePart key={i} part={part} />
      ))}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.kind === "p")
    return (
      <p>
        <Parts parts={block.parts} />
      </p>
    );
  const items = block.items.map((item, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: static, never reordered
    <li key={i}>
      <Parts parts={item} />
    </li>
  ));
  return block.kind === "ol" ? <ol>{items}</ol> : <ul>{items}</ul>;
}

function SectionView({ section }: { section: Section }) {
  return (
    <section className="about" aria-labelledby={section.id}>
      <h2 id={section.id}>{section.heading}</h2>
      {section.blocks.map((block, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static, never reordered
        <BlockView key={i} block={block} />
      ))}
      {section.id === "how" ? <ExampleList /> : null}
    </section>
  );
}

/** Sources grouped by number; several entries can share one number. */
function groupSources(sources: Source[]): [number, Source[]][] {
  const groups = new Map<number, Source[]>();
  for (const s of sources) groups.set(s.n, [...(groups.get(s.n) ?? []), s]);
  return [...groups.entries()];
}

function Sources() {
  return (
    <section className="sources" aria-labelledby="sources">
      <h2 id="sources">Sources</h2>
      <ul>
        {groupSources(ABOUT.sources).map(([n, entries]) => (
          <li key={n} id={sourceAnchor(n)} className="source-group">
            <span className="source-n">[{n}]</span>
            <ul>
              {entries.map((s) => (
                <li key={s.text}>
                  <a href={s.href}>{s.text}</a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AboutSection() {
  return (
    <>
      {ABOUT.sections.map((section) => (
        <SectionView key={section.id} section={section} />
      ))}
      <Sources />
    </>
  );
}
