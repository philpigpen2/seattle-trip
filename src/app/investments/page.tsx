import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investments Textbook — In Development | Blended Teaching",
  description:
    "Working plan for Blended Teaching's new Investments textbook: chapter outline, content reuse, and the instructor filming shortlist.",
};

type Reuse = "reuse" | "partial" | "new";
type Chapter = { n: number; title: string; reuse: Reuse; note?: string };
type Part = { name: string; instructor?: string; chapters: Chapter[] };

type Tier = "shortlist" | "halo" | "pool";
type Candidate = {
  name: string;
  institution: string;
  role?: string;
  signal?: string;
  hIndex?: number;
  citations?: number;
  tier: Tier;
  note?: string;
};
type Domain = { name: string; instructor: string; blurb: string; candidates: Candidate[] };

const PARTS: Part[] = [
  {
    name: "Foundations",
    chapters: [
      { n: 1, title: "The Investment Environment", reuse: "new" },
      { n: 2, title: "Asset Classes & Financial Instruments", reuse: "reuse", note: "FM: Stock Markets; Bond Characteristics" },
      { n: 3, title: "How Securities Are Traded", reuse: "reuse", note: "FM: Stock Markets" },
      { n: 4, title: "Investment Companies, Mutual Funds & ETFs", reuse: "new" },
      { n: 5, title: "Return, Risk & the Time Value of Money", reuse: "reuse", note: "FM: Time Value of Money; DCF & Annuities" },
    ],
  },
  {
    name: "Portfolio Theory & Asset Pricing",
    instructor: "Instructor 1",
    chapters: [
      { n: 6, title: "Risk, Return & the Historical Record", reuse: "reuse", note: "FM: Risk and Return" },
      { n: 7, title: "Diversification & Portfolio Risk", reuse: "reuse", note: "FM: Diversification" },
      { n: 8, title: "Optimal Risky Portfolios & the Efficient Frontier", reuse: "new" },
      { n: 9, title: "The Capital Asset Pricing Model (CAPM)", reuse: "partial", note: "FM: Beta/SML/CAPM core; film extensions" },
      { n: 10, title: "Arbitrage Pricing Theory & Multifactor Models", reuse: "new" },
      { n: 11, title: "The Efficient Market Hypothesis", reuse: "new" },
      { n: 12, title: "Behavioral Finance & Market Anomalies", reuse: "new" },
    ],
  },
  {
    name: "Fixed Income",
    instructor: "Instructor 2",
    chapters: [
      { n: 13, title: "Bond Prices & Yields", reuse: "reuse", note: "FM: Bond Fundamentals; Bond Characteristics" },
      { n: 14, title: "The Term Structure of Interest Rates", reuse: "new" },
      { n: 15, title: "Managing Bond Portfolios: Duration & Immunization", reuse: "new" },
    ],
  },
  {
    name: "Equity Valuation & Security Analysis",
    instructor: "Instructor 3",
    chapters: [
      { n: 16, title: "Macroeconomic & Industry Analysis", reuse: "new" },
      { n: 17, title: "Equity Valuation Models", reuse: "reuse", note: "FM: Valuing Stocks" },
      { n: 18, title: "Financial Statement Analysis for Investors", reuse: "reuse", note: "FM: Common Sizing; Ratios; Statements" },
    ],
  },
  {
    name: "Derivatives",
    instructor: "Instructor 3",
    chapters: [
      { n: 19, title: "Options Markets & Strategies", reuse: "new" },
      { n: 20, title: "Option Valuation: Binomial & Black-Scholes", reuse: "new" },
      { n: 21, title: "Futures, Forwards & Swaps", reuse: "new" },
      { n: 22, title: "Risk Management with Derivatives", reuse: "new" },
    ],
  },
  {
    name: "Applied Portfolio Management",
    chapters: [
      { n: 23, title: "Portfolio Performance Evaluation", reuse: "new" },
      { n: 24, title: "Active Management, Hedge Funds & Investment Policy", reuse: "new" },
    ],
  },
];

