import { MILESTONES, type Milestone } from "~/content/milestones";
import { type CommitFeed, firstLine, relativeTime } from "~/server/commits";

const STATUS: Record<Milestone["status"], { mark: string; label: string }> = {
  done: { mark: "✓", label: "Done" },
  "in-progress": { mark: "●", label: "In progress" },
  next: { mark: "○", label: "Next" },
  later: { mark: "·", label: "Later" },
};

function RecentWork({ feed }: { feed: CommitFeed }) {
  if (feed.status === "unavailable") {
    return (
      <p className="muted">
        <a href="https://github.com/OpenBoardroom">
          Recent work is unavailable right now
        </a>
      </p>
    );
  }
  const now = new Date();
  return (
    <ul className="commits">
      {feed.commits.map((c) => (
        <li key={c.url}>
          <span className="repo">{c.repo}</span>{" "}
          {/* Commit text is untrusted: rendered as JSX text only. */}
          <a href={c.url}>{firstLine(c.message)}</a>{" "}
          {/* Server and browser clocks differ by the time it takes to load. */}
          <time className="muted" dateTime={c.date} suppressHydrationWarning>
            {relativeTime(c.date, now)}
          </time>
        </li>
      ))}
    </ul>
  );
}

export function StatusPanel({ feed }: { feed: CommitFeed }) {
  return (
    <aside className="status" aria-labelledby="status-heading">
      <h2 id="status-heading">Status</h2>
      <ol className="milestones">
        {MILESTONES.map((m) => (
          <li key={m.title} className={`ms ms-${m.status}`}>
            <span className="ms-mark" aria-hidden="true">
              {STATUS[m.status].mark}
            </span>
            <div>
              <p className="ms-title">{m.title}</p>
              {m.detail ? <p className="ms-detail">{m.detail}</p> : null}
              <p className="ms-status">
                {STATUS[m.status].label}
                {m.date ? ` · ${m.date}` : null}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <h3>Recent work</h3>
      <RecentWork feed={feed} />
    </aside>
  );
}
