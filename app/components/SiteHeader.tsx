import { Link, NavLink } from "react-router";
import { Logo } from "~/components/Logo";
import { NAV_LINKS, SEARCH_LABEL } from "~/content/pages";

function Links() {
  return (
    <ul>
      {NAV_LINKS.map((link) => (
        <li key={link.to}>
          {/* NavLink sets aria-current="page" on the current page's link. */}
          <NavLink to={link.to} end={link.to === "/"}>
            {link.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/**
 * The bar on every page: logo, navigation, and search. It needs no
 * JavaScript: on a phone the links sit in a native <details> menu, and search
 * is a plain GET form to /explore. Only one of the two link lists is shown at
 * a time, so assistive technology sees one set of links.
 */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-brand">
          <Logo size={28} />
          <span>OpenBoardroom</span>
        </Link>
        <nav aria-label="Main" className="site-nav">
          <div className="nav-inline">
            <Links />
          </div>
          <details className="nav-menu">
            <summary>Menu</summary>
            <Links />
          </details>
        </nav>
        <search className="site-search">
          <form method="get" action="/explore">
            <label className="visually-hidden" htmlFor="site-search">
              {SEARCH_LABEL}
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search…"
              maxLength={200}
            />
          </form>
        </search>
      </div>
    </header>
  );
}
