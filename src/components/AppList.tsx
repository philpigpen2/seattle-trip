import Link from "next/link";

type Item = {
  href: string;
  title: string;
  blurb: string;
  external?: boolean;
  feature?: boolean;
};

const ITEMS: Item[] = [
  { href: "/dryht", title: "Dryht rollout", blurb: "Live release gates, current blockers & every stage", feature: true },
  { href: "https://howto.philiplaney.com", title: "How To 🎲", blurb: "Game explainer videos — plan, bets & experiments", external: true },
  { href: "https://gragras.philiplaney.com", title: "Gragras 👾", blurb: "Charlotte's alien-pet game & evening stories", external: true },
  { href: "https://sinvitation.philiplaney.com", title: "Invitation ✉️", blurb: "One Night, Three Children", external: true },
  { href: "https://flourish.philiplaney.com", title: "Flourish 🌱", blurb: "Private health & wellness — records, tracking & AI", external: true },
  { href: "https://invites.philiplaney.com", title: "Party Invites 🎉", blurb: "Magical party invites & RSVPs", external: true },
  { href: "https://everbound.philiplaney.com", title: "Everbound 📖", blurb: "Magical personalised storybooks", external: true },
  { href: "https://cards.philiplaney.com", title: "Card Coach 💳", blurb: "Best card to use & which to get next", external: true },
  { href: "/trip", title: "Trip Expenses Tracker", blurb: "Seattle Trip · May–Jun 2026" },
  { href: "/IQ", title: "IQ UK Homes 🏡", blurb: "London property portfolio", external: true },
];

function Card({ item }: { item: Item }) {
  const inner = (
    <>
      <div>
        <div className={`font-semibold ${item.feature ? "text-white" : "text-gray-900"}`}>{item.title}</div>
        <div className={`text-sm ${item.feature ? "text-gray-400" : "text-gray-500"}`}>{item.blurb}</div>
      </div>
      <span className={`text-lg ${item.feature ? "text-amber-300 group-hover:text-amber-200" : "text-gray-400 group-hover:text-gray-600"}`}>
        →
      </span>
    </>
  );
  const cls = `flex items-center justify-between w-full rounded-xl px-5 py-4 transition-colors group border ${
    item.feature
      ? "bg-gray-900 hover:bg-gray-800 border-gray-900"
      : "bg-gray-50 hover:bg-gray-100 border-gray-200"
  }`;

  return item.external ? (
    <a href={item.href} className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={item.href} className={cls}>
      {inner}
    </Link>
  );
}

export default function AppList() {
  return (
    <div className="space-y-3">
      {ITEMS.map((item) => (
        <Card key={item.href} item={item} />
      ))}
    </div>
  );
}
