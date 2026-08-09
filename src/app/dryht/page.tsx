import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "Dryht Rollout | Phil Laney",
  description: "Evidence-backed progress from source candidate to Dryht's first customer.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type StageState = "complete" | "underway" | "blocked" | "not-started";

type Stage = {
  number: number;
  title: string;
  plainTitle: string;
  detail: string;
  evidence: string;
  state: StageState;
};

const STAGES: Stage[] = [
  {
    number: 1,
    title: "Release truth and command authority",
    plainTitle: "One reliable release plan",
    detail: "Retire stale launch instructions and make one command sheet authoritative for every rollout lane.",
    evidence: "Canonical command sheet and execution authority established",
    state: "complete",
  },
  {
    number: 2,
    title: "Merge authority and containment",
    plainTitle: "Controlled changes reach production",
    detail: "Bind the required check to its real producer and merge only exact reviewed heads after containment passes.",
    evidence: "Containment gate and exact-head merge path operational",
    state: "complete",
  },
  {
    number: 3,
    title: "App runtime state machine",
    plainTitle: "A complete first-party app",
    detail: "Finish durable conversations, real delivery, honest readiness, and the inactive runtime candidate.",
    evidence: "Production web app READY with VAPID; runtime activation and durable answer delivery remain",
    state: "underway",
  },
  {
    number: 4,
    title: "External evidence and dead-man",
    plainTitle: "Proof outside the runtime",
    detail: "Deploy externally readable evidence and bounded monitoring, then prove the alarm and recovery paths.",
    evidence: "Dead-man and isolated receiver live; broker drill, durable readback, and external reader remain",
    state: "underway",
  },
  {
    number: 5,
    title: "Cloud substrate",
    plainTitle: "A production-shaped but inactive cloud",
    detail: "Read back the final images, identities, network, data migrations, schedulers, secrets, and rollback path.",
    evidence: "Live GCP substrate present; WIF/bootstrap, migration readback, secret wiring, and activation proof remain",
    state: "underway",
  },
  {
    number: 6,
    title: "Customer-zero proof",
    plainTitle: "Phil and one design partner use it naturally",
    detail: "Complete natural app conversations with durable receipts, useful answers, monitoring, and no founder technical operation.",
    evidence: "No customer-zero evidence yet",
    state: "not-started",
  },
  {
    number: 7,
    title: "Second tenant and customer one",
    plainTitle: "The first real customer succeeds",
    detail: "Pass tenant-isolation rehearsal and onboard customer one without founder-run technical steps.",
    evidence: "No second-tenant or customer evidence yet",
    state: "not-started",
  },
];

const stateStyle: Record<StageState, { label: string; dot: string; badge: string; line: string }> = {
  complete: {
    label: "Passed",
    dot: "bg-[#75c787]",
    badge: "border-[#75c787]/40 bg-[#75c787]/10 text-[#a9e8b6]",
    line: "bg-[#75c787]",
  },
  underway: {
    label: "Underway",
    dot: "bg-[#ffbd59]",
    badge: "border-[#ffbd59]/40 bg-[#ffbd59]/10 text-[#ffd999]",
    line: "bg-[#ffbd59]",
  },
  blocked: {
    label: "Blocked",
    dot: "bg-[#f16d63]",
    badge: "border-[#f16d63]/40 bg-[#f16d63]/10 text-[#ffaaa3]",
    line: "bg-[#f16d63]",
  },
  "not-started": {
    label: "Not started",
    dot: "bg-[#4b4e47]",
    badge: "border-white/10 bg-white/[0.03] text-[#aaa99f]",
    line: "bg-[#343631]",
  },
};

type IssueState = {
  number: number;
  state: "open" | "closed";
  closedAt: string | null;
};

type LiveStatus = {
  issues: IssueState[];
  observedAt: string;
  indexedGates: number | null;
  totalGates: number | null;
  ledgerState: string | null;
};

