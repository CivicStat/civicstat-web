import Link from "next/link";
import { getParliaments, getElectionOverview } from "../../../../lib/api";
import type { ElectionOverviewResponse } from "../../../../lib/api";
import ElectionCountdown from "../../../../components/ElectionCountdown";
import { gemeente } from "../../../../lib/routes";

export const revalidate = 600; // ISR: re-generate every 10 min

export const metadata = {
  title: "Gemeenteraadsverkiezingen 18 maart 2026 | CivicStat",
  description:
    "Bekijk het track record van gemeenteraadspartijen en hun nieuwe beloften voor 2026.",
};

export default async function VerkiezingenPage() {
  // Fetch all parliaments and filter to municipal with data
  const parliaments = await getParliaments().catch(() => []);
  const municipalities = parliaments.filter(
    (p) => p.level === "MUNICIPAL" && (p._count?.motions ?? 0) > 0,
  );

  // Fetch election overview for each municipality in parallel
  const overviewResults = await Promise.allSettled(
    municipalities.map((m) => getElectionOverview(m.slug)),
  );

  const overviews: { municipality: typeof municipalities[0]; data: ElectionOverviewResponse }[] = [];
  for (let i = 0; i < municipalities.length; i++) {
    const result = overviewResults[i];
    if (result.status === "fulfilled" && result.value) {
      overviews.push({ municipality: municipalities[i], data: result.value });
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[12px] font-medium text-text-tertiary uppercase tracking-wider mb-2">
          Verkiezingen
        </p>
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal text-ink leading-tight mb-3">
          Gemeenteraadsverkiezingen 18 maart 2026
        </h1>
        <p className="text-base text-text-secondary max-w-[600px]">
          Wat beloven partijen in hun verkiezingsprogramma — en hoe stemden zij
          de afgelopen raadsperiode? CivicStat maakt het zichtbaar.
        </p>
      </div>

      {/* Countdown */}
      <ElectionCountdown electionDate="2026-03-18" label="gemeenteraadsverkiezingen" />

      {/* Per-municipality cards */}
      {overviews.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-secondary">
            Nog geen verkiezingsdata beschikbaar.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {overviews.map(({ municipality, data }) => (
            <MunicipalityCard
              key={municipality.slug}
              slug={municipality.slug}
              name={data.parliamentName}
              data={data}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-12 text-[12px] text-text-tertiary max-w-[600px]">
        <p>
          De Mandate Consistency Score (MCS) meet hoe consequent een partij
          stemt ten opzichte van haar eigen verkiezingsbeloften. Scores zijn
          gebaseerd op openbare stemdata en verkiezingsprogramma&apos;s.
        </p>
      </div>
    </div>
  );
}

/* ─── Municipality Card ──────────────────────────────────────── */

function MunicipalityCard({
  slug,
  name,
  data,
}: {
  slug: string;
  name: string;
  data: ElectionOverviewResponse;
}) {
  const cityRoutes = gemeente(slug);

  // Separate parties with 2022 track record from 2026-only
  const partiesWithHistory = data.parties.filter(
    (p) => p.historicalMcs !== null,
  );
  const partiesWith2026 = data.parties.filter((p) => p.promiseCount2026 > 0);

  return (
    <div className="card overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-surface-sub/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl" aria-hidden>
              🏛️
            </span>
            <h2 className="font-serif text-xl text-ink">{name}</h2>
          </div>
          <Link
            href={cityRoutes.root}
            className="text-[13px] font-medium text-moss hover:underline"
          >
            Bekijk gemeente &rarr;
          </Link>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
        {/* Left: Historical track record */}
        <div className="p-6">
          <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3">
            Historisch track record (2022–2026)
          </h3>
          {partiesWithHistory.length === 0 ? (
            <p className="text-sm text-text-tertiary">
              Nog geen scorecards beschikbaar.
            </p>
          ) : (
            <div className="space-y-1.5">
              {partiesWithHistory.map((p) => (
                <Link
                  key={p.partyId}
                  href={cityRoutes.partij(p.partyId)}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-surface-sub/60 transition-colors group"
                >
                  <span className="text-sm font-medium text-ink group-hover:text-moss transition-colors">
                    {p.abbreviation}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[12px] text-text-tertiary">
                      {p.historicalScoredPromises}/{p.historicalTotalPromises} beloften
                    </span>
                    <McsChip mcs={p.historicalMcs!} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: 2026 promises */}
        <div className="p-6">
          <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3">
            Wat beloven ze nu (2026)
          </h3>
          {partiesWith2026.length === 0 ? (
            <p className="text-sm text-text-tertiary">
              Nog geen 2026-beloften beschikbaar.
            </p>
          ) : (
            <div className="space-y-1.5">
              {partiesWith2026.map((p) => (
                <Link
                  key={p.partyId}
                  href={cityRoutes.partij(p.partyId)}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-surface-sub/60 transition-colors group"
                >
                  <span className="text-sm font-medium text-ink group-hover:text-moss transition-colors">
                    {p.abbreviation}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[12px] text-text-tertiary">
                      {p.promiseCount2026} beloften
                    </span>
                    {p.vooruitblikMcs !== null ? (
                      <McsChip mcs={p.vooruitblikMcs} label="MCS" />
                    ) : (
                      <span className="text-[11px] text-text-tertiary px-2 py-0.5 rounded bg-surface-sub">
                        —
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── MCS Chip ───────────────────────────────────────────────── */

function McsChip({ mcs, label = "MCS" }: { mcs: number; label?: string }) {
  const color =
    mcs >= 70
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
      : mcs >= 40
        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${color}`}>
      {label} {mcs}%
    </span>
  );
}