const DOMAINS: Domain[] = [
  {
    name: "Portfolio Theory & Asset Pricing",
    instructor: "Instructor 1",
    blurb: "The conceptual core: risk and return, diversification, CAPM, factor models, market efficiency, behavioral finance.",
    candidates: [
      { name: "Sheridan Titman", institution: "UT Austin (McCombs)", signal: "Momentum co-author; prolific PhD advisor", hIndex: 97, citations: 108929, tier: "shortlist" },
      { name: "John Cochrane", institution: "Hoover / Stanford", signal: "Author of Asset Pricing (standard PhD text)", tier: "shortlist", note: "~80k citations (est.)" },
      { name: "Campbell R. Harvey", institution: "Duke (Fuqua)", role: "Advisory Council, Financial Analysts Journal", signal: "Past AFA President; strong communicator", hIndex: 55, citations: 108069, tier: "shortlist" },
      { name: "Luboš Pástor", institution: "Chicago Booth", signal: "Portfolio choice, predictability, ESG", hIndex: 37, citations: 33225, tier: "shortlist" },
      { name: "Lasse Heje Pedersen", institution: "NYU Stern", signal: "Author of Efficiently Inefficient; media-friendly", tier: "shortlist", note: "~70k citations (est.)" },
      { name: "Jeremy Siegel", institution: "Wharton (emeritus)", signal: "Stocks for the Long Run; legendary teacher", tier: "shortlist" },
      { name: "Tobias Moskowitz", institution: "Yale SOM", signal: "Value/momentum; engaging communicator", tier: "pool" },
      { name: "Narasimhan Jegadeesh", institution: "Emory (Goizueta)", signal: "Co-discoverer of momentum", tier: "pool" },
      { name: "Robert Stambaugh", institution: "Wharton", signal: "Past AFA President; anomalies/mispricing", tier: "pool" },
      { name: "William Goetzmann", institution: "Yale SOM", role: "Executive Editor, Financial Analysts Journal", signal: "Co-author, Modern Portfolio Theory & Investment Analysis", tier: "pool" },
      { name: "Edwin Elton", institution: "NYU Stern", signal: "Lead author, Modern Portfolio Theory & Investment Analysis", tier: "pool", note: "Direct competitor-text author" },
      { name: "René Stulz", institution: "Ohio State (Fisher)", role: "Long-time JF editor", hIndex: 75, tier: "pool" },
      { name: "John Y. Campbell", institution: "Harvard", role: "Advisory Editor, JFE", signal: "Wrote leading PhD asset-pricing text", hIndex: 72, tier: "halo" },
      { name: "Eugene Fama", institution: "Chicago Booth", signal: "Nobel 2013; most influential asset-pricing lineage", hIndex: 114, citations: 423723, tier: "halo", note: "Credibility anchor; likely too senior to film" },
      { name: "Kenneth French", institution: "Dartmouth (Tuck)", signal: "Fama-French co-author", tier: "halo" },
      { name: "Andrei Shleifer", institution: "Harvard", signal: "Behavioral finance; enormous PhD lineage", hIndex: 108, tier: "halo" },
      { name: "Burton Malkiel", institution: "Princeton (emeritus)", signal: "A Random Walk Down Wall Street", tier: "halo" },
    ],
  },
  {
    name: "Fixed Income",
    instructor: "Instructor 2",
    blurb: "Bond pricing, the term structure, duration, and bond-portfolio management.",
    candidates: [
      { name: "Frank J. Fabozzi", institution: "Johns Hopkins (Carey)", role: "Editor-in-Chief, Journal of Portfolio Management", signal: "The fixed-income textbook franchise", tier: "shortlist" },
      { name: "Pietro Veronesi", institution: "Chicago Booth", signal: "Author of Fixed Income Securities (Wiley); strong teacher", tier: "shortlist" },
      { name: "Robert Jarrow", institution: "Cornell (Johnson)", role: "Editorial Board, Journal of Derivatives", signal: "Co-creator HJM & Jarrow-Turnbull models", citations: 34160, tier: "shortlist", note: "Also a derivatives pillar" },
      { name: "Darrell Duffie", institution: "Stanford GSB", signal: "Dominant FI/credit theorist; Dynamic Asset Pricing Theory", hIndex: 98, citations: 66219, tier: "shortlist" },
      { name: "Francis Longstaff", institution: "UCLA (Anderson)", role: "Associate Editor, JFQA", signal: "Term structure, liquidity, option pricing", tier: "pool" },
      { name: "George Pennacchi", institution: "Illinois", role: "Managing Editor, JFQA", signal: "Banking, term structure", tier: "pool" },
      { name: "Frederic Mishkin", institution: "Columbia", signal: "Author of Money, Banking & Financial Markets", hIndex: 61, tier: "pool" },
    ],
  },
  {
    name: "Derivatives & Equity Valuation",
    instructor: "Instructor 3",
    blurb: "Options, futures, swaps, valuation, and risk management — our biggest fresh-filming need.",
    candidates: [
      { name: "Robert E. Whaley", institution: "Vanderbilt (Owen)", signal: "Created the VIX; Derivatives textbook author", tier: "shortlist" },
      { name: "Stephen Figlewski", institution: "NYU Stern (emeritus)", role: "Founding Editor, Journal of Derivatives", signal: "Taught futures/options 43 years; master teacher", tier: "shortlist" },
      { name: "Don M. Chance", institution: "LSU", signal: "Prolific derivatives-textbook author; pedagogy-focused", tier: "shortlist" },
      { name: "Kris Jacobs", institution: "U. Houston (Bauer)", signal: "Option pricing, volatility; active PhD advisor", tier: "pool" },
      { name: "Liuren Wu", institution: "Baruch (Zicklin)", signal: "Option pricing, term structure", tier: "pool" },
      { name: "Steven Heston", institution: "U. Maryland (Smith)", signal: "Heston stochastic-volatility model", tier: "pool" },
      { name: "Robert C. Merton", institution: "MIT Sloan", signal: "Nobel 1997; Black-Scholes-Merton", tier: "halo", note: "Pedigree anchor" },
      { name: "Robert Engle", institution: "NYU Stern", role: "Editorial Board, Journal of Portfolio Management", signal: "Nobel 2003; ARCH/GARCH", hIndex: 67, tier: "halo" },
    ],
  },
];