const loadLiveStatus = unstable_cache(async (): Promise<LiveStatus | null> => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  try {
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "philiplaney-com-rollout-tracker",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    const [response, ledgerResponse] = await Promise.all([
      fetch("https://api.github.com/repos/Dryht/dryht/issues?state=all&per_page=20&sort=created&direction=asc", { headers, cache: "no-store" }),
      fetch("https://api.github.com/repos/Dryht/dryht/contents/production/evidence-ledger.json?ref=main", { headers, cache: "no-store" }),
    ]);

    if (!response.ok) return null;

    const raw = (await response.json()) as Array<{ number?: unknown; state?: unknown; closed_at?: unknown }>;
    const issues = raw
      .filter((issue) => typeof issue.number === "number" && issue.number >= 5 && issue.number <= 11)
      .map((issue) => ({
        number: issue.number as number,
        state: issue.state === "closed" ? "closed" as const : "open" as const,
        closedAt: typeof issue.closed_at === "string" ? issue.closed_at : null,
      }));

    if (issues.length !== 7 || issues.some((issue) => issue.state === "closed" && (!issue.closedAt || Number.isNaN(new Date(issue.closedAt).getTime())))) return null;

    let indexedGates: number | null = null;
    let totalGates: number | null = null;
    let ledgerState: string | null = null;
    if (ledgerResponse.ok) {
      const payload = (await ledgerResponse.json()) as { content?: unknown; encoding?: unknown };
      if (payload.encoding === "base64" && typeof payload.content === "string") {
        const ledger = JSON.parse(Buffer.from(payload.content, "base64").toString("utf8")) as { state?: unknown; gates?: Record<string, { status?: unknown }> };
        ledgerState = typeof ledger.state === "string" ? ledger.state : null;
        if (ledger.gates && typeof ledger.gates === "object") {
          const gates = Object.values(ledger.gates);
          totalGates = gates.length;
          indexedGates = gates.filter((gate) => gate.status === "indexed").length;
        }
      }
    }

    return {
      issues,
      observedAt: response.headers.get("date") ?? new Date().toISOString(),
      indexedGates,
      totalGates,
      ledgerState,
    };
  } catch {
    return null;
  }
}, ["dryht-rollout-issue-state-v3"], { revalidate: 300 });

function formatEst(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(date));
}

function Metric({ label, value, note, danger = false }: { label: string; value: string; note: string; danger?: boolean }) {
  return (
    <div className="border-t border-white/15 pt-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#999a90]">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-semibold tracking-[-0.04em] ${danger ? "text-[#f16d63]" : "text-[#f4f0e5]"}`}>{value}</p>
      <p className="mt-1 text-xs leading-5 text-[#a8a89f]">{note}</p>
    </div>
  );
}

function StageCard({ stage }: { stage: Stage }) {
  const style = stateStyle[stage.state];
  return (
    <li className="relative grid gap-4 border-t border-white/10 py-6 first:border-t-0 md:grid-cols-[4rem_minmax(0,1fr)_12rem] md:items-start">
      <div className="flex items-center gap-3 md:block">
        <span className="font-mono text-xs text-[#777970]">{String(stage.number).padStart(2, "0")}</span>
        <span className={`inline-block size-2 rounded-full md:mt-3 md:block ${style.dot}`} aria-hidden="true" />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#f4f0e5]">{stage.plainTitle}</h3>
          <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] ${style.badge}`}>{style.label}</span>
        </div>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#777970]">{stage.title}</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b8b7ad]">{stage.detail}</p>
      </div>
      <p className="border-l border-white/10 pl-4 font-mono text-[10px] leading-5 text-[#999a90] md:mt-1">{stage.evidence}</p>
    </li>
  );
}

