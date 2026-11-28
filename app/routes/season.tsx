import { InDevelopment } from "~/components/InDevelopment";
import { PAGES } from "~/content/pages";
import { canonicalUrl } from "~/lib/site";
import type { Route } from "./+types/season";

const PAGE = PAGES.season;

export function meta(_: Route.MetaArgs) {
  return [
    { title: `${PAGE.title} · OpenBoardroom` },
    { name: "description", content: PAGE.description },
    { property: "og:url", content: canonicalUrl("/season") },
  ];
}

export const links: Route.LinksFunction = () => [
  { rel: "canonical", href: canonicalUrl("/season") },
];

export default function Season() {
  return <InDevelopment page={PAGE} />;
}