const REUSE_STYLE: Record<Reuse, { label: string; cls: string }> = {
  reuse: { label: "Reuse", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  partial: { label: "Partial", cls: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  new: { label: "Film new", cls: "bg-slate-100 text-slate-500 ring-slate-500/20" },
};

const TIER_STYLE: Record<Tier, { label: string; cls: string }> = {
  shortlist: { label: "Shortlist", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  halo: { label: "Halo", cls: "bg-violet-50 text-violet-700 ring-violet-600/20" },
  pool: { label: "Pool", cls: "bg-slate-100 text-slate-600 ring-slate-500/20" },
};

function Badge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  );
}

export default function InvestmentsPage() {
  const total = PARTS.reduce((a, p) => a + p.chapters.length, 0);
  const reuseReady = PARTS.flatMap((p) => p.chapters).filter((c) => c.reuse === "reuse").length;
  const partial = PARTS.flatMap((p) => p.chapters).filter((c) => c.reuse === "partial").length;
  const totalCandidates = DOMAINS.reduce((a, d) => a + d.candidates.length, 0);
  const shortlistCount = DOMAINS.flatMap((d) => d.candidates).filter((c) => c.tier === "shortlist").length;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <header className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Blended Teaching · In development</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Investments</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
            A modern, video-first Investments textbook for senior-undergraduate and MBA courses, built as a
            competitor to Bodie, Kane &amp; Marcus. This page is our working plan: the chapter outline, what
            content we can reuse to ship an early version, and the shortlist of instructors we want to film it.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { k: "Chapters", v: total },
              { k: "Reuse-ready now", v: `${reuseReady + partial}` },
              { k: "Instructors to film", v: 3 },
              { k: "Candidates identified", v: totalCandidates },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <dd className="text-2xl font-semibold">{s.v}</dd>
                <dt className="mt-0.5 text-xs text-slate-500">{s.k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-16 px-6 py-16">
        {/* Chapter outline */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Chapter outline</h2>
              <p className="mt-1 text-sm text-slate-600">
                24 chapters across six parts. {reuseReady} map directly to content we&apos;ve already filmed for our
                Financial Management course, plus {partial} partial — enough to stand up an early edition while we
                film the rest fresh.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge {...REUSE_STYLE.reuse} />
              <Badge {...REUSE_STYLE.partial} />
              <Badge {...REUSE_STYLE.new} />
            </div>
          </div>

          <div className="mt-8 space-y-8">
            {PARTS.map((part) => (
              <div key={part.name}>
                <div className="mb-3 flex items-baseline gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{part.name}</h3>
                  {part.instructor && (
                    <span className="text-xs text-slate-400">{part.instructor}</span>
                  )}
                </div>
                <ul className="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {part.chapters.map((c) => {
                    const s = REUSE_STYLE[c.reuse];
                    return (
                      <li key={c.n} className="flex items-center gap-4 px-4 py-3">
                        <span className="w-6 shrink-0 text-sm tabular-nums text-slate-400">{c.n}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900">{c.title}</p>
                          {c.note && <p className="mt-0.5 text-xs text-slate-500">{c.note}</p>}
                        </div>
                        <Badge {...s} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Filming candidates */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Instructor filming shortlist</h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            We&apos;re recruiting three instructors, one per domain, chosen for influence with other faculty:
            editorial roles at the leading finance journals, high citation counts, and prolific PhD-advising
            networks that become natural adopters. {shortlistCount} primary targets, with senior &ldquo;halo&rdquo;
            names that would anchor credibility.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge {...TIER_STYLE.shortlist} />
            <Badge {...TIER_STYLE.halo} />
            <Badge {...TIER_STYLE.pool} />
          </div>

          <div className="mt-8 space-y-10">
            {DOMAINS.map((d) => (
              <div key={d.name}>
                <div className="mb-1 flex items-baseline gap-3">
                  <h3 className="text-lg font-semibold">{d.name}</h3>
                  <span className="text-xs font-medium text-emerald-700">{d.instructor}</span>
                </div>
                <p className="mb-4 text-sm text-slate-500">{d.blurb}</p>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                        <th className="px-4 py-2.5 font-medium">Name</th>
                        <th className="px-4 py-2.5 font-medium">Institution</th>
                        <th className="px-4 py-2.5 font-medium">Role / Signal</th>
                        <th className="px-4 py-2.5 text-right font-medium">H-index</th>
                        <th className="px-4 py-2.5 text-right font-medium">Citations</th>
                        <th className="px-4 py-2.5 font-medium">Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...d.candidates].sort((a, b) => {
                        const rank = { shortlist: 0, halo: 1, pool: 2 } as const;
                        return rank[a.tier] - rank[b.tier];
                      }).map((c) => (
                        <tr key={c.name} className="align-top hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{c.name}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">{c.institution}</td>
                          <td className="max-w-xs px-4 py-3 text-slate-600">
                            {c.role && <span className="block text-slate-800">{c.role}</span>}
                            {c.signal && <span className="block text-xs text-slate-500">{c.signal}</span>}
                            {c.note && <span className="mt-0.5 block text-xs italic text-slate-400">{c.note}</span>}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-600">{c.hIndex ?? "—"}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-600">{c.citations ? c.citations.toLocaleString() : "—"}</td>
                          <td className="px-4 py-3"><Badge {...TIER_STYLE[c.tier]} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Verified h-index / citation figures from Google Scholar and RePEc where shown; some figures are
            estimates and noted as such. Working document — names and tiers will evolve.
          </p>
        </section>
      </div>

      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-6 py-8 text-xs text-slate-400">
          Blended Teaching · Investments textbook working plan
        </div>
      </footer>
    </main>
  );
}
