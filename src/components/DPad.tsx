"use client";

/** Thumb control for playing on a phone; the arrow keys do the same on a desktop. */
export default function DPad({
  onDir,
  onRelease,
}: {
  onDir: (dir: 0 | 1 | 2 | 3) => void;
  onRelease: () => void;
}) {
  const btn =
    "flex h-10 w-10 touch-none select-none items-center justify-center bg-[#12122e]/90 text-[#ffd166] ring-2 ring-[#2a2a5c] active:bg-[#ffd166] active:text-[#12122e]";
  // Held, not tapped: he moves while the button is down and stops when it is
  // let go, which is what the keyboard does too.
  const press = (dir: 0 | 1 | 2 | 3) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    onDir(dir);
  };
  const lift = (e: React.PointerEvent) => {
    e.preventDefault();
    onRelease();
  };
  const held = {
    onPointerUp: lift,
    onPointerCancel: lift,
    onPointerLeave: lift,
  };
  return (
    <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1" aria-hidden="false">
      <span />
      <button type="button" className={btn} onPointerDown={press(3)} {...held} aria-label="Up">
        &#9650;
      </button>
      <span />
      <button type="button" className={btn} onPointerDown={press(2)} {...held} aria-label="Left">
        &#9664;
      </button>
      <span />
      <button type="button" className={btn} onPointerDown={press(0)} {...held} aria-label="Right">
        &#9654;
      </button>
      <span />
      <button type="button" className={btn} onPointerDown={press(1)} {...held} aria-label="Down">
        &#9660;
      </button>
      <span />
    </div>
  );
}
