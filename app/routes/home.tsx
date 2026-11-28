import { useEffect, useRef } from "react";
import { useRevalidator } from "react-router";
import { AboutSection } from "~/components/AboutSection";
import { StatusPanel } from "~/components/StatusPanel";
import { ABOUT } from "~/content/about";
import { cloudflareContext } from "~/server/cloudflare-context";
import { fetchRecentCommits } from "~/server/commits";
import type { Route } from "./+types/home";

const REVALIDATE_MS = 300_000;
const OG_IMAGE = "https://openboardroom.org/og.png";

export function meta(_: Route.MetaArgs) {
  return [
    { title: ABOUT.title },
    { name: "description", content: ABOUT.description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://openboardroom.org/" },
    { property: "og:title", content: ABOUT.title },
    { property: "og:description", content: ABOUT.description },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

// The Worker is also served on workers.dev; point search engines at the real host.
export const links: Route.LinksFunction = () => [
  { rel: "canonical", href: "https://openboardroom.org/" },
];

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const feed = await fetchRecentCommits({
    // Wrapped: workerd rejects fetch called with a `this` other than globalThis.
    fetch: (input, init) => fetch(input, init),
    ...(env.GITHUB_TOKEN ? { token: env.GITHUB_TOKEN } : {}),
    ...(env.GITHUB_API_BASE ? { apiBase: env.GITHUB_API_BASE } : {}),
  });
  return { feed };
}

/** Refreshes the loader (the commit feed) every 5 minutes while the tab is visible. */
function useVisibleRevalidation() {
  const { revalidate } = useRevalidator();
  const revalidateRef = useRef(revalidate);
  // Keep the latest revalidate without restarting the interval.
  useEffect(() => {
    revalidateRef.current = revalidate;
  });
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void revalidateRef.current();
    }, REVALIDATE_MS);
    return () => clearInterval(id);
  }, []);
}

export default function Home({ loaderData }: Route.ComponentProps) {
  useVisibleRevalidation();
  return (
    <div className="page">
      <header className="masthead">
        <h1>{ABOUT.title}</h1>
      </header>
      <div className="layout">
        <main>
          <AboutSection />
        </main>
        <StatusPanel feed={loaderData.feed} />
      </div>
    </div>
  );
}
