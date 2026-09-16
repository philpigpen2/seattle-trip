"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import styles from "./AppLibrary.module.css";

const CATEGORIES = ["Everyday", "Create & play", "Projects"] as const;
type Category = (typeof CATEGORIES)[number];
type IconName = "leaf" | "wallet" | "home" | "dice" | "alien" | "envelope" | "party" | "book" | "map" | "milestone";

export type AppItem = {
  href: string;
  title: string;
  description: string;
  category: Category;
  icon: IconName;
  tone: "green" | "blue" | "sand" | "gold" | "violet" | "rose";
  external?: boolean;
  unavailable?: boolean;
};

function AppIcon({ name }: { name: IconName }) {
  const artwork: Record<IconName, ReactNode> = {
    leaf: <><path d="M19 4c-8-1-14 3-14 9a6 6 0 0 0 6 6c6 0 9-7 8-15Z" /><path d="m5 21 9-11M9 17v-6m0 6h6" /></>,
    wallet: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h4" /><path d="M17 15h.01" strokeWidth="3" /></>,
    home: <><path d="m3 10 9-7 9 7M5 9v11h14V9" /><path d="M9 20v-7h6v7" /></>,
    dice: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" strokeWidth="3" /></>,
    alien: <><path d="M7 5 5 2m12 3 2-3M4 10l3-5h10l3 5v7l-5 4H9l-5-4Z" /><path d="m7 11 3 2m7-2-3 2M9 17h6" /></>,
    envelope: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="m3 7 9 7 9-7M12 2v1m6 0-1 1M6 3l1 1" /></>,
    party: <><path d="m4 20 4-13 9 9-13 4ZM7 12l5 5M14 3v3m5-1-2 3m4 4h-3" /><path d="M11 2h.01M21 8h.01" strokeWidth="3" /></>,
    book: <><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14" /><path d="M6 9h3m-3 4h3m6-4h3m-3 4h3" /></>,
    map: <><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16" /><path d="m5 12 2-2m4-1 2 2m4 2 2-2" /></>,
    milestone: <><path d="M5 20V4m0 1h11l4 4-4 4H5M3 20h4" /><path d="m10 9 2 2 3-3" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{artwork[name]}</svg>;
}

function Arrow({ external = false }: { external?: boolean }) {
  return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{external ? <path d="M5 15 15 5M5 5h10v10" /> : <path d="M4 10h12m-5-5 5 5-5 5" />}</svg>;
}

function Card({ item }: { item: AppItem }) {
  const content = <>
    <span className={styles.appIcon} data-tone={item.tone}><AppIcon name={item.icon} /></span>
    <h3>{item.title}</h3>
    <p>{item.description}</p>
    <span className={styles.cardAction}>{item.unavailable ? <span className={styles.unavailableLabel}>Unavailable</span> : <>Open {item.category === "Projects" ? "project" : "app"}<Arrow external={item.href.startsWith("https://")} /></>}</span>
  </>;

  if (item.unavailable) return <div className={`${styles.card} ${styles.unavailable}`}>{content}</div>;

  return item.external
    ? <a href={item.href} className={styles.card}>{content}</a>
    : <Link href={item.href} className={styles.card}>{content}</Link>;
}

export default function AppLibrary({ items, account }: { items: AppItem[]; account?: ReactNode }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All apps">("All apps");
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = items.filter((item) => {
    const matchesCategory = category === "All apps" || item.category === category;
    const searchable = `${item.title} ${item.description} ${item.category}`.toLowerCase();
    return matchesCategory && terms.every((term) => searchable.includes(term));
  });
  const isFiltered = query.trim() !== "" || category !== "All apps";
  const clearFilters = () => {
    setQuery("");
    setCategory("All apps");
    searchRef.current?.focus();
  };

  return (
    <div className={styles.library}>
      <a href="#app-library" className={styles.skipLink}>Skip to apps</a>
      <header className={styles.masthead}>
        <div className={styles.mastheadInner}>
          <Link href="/" className={styles.brand} aria-label="Phil Laney, app home">
            <span className={styles.brandMark} aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm12 0h6v6h-6zM10 10h4v4h-4z" /></svg></span>
            <span>PHIL LANEY</span>
          </Link>
          <span className={styles.homeLabel}>App home</span>
          <nav className={styles.navigation} aria-label="Account and arcade">
            <Link href="/arcade" className={styles.arcadeLink}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 7h10c2 0 3 2 4 6s0 6-2 5l-4-3H9l-4 3c-2 1-3-1-2-5s2-6 4-6Z" /><path d="M7 10v4m-2-2h4m7-1h.01m2 2h.01" /></svg><span>Play arcade</span></Link>
            {account && <div className={styles.account}>{account}</div>}
          </nav>
        </div>
      </header>

      <main id="app-library" tabIndex={-1} className={styles.main}>
        <div className={styles.welcome}>
          <h1>Your apps.</h1>
          <p className={styles.intro}>A shortcut to the things you use and make.</p>
        </div>

        <div className={styles.tools}>
          <div className={styles.search} role="search">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>
            <label htmlFor="app-search" className={styles.srOnly}>Search apps</label>
            <input id="app-search" ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an app…" autoComplete="off" />
            {query && <button type="button" onClick={() => { setQuery(""); searchRef.current?.focus(); }} aria-label="Clear search"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="m6 6 8 8m0-8-8 8" /></svg></button>}
          </div>
          <div className={styles.filters} role="group" aria-label="Filter apps by category">
            {(["All apps", ...CATEGORIES] as const).map((label) => <button key={label} type="button" aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}
          </div>
        </div>

        <div className={styles.resultsBar}>
          <p role="status">{isFiltered ? `${filtered.length} of ${items.length} apps` : `${items.length} apps`}</p>
          {isFiltered && <button type="button" onClick={clearFilters}>Clear filters</button>}
        </div>

        {filtered.length > 0 ? <div className={styles.sections}>
          {CATEGORIES.map((group) => {
            const apps = filtered.filter((item) => item.category === group);
            if (!apps.length) return null;
            const id = `category-${CATEGORIES.indexOf(group)}`;
            return <section key={group} aria-labelledby={id} className={styles.section}>
              <div className={styles.sectionHeading}><h2 id={id}>{group}</h2><span>{apps.length}</span><div aria-hidden="true" /></div>
              <div className={styles.grid}>{apps.map((item) => <Card key={item.href} item={item} />)}</div>
            </section>;
          })}
        </div> : <div className={styles.empty}>
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="13" cy="13" r="8" /><path d="m19 19 8 8M10 13h6" /></svg>
          <h2>No apps found</h2>
          <p>{query.trim() ? `Nothing matches “${query.trim()}”${category !== "All apps" ? ` in ${category}` : ""}. Try a different search.` : "There are no apps in this category yet."}</p>
          <button type="button" onClick={clearFilters}>Show all apps <Arrow /></button>
        </div>}

        <footer className={styles.footer}><span>Personal apps &amp; projects</span><Link href="/arcade">A quick game? <Arrow /></Link></footer>
      </main>
    </div>
  );
}
