import Link from "next/link";
import ArcadeStage from "./ArcadeStage";

export default function Landing({ game }: { game?: string }) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0a0b23]">
      <div className="absolute inset-0">
        <ArcadeStage theme={game} />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center px-5 pt-[9vh] text-center">
        <h1 className="font-arcade leading-[1.35] text-[clamp(22px,6.4vw,64px)] text-[#ffe9a8] [text-shadow:3px_3px_0_#c0392b,6px_6px_0_#2a0f22]">
          PHIL LANEY
        </h1>

        <p className="font-arcade mt-5 text-[clamp(7px,1.7vw,12px)] leading-[2] text-[#8fe3ff] [text-shadow:2px_2px_0_#101033]">
          PERSONAL APPS &amp; PROJECTS
        </p>

        <Link
          href="/sign-in"
          className="font-arcade group mt-9 inline-block bg-[#12122e] px-6 py-4 text-[clamp(9px,2vw,15px)] text-[#ffd166] transition-colors hover:bg-[#ffd166] hover:text-[#12122e] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8fe3ff]"
          style={{ boxShadow: "0 0 0 4px #0a0b23, 0 0 0 8px #ffd166, 0 10px 0 4px #00000055" }}
        >
          <span className="arcade-blink">&#9654;</span> PRESS START
        </Link>

        <p className="font-arcade mt-5 text-[clamp(6px,1.4vw,9px)] leading-[2.2] text-[#b9b2e0] [text-shadow:2px_2px_0_#101033]">
          SIGN IN TO CONTINUE
        </p>

        <div className="mt-auto pb-6">
          <p className="font-arcade text-[clamp(5px,1.2vw,8px)] leading-[2.4] text-[#6f6bb5]">
            &#169; 2026 PHILIPLANEY.COM &#183; 1 PLAYER ONLY
          </p>
        </div>
      </div>
    </main>
  );
}
