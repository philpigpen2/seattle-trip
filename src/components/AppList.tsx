import "server-only";
import type { ReactNode } from "react";
import AppLibrary, { type AppItem } from "./AppLibrary";

// Keep the catalogue in the server graph. Home passes it to the interactive
// library only after its authentication check has succeeded.
const ITEMS: AppItem[] = [
  { href: "https://flourish.philiplaney.com", title: "Flourish", description: "Your health records, wellness tracking and a little help along the way.", category: "Everyday", icon: "leaf", tone: "green", external: true },
  { href: "https://cards.philiplaney.com", title: "Card Coach", description: "Find the right credit card for a purchase, or your next application.", category: "Everyday", icon: "wallet", tone: "blue", external: true },
  { href: "/IQ", title: "IQ UK Homes", description: "Keep track of your London property portfolio.", category: "Everyday", icon: "home", tone: "sand", external: true },
  { href: "https://howto.philiplaney.com", title: "How To", description: "Explore the plans and experiments behind game explainer videos.", category: "Create & play", icon: "dice", tone: "gold", external: true },
  { href: "https://gragras.philiplaney.com", title: "Gragras", description: "Charlotte’s world of alien pets and evening stories.", category: "Create & play", icon: "alien", tone: "violet", external: true },
  { href: "https://sinvitation.philiplaney.com", title: "Invitation", description: "One Night, Three Children. This app is currently unavailable.", category: "Create & play", icon: "envelope", tone: "rose", external: true, unavailable: true },
  { href: "https://invites.philiplaney.com", title: "Party Invites", description: "Make a party invitation and keep all your RSVPs together.", category: "Create & play", icon: "party", tone: "rose", external: true },
  { href: "https://everbound.philiplaney.com", title: "Everbound", description: "Create personalised storybooks with a little magic.", category: "Create & play", icon: "book", tone: "violet", external: true },
  { href: "/trip", title: "Trip Expenses", description: "Split the Seattle trip costs and see who owes what. May–June 2026.", category: "Projects", icon: "map", tone: "blue" },
  { href: "/dryht", title: "Dryht rollout", description: "Follow release progress, current blockers and what comes next.", category: "Projects", icon: "milestone", tone: "sand" },
];

export default function AppList({ account }: { account?: ReactNode }) {
  return <AppLibrary items={ITEMS} account={account} />;
}
