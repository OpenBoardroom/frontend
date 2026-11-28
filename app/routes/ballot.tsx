import { InDevelopment } from "~/components/InDevelopment";
import { PAGES } from "~/content/pages";
import { canonicalUrl } from "~/lib/site";
import type { Route } from "./+types/ballot";

const PAGE = PAGES.ballot;

export function meta(_: Route.MetaArgs) {
  return [
    { title: `${PAGE.title} · OpenBoardroom` },
    { name: "description", content: PAGE.description },
    { property: "og:url", content: canonicalUrl("/ballot") },
  ];
}

export const links: Route.LinksFunction = () => [
  { rel: "canonical", href: canonicalUrl("/ballot") },
];

export default function Ballot() {
  return <InDevelopment page={PAGE} />;
}
