import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#111225] px-4 py-10 text-[#faf7ef]">
      <Link href="/" className="font-arcade rounded px-3 py-3 text-center text-sm leading-relaxed text-[#ffe9a8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd166]">
        PHIL LANEY
      </Link>
      {children}
      <Link href="/" className="flex min-h-11 items-center gap-2 rounded px-4 text-sm text-[#c2c3d5] underline-offset-4 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd166]">
        <span aria-hidden="true">←</span> Back to home
      </Link>
    </main>
  );
}
