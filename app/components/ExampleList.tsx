import {
  EXAMPLE_NOTES,
  EXAMPLES,
  EXAMPLES_FINE_PRINT,
  type Example,
  type Holder,
} from "~/content/examples";
import { formatPct, type HolderGroup, holderGroups } from "~/lib/vote-bar";
import { PowerBar, Swatch, VoteBar } from "./VoteBar";

const count = (n: number) => n.toLocaleString("en-US");

// Same-tab links, like every other link on the page.
function SourceLink({ href, children }: { href: string; children: string }) {
  return <a href={href}>{children}</a>;
}

function Notes({ lines }: { lines: string[] }) {
  return (
    <div className="note">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function Chevron() {
  return (
    <span className="chev" aria-hidden="true">
      ›
    </span>
  );
}

function outcome(e: Example) {
  return e.result.passed ? "approved" : "not approved";
}

function resultPieces(e: Example) {
  return [
    { key: "for", color: "c-for", pct: e.result.pctFor },
    {
      key: "against",
      color: "c-against",
      pct: Math.round((100 - e.result.pctFor) * 10) / 10,
    },
  ];
}

function Facts({ e }: { e: Example }) {
  const rows: [string, string][] = [
    ["Type", e.type],
    ["Proposed by", e.proponent],
    ["Board recommends", e.boardRecommendation],
    ["Passes if", e.standard],
    ["What it asks", e.asks],
  ];
  return (
    <div className="row">
      <section className="panel" aria-label="The facts">
        <p className="layer">1 · The facts</p>
        <table>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <th scope="row">{k}</th>
                <td>{v}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Sources</th>
              <td>
                {e.sources.map((s, i) => (
                  <span key={s.href + s.label}>
                    {i > 0 ? " · " : null}
                    <SourceLink href={s.href}>{s.label}</SourceLink>
                  </span>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="result">
          <strong>Result: {outcome(e)}</strong> · {e.result.pctFor}% of votes
          cast in favor
        </p>
        <VoteBar pieces={resultPieces(e)} />
        <p className="legend">
          <span>For {count(e.result.for)}</span>
          <span>
            Against {count(e.result.against)} · Abstained{" "}
            {count(e.result.abstain)}
          </span>
        </p>
      </section>
      <Notes lines={e.notes.facts} />
    </div>
  );
}

function Arguments({ e }: { e: Example }) {
  return (
    <div className="row">
      <section className="panel alt" aria-label="The arguments">
        <p className="layer">2 · The arguments</p>
        {/* Two equal columns, same markup and weight for each side. */}
        <div className="sides">
          {[e.arguments.for, e.arguments.against].map((side) => (
            <div className="side" key={side.by}>
              <p className="side-by">{side.by} argues</p>
              {side.points.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
          ))}
        </div>
      </section>
      <Notes lines={EXAMPLE_NOTES.arguments} />
    </div>
  );
}

function VoteLine({ holder, e }: { holder: Holder; e: Example }) {
  const npx = e.sources.find((s) => s.label === `${holder.name} Form N-PX`);
  return (
    <>
      <span className="vote">{holder.vote}</span>
      {holder.voteNote ? ` (${holder.voteNote})` : null}
      {npx ? (
        <>
          {" · "}
          <SourceLink href={npx.href}>N-PX</SourceLink>
        </>
      ) : null}
    </>
  );
}

function HolderLegend({ g }: { g: HolderGroup }) {
  const [first] = g.members;
  if (first && g.nested.length > 0) {
    return (
      <li>
        <Swatch color={g.color} />
        {first.name} {formatPct(first.pct)}, including{" "}
        {g.nested.map((n, i) => (
          <span key={n.name}>
            {i > 0 ? ", " : null}
            <Swatch color="fund" />
            {n.name} {formatPct(n.pct)}
            {n.shares === undefined ? null : ` (${count(n.shares)} shares)`}
          </span>
        ))}
      </li>
    );
  }
  return (
    <li>
      <Swatch color={g.color} />
      {g.members.map((m) => `${m.name} ${formatPct(m.pct)}`).join(" · ")}
    </li>
  );
}

function HowTheyVoted({ e, groups }: { e: Example; groups: HolderGroup[] }) {
  // Families with a listed fund come first, so reported fund votes lead.
  const ordered = [
    ...groups.filter((g) => g.nested.length > 0),
    ...groups.filter((g) => g.nested.length === 0),
  ];
  return (
    <div className="funds">
      <p className="layer">How the largest holders voted</p>
      <ul>
        {ordered.flatMap((g) => {
          const [first] = g.members;
          const items = g.nested.map((n) => (
            <li key={n.name}>
              <Swatch color="fund" />
              <strong>{n.name}</strong>
              <br />
              {n.vote ? (
                <VoteLine holder={n} e={e} />
              ) : (
                <span className="muted">{n.voteNote}</span>
              )}
            </li>
          ));
          const name =
            first && g.nested.length > 0
              ? `Other funds in ${first.name}`
              : g.members.map((m) => m.name).join(", ");
          items.push(
            <li key={name}>
              <Swatch color={g.color} />
              {name}
              <br />
              {first?.vote ? (
                <VoteLine holder={first} e={e} />
              ) : (
                <span className="muted">{first?.voteNote}</span>
              )}
            </li>,
          );
          return items;
        })}
      </ul>
    </div>
  );
}

function Distribution({ e }: { e: Example }) {
  const groups = holderGroups(e.holders);
  return (
    <div className="row">
      <details className="sub" open>
        <summary>
          <span className="layer">Vote distribution</span>
          <Chevron />
        </summary>
        <div className="inner dist">
          <div className="power">
            <p>Share of total voting power on the record date</p>
            <PowerBar
              holders={e.holders}
              othersPct={e.othersPct}
              groups={groups}
            />
            <ul className="power-legend">
              {groups.map((g) => (
                <HolderLegend key={g.members[0]?.name} g={g} />
              ))}
              <li>
                <Swatch color="rest" />
                Everyone else {formatPct(e.othersPct)}
              </li>
            </ul>
            {e.distributionNote ? (
              <p className="dist-note">{e.distributionNote}</p>
            ) : null}
          </div>
          <HowTheyVoted e={e} groups={groups} />
        </div>
      </details>
      <Notes lines={e.notes.distribution} />
    </div>
  );
}

function Community({ e }: { e: Example }) {
  const { poll, comments } = e.community;
  return (
    <div className="row">
      <details className="sub dashed" open>
        <summary>
          <span className="layer">3 · Community</span>
          <Chevron />
        </summary>
        <div className="inner">
          <p className="example-label">Example content, not real users.</p>
          <p>Where readers stand</p>
          <VoteBar
            size="poll"
            pieces={[
              { key: "support", color: "c-for", pct: poll.support },
              { key: "oppose", color: "c-against", pct: poll.oppose },
              { key: "unsure", color: "c-unsure", pct: poll.unsure },
            ]}
          />
          <p className="legend">
            <span>Support {poll.support}%</span>
            <span>
              Oppose {poll.oppose}% · Unsure {poll.unsure}%
            </span>
          </p>
          <ul className="comments">
            {comments.map((c) => (
              <li className="comment" key={c.author}>
                <strong>{c.author}</strong> ·{" "}
                <span className="muted">{c.stance}</span>
                <br />
                {c.text}
              </li>
            ))}
          </ul>
        </div>
      </details>
      <Notes lines={EXAMPLE_NOTES.community} />
    </div>
  );
}

function ExampleItem({ e }: { e: Example }) {
  return (
    <details className="item" id={e.id}>
      <summary>
        <div className="main">
          <p className="meta">
            {e.company} · {e.meeting} · Proposal {e.number}
          </p>
          <h3>{e.title}</h3>
          <p className="sum">{e.question}</p>
        </div>
        <div className="mini">
          {e.result.passed ? "Approved" : "Not approved"} · {e.result.pctFor}%
          for
          <VoteBar size="small" pieces={resultPieces(e)} />
        </div>
        <Chevron />
      </summary>
      <div className="body">
        <Facts e={e} />
        <Arguments e={e} />
        <Distribution e={e} />
        <Community e={e} />
      </div>
    </details>
  );
}

export function ExampleList() {
  return (
    <div className="ob">
      {EXAMPLES.map((e) => (
        <ExampleItem key={e.id} e={e} />
      ))}
      <p className="fine">{EXAMPLES_FINE_PRINT.join(" ")}</p>
    </div>
  );
}
