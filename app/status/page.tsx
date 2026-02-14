import type { Metadata } from "next";
import Link from "next/link";
import { getSystemStatus, getPipelineRuns } from "../../lib/api";

export const metadata: Metadata = {
  title: "Systeemstatus — CivicStat",
  description:
    "Live status van de CivicStat datapipeline, datadekking en systeemgezondheid.",
};

// ─── Types ──────────────────────────────────────────────────

interface StepResult {
  name: string;
  status: "ok" | "error" | "skipped";
  durationMs: number;
  error?: string;
}

interface PipelineRun {
  id: string;
  status: "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";
  trigger: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  steps: StepResult[];
  motionsSynced: number;
  votesSynced: number;
  sponsorsSynced: number;
  matchesCreated: number;
  scorecardsComputed: number;
  errorMessage: string | null;
  errorStep: string | null;
}

interface SystemStatus {
  health: "healthy" | "degraded" | "unhealthy" | "unknown";
  lastRun: PipelineRun | null;
  dataCounts: {
    motions: number;
    votes: number;
    members: number;
    parties: number;
    promises: number;
    matchedPromises: number;
    scorecards: number;
  };
  freshness: {
    lastMotionSync: string | null;
    lastVoteSync: string | null;
    lastScorecardCompute: string | null;
  };
  recentErrors: number;
}

// ─── Page ───────────────────────────────────────────────────

