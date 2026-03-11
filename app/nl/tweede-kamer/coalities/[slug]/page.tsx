import Link from "next/link";
import { notFound } from "next/navigation";
import { getBelofteOMeter } from "../../../../../lib/api";
import type { BelofteOMeterResponse } from "../../../../../lib/types";
import { getPartyColor, themeLabel, formatDate } from "../../../../../lib/utils";
import { routes } from "../../../../../lib/routes";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const data = await getBelofteOMeter(params.slug);
    return {
      title: `Belofte-O-Meter — ${data.coalition.name}`,
      description: `Hoe ver is ${data.coalition.name} met de uitvoering van het regeerakkoord? ${data.summary.enacted} van ${data.summary.totalPromises} beloften nagekomen.`,
    };
  } catch {
    return { title: "Belofte-O-Meter" };
  }
}

export default async function CoalitieDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let data: BelofteOMeterResponse;
  try {
    data = await getBelofteOMeter(params.slug);
  } catch {
    notFound();
  }

  const { coalition, summary, partyScorecards, byTheme, promises } = data;
  const scored = summary.totalPromises - summary.insufficientData;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Breadcrumb */}
      <div className="text-[11px] text-text-tertiary mb-4">
        <Link href={routes.tk.coalities} className="hover:underline">
          Coalities
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-text-secondary">{coalition.name}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-normal text-ink mb-1">
          Belofte-O-Meter
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-[600px]">
          Hoe ver is {coalition.name} ({coalition.parties.join(", ")}) met de
          uitvoering van het regeerakkoord?
          {coalition.active && (
            <span className="ml-1.5 text-[10px] px-1.5 py-px rounded-full border border-border text-text-tertiary align-middle">
              actief
            </span>
          )}
        </p>
        <p className="text-[11px] text-text-tertiary mt-1">
          Periode: {formatDate(data.regeerakkoord.periodStart)} — {coalition.active ? "heden" : formatDate(data.regeerakkoord.periodEnd)}
        </p>
      </div>

      {/* Summary card */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <StatBlock
            value={summary.enacted}
            pct={summary.enactedPct}
            label="Nagekomen"
            className="bg-ink/25"
          />
          <StatBlock
            value={summary.pending}
            pct={summary.pendingPct}
            label="In behandeling"
            className="bg-ink/12"
          />
          <StatBlock
            value={summary.broken}
            pct={summary.brokenPct}
            label="Gebroken"
            className="bg-ink/4 border border-border/50"
          />
          <StatBlock
            value={summary.insufficientData}
            pct={summary.totalPromises > 0 ? Math.round((summary.insufficientData / summary.totalPromises) * 100) : 0}
            label="Onvoldoende data"
            className="bg-surface-sub"
          />
        </div>

        {/* Overall thermometer */}
        {scored > 0 && (
          <div>
            <div className="section-label mb-2">
              Voortgang ({scored} van {summary.totalPromises} beloften gescoord)
            </div>
            <div className="flex h-5 rounded-md overflow-hidden gap-px">
              {summary.enacted > 0 && (
                <div
                  className="bg-ink/25"
                  style={{ flex: summary.enacted }}
                  title={`Nagekomen: ${summary.enacted}`}
                />
              )}
              {summary.pending > 0 && (
                <div
                  className="bg-ink/12"
                  style={{ flex: summary.pending }}
                  title={`In behandeling: ${summary.pending}`}
                />
              )}
              {summary.broken > 0 && (
                <div
                  className="bg-ink/4 border-y border-border/50"
                  style={{ flex: summary.broken }}
                  title={`Gebroken: ${summary.broken}`}
                />
              )}
            </div>
            <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-ink/25" />
                Nagekomen ({summary.enacted})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-ink/12" />
                In behandeling ({summary.pending})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-ink/4 border border-border/50" />
                Gebroken ({summary.broken})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Party MCS scores */}
      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h2 className="section-label">Coalitiepartijen — MCS Regeerakkoord</h2>
        </div>
        <div className="divide-y divide-border-subtle">
          {partyScorecards.map((ps) => (
            <Link
              key={ps.partyId}
              href={routes.tk.partij(ps.abbreviation)}
              className="flex items-center justify-between px-6 py-3 hover:bg-surface-sub/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: getPartyColor(ps.abbreviation), opacity: 0.8 }}
                />
                <span className="text-sm font-medium text-ink">{ps.abbreviation}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[80px]">
                  <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-sub">
                    <div
                      className="bg-ink/25 rounded-full"
                      style={{ width: `${ps.mcs}%` }}
                    />
                  </div>
                </div>
                <span className="text-[15px] font-serif tabular-nums text-ink w-[32px] text-right">
                  {ps.mcs}
                </span>
                <span className="hidden sm:inline text-[10px] text-text-tertiary tabular-nums w-[100px] text-right">
                  {ps.consistentCount}c / {ps.mixedCount}w / {ps.inconsistentCount}a
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Theme thermometers */}
      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h2 className="section-label">Per thema</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(byTheme)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([theme, t]) => (
              <ThemeThermometer key={theme} theme={theme} data={t} />
            ))}
        </div>
      </div>

      {/* Promise list */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <h2 className="section-label">Alle beloften ({summary.totalPromises})</h2>
        </div>
        <div className="divide-y divide-border-subtle">
          {promises
            .sort((a, b) => {
              const order = { enacted: 0, broken: 1, pending: 2, insufficient_data: 3 };
              return (order[a.coalitionStatus] ?? 4) - (order[b.coalitionStatus] ?? 4);
            })
            .map((p) => (
              <PromiseRow key={p.promiseId} promise={p} partyScorecards={partyScorecards} />
            ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="mt-6 text-xs text-text-tertiary max-w-lg leading-relaxed">
        <details>
          <summary className="cursor-pointer hover:text-text-secondary underline underline-offset-2">
            Hoe werkt de Belofte-O-Meter?
          </summary>
          <p className="mt-2">
            De Belofte-O-Meter volgt regeerakkoordbeloften door ze te matchen met
            parlementaire moties en stemmingen. Een belofte is &ldquo;nagekomen&rdquo; als de
            meerderheid van de coalitiepartijen consistent stemt (&ge;70% aligned),
            &ldquo;gebroken&rdquo; als de meerderheid inconsistent stemt (&le;30%), en &ldquo;in
            behandeling&rdquo; bij wisselend stemgedrag. Minimaal 3 relevante moties
            vereist voor scoring.
          </p>
        </details>
      </div>
    </div>
  );
}

function StatBlock({
  value,
  pct,
  label,
  className,
}: {
  value: number;
  pct: number;
  label: string;
  className: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[28px] font-serif text-ink leading-none tabular-nums">
        {value}
      </div>
      <div className="text-[11px] text-text-tertiary mt-0.5">{pct}%</div>
      <div className={`inline-block text-[10px] mt-1.5 px-2 py-0.5 rounded-sm ${className}`}>
        {label}
      </div>
    </div>
  );
}

function ThemeThermometer({
  theme,
  data,
}: {
  theme: string;
  data: { total: number; enacted: number; broken: number; pending: number; insufficientData: number };
}) {
  const scored = data.enacted + data.broken + data.pending;
  return (
    <div className="px-3 py-3 rounded-md bg-surface-sub/40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-ink font-medium">{themeLabel(theme)}</span>
        <span className="text-[10px] text-text-tertiary">{data.total} beloften</span>
      </div>
      {scored > 0 ? (
        <>
          <div className="flex h-2.5 rounded-sm overflow-hidden gap-px">
            {data.enacted > 0 && (
              <div className="bg-ink/25" style={{ flex: data.enacted }} />
            )}
            {data.pending > 0 && (
              <div className="bg-ink/12" style={{ flex: data.pending }} />
            )}
            {data.broken > 0 && (
              <div className="bg-ink/4 border-y border-border/50" style={{ flex: data.broken }} />
            )}
          </div>
          <div className="flex gap-3 mt-1.5 text-[10px] text-text-tertiary">
            <span>{data.enacted} nagekomen</span>
            <span>{data.pending} lopend</span>
            <span>{data.broken} gebroken</span>
          </div>
        </>
      ) : (
        <div className="text-[11px] text-text-tertiary">Onvoldoende data</div>
      )}
    </div>
  );
}

function PromiseRow({
  promise,
  partyScorecards,
}: {
  promise: BelofteOMeterResponse["promises"][0];
  partyScorecards: BelofteOMeterResponse["partyScorecards"];
}) {
  const statusConfig = {
    enacted: { label: "Nagekomen", bg: "bg-ink/20", text: "text-ink" },
    broken: { label: "Gebroken", bg: "bg-ink/4 border border-border/50", text: "text-text-secondary" },
    pending: { label: "In behandeling", bg: "bg-ink/10", text: "text-text-secondary" },
    insufficient_data: { label: "Onvoldoende data", bg: "bg-surface-sub", text: "text-text-tertiary" },
  };
  const cfg = statusConfig[promise.coalitionStatus];

  return (
    <div className="px-6 py-3">
      <div className="flex items-start gap-3">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap mt-0.5 ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink leading-snug">{promise.summary}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
            <span className="text-[10px] text-text-tertiary">{themeLabel(promise.theme)}</span>
            {partyScorecards.map((ps) => {
              const partyStatus = promise.partyStatuses[ps.abbreviation];
              if (!partyStatus) return null;
              const statusIcon =
                partyStatus.status === "consistent" ? "+" :
                partyStatus.status === "inconsistent" ? "-" :
                partyStatus.status === "mixed" ? "~" : "?";
              return (
                <span
                  key={ps.abbreviation}
                  className="text-[10px] text-text-tertiary"
                  title={`${ps.abbreviation}: ${partyStatus.alignedVotes} aligned, ${partyStatus.opposedVotes} opposed`}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full mr-0.5 align-middle"
                    style={{ backgroundColor: getPartyColor(ps.abbreviation), opacity: 0.7 }}
                  />
                  {ps.abbreviation} {statusIcon}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
