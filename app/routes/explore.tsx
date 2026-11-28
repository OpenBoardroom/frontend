import { InDevelopment } from "~/components/InDevelopment";
import { PAGES } from "~/content/pages";
import { canonicalUrl, searchQuery } from "~/lib/site";
import type { Route } from "./+types/explore";

const PAGE = PAGES.explore;

export function meta(_: Route.MetaArgs) {
  return [
    { title: `${PAGE.title} · OpenBoardroom` },
    { name: "description", content: PAGE.description },
    { property: "og:url", content: canonicalUrl("/explore") },
  ];
}

export const links: Route.LinksFunction = () => [
  { rel: "canonical", href: canonicalUrl("/explore") },
];

export function loader({ request }: Route.LoaderArgs) {
  return { query: searchQuery(new URL(request.url)) };
}

export default function Explore({ loaderData }: Route.ComponentProps) {
  return (
    <InDevelopment page={PAGE}>
      {/* The query is untrusted: rendered as JSX text only. */}
      {loaderData.query && (
        <p className="muted">
          Search for “<bdi>{loaderData.query}</bdi>” will work once Explore is
          ready.
        </p>
      )}
    </InDevelopment>
  );
}