export default async function DryhtRolloutPage() {
  const liveStatus = await loadLiveStatus();
  const issueStates = new Map(liveStatus?.issues.map((issue) => [issue.number, issue]));
  const stages = STAGES.map((stage) => {
    const issue = issueStates.get(stage.number + 4);
    return issue?.state === "closed"
      ? { ...stage, state: "complete" as const, evidence: `Exit issue closed · ${formatEst(issue.closedAt!)}` }
      : stage;
  });
  const completeCount = stages.filter((stage) => stage.state === "complete").length;
  const underwayCount = stages.filter((stage) => stage.state === "underway").length;
  const blockedCount = stages.filter((stage) => stage.state === "blocked").length;
  const notStartedCount = stages.filter((stage) => stage.state === "not-started").length;
  const indexedGates = liveStatus?.indexedGates;
  const totalGates = liveStatus?.totalGates;
  const evidenceValue = indexedGates !== null && indexedGates !== undefined && totalGates !== null && totalGates !== undefined
    ? `${indexedGates} / ${totalGates}`
    : "Unavailable";
  const releaseReady = completeCount === stages.length
    && typeof totalGates === "number"
    && typeof indexedGates === "number"
    && totalGates > 0
    && indexedGates === totalGates
    && liveStatus?.ledgerState === "ready";

  return (
    <main className="min-h-screen overflow-hidden bg-[#11120f] text-[#f4f0e5] selection:bg-[#ffbd59] selection:text-[#11120f]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,240,229,.75) 1px, transparent 1px), linear-gradient(90deg, rgba(244,240,229,.75) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <header className="relative border-b border-white/10 px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <Link href="/" className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#aaa99f] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffbd59]">
            Phil Laney / projects
          </Link>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] ${releaseReady ? "border-[#75c787]/40 bg-[#75c787]/10 text-[#a9e8b6]" : "border-[#f16d63]/35 bg-[#f16d63]/10 text-[#ffaaa3]"}`}>
            <span className={`size-1.5 rounded-full ${releaseReady ? "bg-[#75c787]" : "bg-[#f16d63]"}`} aria-hidden="true" />
            {releaseReady ? "Ready" : "Not ready"}
          </div>
        </div>
      </header>

      <section className="relative px-5 pb-12 pt-10 sm:px-8 sm:pt-16 lg:px-12 lg:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-[#ffbd59]">Dryht / first-customer rollout</p>
              <h1 className="mt-5 max-w-5xl text-[clamp(3.5rem,10vw,8.5rem)] font-black uppercase leading-[0.76] tracking-[-0.075em] text-[#f4f0e5]">
                Built is not live.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-[#b8b7ad] sm:text-lg">
                The source candidate is materially advanced. The release is not. Dryht has passed {completeCount === 0 ? "none" : completeCount} of the seven production exit gates.
              </p>
            </div>

            <div className="border-l-2 border-[#ffbd59] pl-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffbd59]">Current focus</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Broker drill + cloud closure</p>
              <p className="mt-3 text-sm leading-6 text-[#aaa99f]">Deploy the controller and monitor against the versioned receiver endpoint, then prove alert recovery without activating founder traffic.</p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Metric label="Release gates passed" value={`${completeCount} / ${stages.length}`} note="A stage counts only when its canonical issue closes" danger={completeCount < stages.length} />
            <Metric label="Gate evidence indexed" value={evidenceValue} note="Index only; the independent reader must still verify every claim" danger={!releaseReady} />
            <Metric label="Source lanes active" value={`${underwayCount} underway`} note={`${blockedCount} blocked · ${notStartedCount} not started · no partial launch credit`} />
          </div>

          <div className="mt-8 grid grid-cols-7 gap-1" aria-label={`${completeCount} of ${stages.length} Dryht release gates passed`}>
            {stages.map((stage) => (
              <div key={stage.number} className={`h-2 rounded-full ${stateStyle[stage.state].line}`} title={`${stage.number}. ${stage.title}: ${stateStyle[stage.state].label}`} />
            ))}
          </div>
        </div>
      </section>

      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-12 lg:pb-24">
        <div className="min-w-0 space-y-8">
          <section className="border border-white/10 bg-[#171814]/95 px-5 py-6 shadow-[0_30px_90px_rgba(0,0,0,.25)] sm:px-7" aria-labelledby="dryht-stages-heading">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ffbd59]">Critical path</p>
                <h2 id="dryht-stages-heading" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">Every gate to customer one</h2>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#777970]">{completeCount} passed · {underwayCount} underway · {blockedCount} blocked · {notStartedCount} not started</p>
            </div>
            <ol>
              {stages.map((stage) => <StageCard key={stage.number} stage={stage} />)}
            </ol>
          </section>

          <section className="grid overflow-hidden border border-white/10 bg-[#ede9dc] text-[#171814] md:grid-cols-2" aria-labelledby="candidate-heading">
            <div className="p-6 sm:p-8">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6b5d42]">What is real already</p>
              <h2 id="candidate-heading" className="mt-3 text-2xl font-semibold tracking-[-0.04em]">A substantial inactive candidate</h2>
              <ul className="mt-6 space-y-4 text-sm leading-6 text-[#4d4c46]">
                <li className="border-l-2 border-[#4f8f63] pl-4">Public production app READY with production VAPID configured</li>
                <li className="border-l-2 border-[#4f8f63] pl-4">Canonical main green through repository verification run 31315499578</li>
                <li className="border-l-2 border-[#4f8f63] pl-4">Checkly dead-man monitor live with failure and recovery notification policy</li>
                <li className="border-l-2 border-[#4f8f63] pl-4">Upstash receipt store isolated from the public app</li>
                <li className="border-l-2 border-[#4f8f63] pl-4">Durable alarm receiver READY in its isolated Vercel project</li>
                <li className="border-l-2 border-[#4f8f63] pl-4">Receiver status monitoring scheduled and GCP endpoint secret versioned</li>
              </ul>
            </div>
            <div className="border-t border-[#c7c1b3] bg-[#dfd9ca] p-6 sm:p-8 md:border-l md:border-t-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6b5d42]">What is not real yet</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">No production operation</h2>
              <ul className="mt-6 space-y-4 text-sm leading-6 text-[#4d4c46]">
                <li className="border-l-2 border-[#c55c53] pl-4">No production model execution or founder traffic activated</li>
                <li className="border-l-2 border-[#c55c53] pl-4">Controller/broker deployment and failure/recovery drill remain</li>
                <li className="border-l-2 border-[#c55c53] pl-4">No independently operated external evidence reader yet</li>
                <li className="border-l-2 border-[#c55c53] pl-4">No applied Supabase migration readback assumed</li>
                <li className="border-l-2 border-[#c55c53] pl-4">No customer-zero or customer-one proof</li>
              </ul>
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className="border border-[#ffbd59]/35 bg-[#ffbd59]/10 p-5" aria-labelledby="unlock-heading">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffd999]">Next unlock</p>
            <h2 id="unlock-heading" className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">Run the broker alarm drill</h2>
            <p className="mt-3 text-sm leading-6 text-[#c8c5b9]">Deploy the controller and monitor with the versioned endpoint, then prove one bounded alarm/recovery cycle and durable receipt.</p>
          </section>

          <section className="border border-white/10 bg-[#171814]/95 p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999a90]">Blocking production</p>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-[#b8b7ad]">
              <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#f16d63]" aria-hidden="true" /><span>Controller/broker deployment and live alarm recovery evidence are incomplete</span></li>
              <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#f16d63]" aria-hidden="true" /><span>Supabase migration DSN and applied-state readback are incomplete</span></li>
              <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#f16d63]" aria-hidden="true" /><span>Production model execution must be implemented without provider API or gateway credentials</span></li>
              <li className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#f16d63]" aria-hidden="true" /><span>External evidence reader operation and customer proof have not started</span></li>
            </ul>
          </section>

          <section className="border border-white/10 bg-[#171814]/95 p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#999a90]">How to read this</p>
            <p className="mt-4 text-sm leading-6 text-[#b8b7ad]">A stage shows Passed when its canonical exit issue closes after production evidence satisfies the exit condition. Source progress is reported explicitly, but receives no partial launch credit.</p>
            <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[9px] uppercase leading-5 tracking-[0.14em] text-[#777970]">
              {liveStatus ? `Issue state checked within five minutes · ${formatEst(liveStatus.observedAt)}` : "Live issue refresh unavailable"}<br />
              Stage detail reconciled 09 Aug 2026 EDT<br />
              Source: command sheet + machine evidence ledger
            </p>
          </section>

          <Link href="/" className="flex min-h-11 items-center justify-between border border-white/15 px-4 py-3 text-xs font-semibold text-[#d5d2c7] transition-colors hover:border-[#ffbd59]/60 hover:bg-[#ffbd59]/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffbd59]">
            <span>Back to projects</span>
            <span aria-hidden="true">→</span>
          </Link>
        </aside>
      </div>
    </main>
  );
}
