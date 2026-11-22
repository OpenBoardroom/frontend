import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [{ title: "OpenBoardroom" }];
}

export default function Home() {
  return (
    <main>
      <h1>OpenBoardroom</h1>
    </main>
  );
}
