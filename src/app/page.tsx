import { auth } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import AppList from "@/components/AppList";
import ArcadeStage from "@/components/ArcadeStage";
import Landing from "@/components/Landing";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = await auth();

  // Signed out: the arcade attract screen is the whole site.
  if (!userId) return <Landing />;

  // Signed in: the apps.
  return (
    <main className="min-h-screen bg-white">
      <div className="relative h-40 w-full overflow-hidden border-b border-gray-200 sm:h-52">
        <ArcadeStage compact />
        <div className="pointer-events-none absolute inset-0 flex items-end p-4 sm:p-6">
          <h1 className="font-arcade text-[clamp(12px,3vw,22px)] text-[#ffe9a8] [text-shadow:2px_2px_0_#c0392b,4px_4px_0_#2a0f22]">
            PHIL LANEY
          </h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-6 py-10">
        <div className="mb-8 flex items-baseline justify-between">
          <p className="text-gray-500">Personal apps &amp; projects.</p>
          <SignOutButton>
            <button className="text-sm text-gray-400 underline underline-offset-4 hover:text-gray-700">
              Sign out
            </button>
          </SignOutButton>
        </div>
        <AppList />
      </div>
    </main>
  );
}
