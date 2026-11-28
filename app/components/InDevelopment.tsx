import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Page } from "~/content/pages";

/** A data view still in development: what it will show, and a way back. */
export function InDevelopment({
  page,
  children,
}: {
  page: Page;
  children?: ReactNode;
}) {
  return (
    <main className="page in-development">
      <h1>{page.title}</h1>
      <p>{page.description}</p>
      {children}
      <p>
        <Link to="/">Read about OpenBoardroom</Link>
      </p>
    </main>
  );
}
