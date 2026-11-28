import { redirect } from "react-router";

/** /season was the Ballot view's first address (2026-11-27); keep old links working. */
export function loader() {
  return redirect("/ballot", 301);
}
