import { auth } from "@clerk/nextjs/server";
import Landing from "@/components/Landing";

export const dynamic = "force-dynamic";

export default async function Arcade({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const [{ userId }, { game }] = await Promise.all([auth(), searchParams]);
  return <Landing game={game} signedIn={Boolean(userId)} />;
}
