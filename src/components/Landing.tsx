import { SignInButton } from "@clerk/nextjs";
import ArcadeStage from "./ArcadeStage";

export default function Landing({ game }: { game?: string }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0a0b23]">
      <div className="absolute inset-0">
        <ArcadeStage theme={game} />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center overflow-hidden px-3 pt-[clamp(120px,19vh,196px)] text-center">
        <h1 className="font-arcade leading-[1.35] text-[clamp(16px,5.6vw,64px)] text-[#ffe9a8] [text-shadow:3px_3px_0_#c0392b,6px_6px_0_#2a0f22]">
          PHIL LANEY
        </h1>

        <p className="font-arcade mt-5 text-[clamp(7px,1.7vw,12px)] leading-[2] text-[#8fe3ff] [text-shadow:2px_2px_0_#101033]">
          PERSONAL APPS &amp; PROJECTS
        </p>

        {/* Signing in happens in a modal over the game, and always lands on
            the project list rather than wherever Clerk last sent us. */}
        <SignInButton mode="modal" forceRedirectUrl="/" signUpForceRedirectUrl="/">
          <button
            type="button"
            className="font-arcade mt-9 inline-block cursor-pointer bg-[#12122e] px-6 py-4 text-[clamp(9px,2vw,15px)] text-[#ffd166] transition-colors hover:bg-[#ffd166] hover:text-[#12122e] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8fe3ff]"
            style={{ boxShadow: "0 0 0 4px #0a0b23, 0 0 0 8px #ffd166, 0 10px 0 4px #00000055" }}
          >
            <span className="arcade-blink">&#9654;</span> PRESS START
          </button>
        </SignInButton>

        <p className="font-arcade mt-5 text-[clamp(6px,1.4vw,9px)] leading-[2.2] text-[#b9b2e0] [text-shadow:2px_2px_0_#101033]">
          SIGN IN TO CONTINUE
        </p>
      </div>
    </main>
  );
}
