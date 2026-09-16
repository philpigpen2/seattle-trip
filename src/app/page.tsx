import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import AppList from "@/components/AppList";
import Landing from "@/components/Landing";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ game?: string }>;
}) {
  const [{ userId }, { game }] = await Promise.all([auth(), searchParams]);

  // The private catalogue is rendered only after authentication.
  if (!userId) return <Landing game={game} />;

  return (
    <AppList
      account={
        <SignOutButton>
          <button type="button">Sign out</button>
        </SignOutButton>
      }
    />
  );
}