export default async function StatusPage() {
  const [statusRes, runsRes] = await Promise.allSettled([
    getSystemStatus(),
    getPipelineRuns(10),
  ]);

  const status: SystemStatus | null =
    statusRes.status === "fulfilled" ? statusRes.value : null;
  const runs: PipelineRun[] =
    runsRes.status === "fulfilled" ? runsRes.value : [];

  const fmt = (n: number | null | undefined) =>
    n != null ? n.toLocaleString("nl-NL") : "\u2013";

  const fmtDate = (d: string | null | undefined) => {
    if (!d) return "\u2013";
    const date = new Date(d);
    return date.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fmtDuration = (ms: number | null | undefined) => {
    if (!ms) return "\u2013";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
  };

  const healthConfig = {
    healthy: {
      label: "Operationeel",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
      dot: "bg-emerald-500",
      text: "text-emerald-800 dark:text-emerald-300",
    },
    degraded: {
      label: "Beperkt",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
      text: "text-amber-800 dark:text-amber-300",
    },
    unhealthy: {
      label: "Storing",
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      dot: "bg-red-500",
      text: "text-red-800 dark:text-red-300",
    },
    unknown: {
      label: "Onbekend",
      bg: "bg-surface-sub",
      border: "border-border",
      dot: "bg-text-tertiary",
      text: "text-text-secondary",
    },
  };

  const health = status?.health ?? "unknown";
  const hc = healthConfig[health];

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[26px] font-normal text-ink mb-2">
          Systeemstatus
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-[68ch]">
          Live overzicht van de CivicStat datapipeline, datadekking en
          systeemgezondheid. Alle data wordt automatisch bijgewerkt via de
          Tweede Kamer API.
        </p>
      </div>

      {/* ─── 1. System Health Banner ─────────────────────────── */}
      <section className={`rounded-xl border ${hc.border} ${hc.bg} p-5 mb-5`}>
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${hc.dot} animate-pulse`} />
          <span className={`text-lg font-serif ${hc.text}`}>{hc.label}</span>
        </div>
        {status?.lastRun && (
          <p className="text-sm text-text-secondary mt-2">
            Laatste pipeline-run:{" "}
            <span className="text-ink font-medium">
              {fmtDate(status.lastRun.completedAt ?? status.lastRun.startedAt)}
            </span>
            {status.lastRun.durationMs != null && (
              <span className="text-text-tertiary">
                {" "}
                ({fmtDuration(status.lastRun.durationMs)})
              </span>
            )}
          </p>
        )}
        {!status && (
          <p className="text-sm text-text-tertiary mt-2">
            Kan geen verbinding maken met de API.
          </p>
        )}
      </section>

      {/* ─── 2. Data Coverage ────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={1} title="Datadekking" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          Overzicht van alle gegevens in de CivicStat-database.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Moties" value={fmt(status?.dataCounts?.motions)} />
          <StatCard label="Stemmingen" value={fmt(status?.dataCounts?.votes)} />
          <StatCard label="Kamerleden" value={fmt(status?.dataCounts?.members)} />
          <StatCard label="Partijen" value={fmt(status?.dataCounts?.parties)} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          <StatCard label="Beloften" value={fmt(status?.dataCounts?.promises)} />
          <StatCard
            label="Gekoppelde beloften"
            value={fmt(status?.dataCounts?.matchedPromises)}
          />
          <StatCard label="Scorecards" value={fmt(status?.dataCounts?.scorecards)} />
        </div>
      </section>

      {/* ─── 3. Pipeline Health ──────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={2} title="Pipeline-runs" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          Geschiedenis van de laatste pipeline-runs. Elke run synchroniseert
          data, matcht beloften en berekent scorecards.
        </p>

        {runs.length === 0 ? (
          <p className="text-sm text-text-tertiary">
            Nog geen pipeline-runs beschikbaar.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Status
                  </th>
                  <th className="text-left py-2 pr-4 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Gestart
                  </th>
                  <th className="text-left py-2 pr-4 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Duur
                  </th>
                  <th className="text-left py-2 pr-4 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Trigger
                  </th>
                  <th className="text-left py-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Stappen
                  </th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run: PipelineRun) => (
                  <tr
                    key={run.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="py-2.5 pr-4 text-text-secondary whitespace-nowrap">
                      {fmtDate(run.startedAt)}
                    </td>
                    <td className="py-2.5 pr-4 text-text-secondary whitespace-nowrap">
                      {fmtDuration(run.durationMs)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-[11px] font-medium bg-surface-sub px-2 py-0.5 rounded text-text-secondary">
                        {run.trigger}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1">
                        {Array.isArray(run.steps) &&
                          run.steps.map((step: StepResult, i: number) => (
                            <span
                              key={i}
                              title={`${step.name}: ${step.status}${step.error ? ` — ${step.error}` : ""}`}
                              className={`h-2 w-2 rounded-full ${
                                step.status === "ok"
                                  ? "bg-emerald-500"
                                  : step.status === "error"
                                    ? "bg-red-500"
                                    : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            />
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ─── 4. Data Freshness ───────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={3} title="Dataversheid" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          Wanneer elk onderdeel voor het laatst is bijgewerkt.
        </p>
        <div className="space-y-3">
          <FreshnessItem
            label="Moties & stemmingen"
            date={fmtDate(status?.freshness?.lastMotionSync)}
          />
          <FreshnessItem
            label="Stemresultaten"
            date={fmtDate(status?.freshness?.lastVoteSync)}
          />
          <FreshnessItem
            label="Scorecards"
            date={fmtDate(status?.freshness?.lastScorecardCompute)}
          />
        </div>
      </section>

      {/* ─── 5. Methodology Link ─────────────────────────────── */}
      <section className="card p-6">
        <SectionHeading number={4} title="Methodologie" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          Meer weten over hoe CivicStat data verzamelt, verwerkt en
          presenteert? Bekijk onze volledige methodologiepagina.
        </p>
        <Link
          href="/transparantie"
          className="inline-flex items-center gap-2 rounded-lg bg-moss/10 px-4 py-2.5 text-sm font-medium text-moss hover:bg-moss/20 transition-colors"
        >
          <svg
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Transparantie &amp; methodologie
          <svg
            width={14}
            height={14}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </section>
    </main>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/10 text-[11px] font-bold text-moss">
        {number}
      </span>
      <h2 className="font-serif text-[20px] font-normal text-ink">{title}</h2>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-sub border border-border-subtle p-4 text-center">
      <div className="text-[22px] font-serif text-ink">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mt-0.5">
        {label}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";
}) {
  const config = {
    RUNNING: {
      label: "Actief",
      cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    },
    COMPLETED: {
      label: "Voltooid",
      cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    FAILED: {
      label: "Mislukt",
      cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    },
    PARTIAL: {
      label: "Deels",
      cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    },
  };
  const c = config[status] ?? config.FAILED;
  return (
    <span
      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${c.cls}`}
    >
      {c.label}
    </span>
  );
}

function FreshnessItem({ label, date }: { label: string; date: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
      <span className="text-sm text-ink font-medium">{label}</span>
      <span className="text-sm text-text-secondary">{date}</span>
    </div>
  );
}
