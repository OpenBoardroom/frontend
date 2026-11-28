import { PAGES } from "~/content/pages";

// Stub for Task 1; Task 3 adds the page's meta, canonical link, and body.
export default function Page() {
  return (
    <main className="page">
      <h1>{PAGES.season.title}</h1>
    </main>
  );
}
