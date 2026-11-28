import { PAGES } from "~/content/pages";

// Stub for Task 1; Task 3 adds the page's full meta, canonical link, and body.
export function meta() {
  return [{ title: `${PAGES.explore.title} · OpenBoardroom` }];
}

export default function Page() {
  return (
    <main className="page">
      <h1>{PAGES.explore.title}</h1>
    </main>
  );
}
