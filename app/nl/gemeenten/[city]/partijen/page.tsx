import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getParliament,
  getScopedParties,
  getScopedScorecards,
} from "../../../../../lib/api";
import type { PartyScorecard } from "../../../../../lib/types";
import { getPartyColor } from "../../../../../lib/utils";
import PartyAvatar from "../../../../../components/PartyAvatar";
import Term from "../../../../../components/Term";
import { gemeente } from "../../../../../lib/routes";

interface Props {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  try {
    const parliament = await getParliament(city);
    return {
      title: `Partijen — ${parliament.shortName}`,
      description: `Raadsfracties van ${parliament.shortName} met zetelverdeling en consistentiescores.`,
    };
  } catch {
    return { title: "Partijen" };
  }
}

export default async function GemeentePartijenPage({ params, searchParams }: Props) {
  const { city } = await params;
  const { sort } = await searchParams;

  let parliament;
  try {
    parliament = await getParliament(city);
  } catch {
    notFound();
  }

  const r = gemeente(city);

  let parties;
  try {
    parties = await getScopedParties(city);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-[26px] text-ink mb-2">Partijen</h1>
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API.
        </div>
      </div>
    );
  }

  // Fetch 2022 and 2026 scorecards in parallel
  const [scorecards2022Result, scorecards2026Result] = await Promise.allSettled([
    getScopedScorecards(city, { year: 2022 }),
    getScopedScorecards(city, { year: 2026 }),
  ]);

  const scorecards2022Map = new Map<string, Omit<PartyScorecard, "promises">>();
  const scorecards2026Map = new Map<string, Omit<PartyScorecard, "promises">>();

  if (scorecards2022Result.status === "fulfilled") {
    for (const sc of scorecards2022Result.value) {
      scorecards2022Map.set(sc.partyId, sc);
    }
  }
  if (scorecards2026Result.status === "fulfilled") {
    for (const sc of scorecards2026Result.value) {
      scorecards2026Map.set(sc.partyId, sc);
    }
  }

  const hasAny2022 = scorecards2022Map.size > 0;
  const hasAny2026 = scorecards2026Map.size > 0;
  const hasScores = hasAny2022 || hasAny2026;

  const activeParties = parties.filter((p) => p.seats > 0);
  const totalSeats = parliament.seats;

  // Sort parties
  const sortedParties = [...parties].sort((a, b) => {
    if (sort === "2026") {
      const sa = scorecards2026Map.get(a.id)?.mandateConsistencyScore ?? -1;
      const sb = scorecards2026Map.get(b.id)?.mandateConsistencyScore ?? -1;
      if (sb !== sa) return sb - sa;
      return b.seats - a.seats;
    }
    if (sort === "2022") {
      const sa = scorecards2022Map.get(a.id)?.mandateConsistencyScore ?? -1;
      const sb = scorecards2022Map.get(b.id)?.mandateConsistencyScore ?? -1;
      if (sb !== sa) return sb - sa;
      return b.seats - a.seats;
    }
    if (sort === "alfa") {
      return a.abbreviation.localeCompare(b.abbreviation, "nl");
    }
    // Default: sort by seats
    return b.seats - a.seats;
  });

  const sortOptions = [
    { key: "zetels", label: "Zetels" },
    ...(hasAny2026 ? [{ key: "2026", label: "Vooruitblik 2026" }] : []),
    ...(hasAny2022 ? [{ key: "2022", label: "Track record 2022" }] : []),
    { key: "alfa", label: "Alfabetisch" },
  ];
  const activeSort = sort || "zetels";

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-text-tertiary mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-moss transition-colors">Home</Link>
        <span>/</span>
        <Link href="/nl/gemeenten" className="hover:text-moss transition-colors">Gemeenten</Link>
        <span>/</span>
        <Link href={r.root} className="hover:text-moss transition-colors">{parliament.shortName}</Link>
        <span>/</span>
        <span className="text-ink font-medium">Partijen</span>
      </nav>

      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Partijen
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">
        Fracties in de gemeenteraad van {parliament.shortName}
        {hasScores ? " met consistentiescores." : " met zetelverdeling."}
      </p>

      {/* Seat distribution bar */}
      {activeParties.length > 0 && (
        <div className="card p-[18px] mb-6">
          <div className="section-label">
            Zetelverdeling ({totalSeats} zetels)
          </div>
          <div className="flex h-7 rounded-md overflow-hidden gap-px">
            {activeParties
              .sort((a, b) => b.seats - a.seats)
              .map((p) => {
                const color = getPartyColor(p.abbreviation, p.colorNeutral);
                return (
                  <Link
                    key={p.id}
                    href={r.partij(p.id)}
                    title={`${p.abbreviation}: ${p.seats} ${p.seats === 1 ? "zetel" : "zetels"}`}
                    className="block transition-opacity hover:opacity-100"
                    style={{
                      width: `${(p.seats / totalSeats) * 100}%`,
                      backgroundColor: color,
                      opacity: 0.8,
                      minWidth: p.seats > 1 ? 4 : 2,
                    }}
                  />
                );
              })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
            {activeParties
              .sort((a, b) => b.seats - a.seats)
              .map((p) => (
                <Link
                  key={p.id}
                  href={r.partij(p.id)}
                  className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-ink transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor: getPartyColor(p.abbreviation, p.colorNeutral),
                      opacity: 0.8,
                    }}
                  />
                  {p.abbreviation} ({p.seats})
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Sort controls */}
      {hasScores && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider">Sorteer:</span>
          <div className="flex gap-1.5">
            {sortOptions.map((opt) => (
              <Link
                key={opt.key}
                href={`${r.partijen}${opt.key === "zetels" ? "" : `?sort=${opt.key}`}`}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeSort === opt.key
                    ? "bg-ink text-white dark:bg-white dark:text-ink shadow-sm"
                    : "text-text-tertiary hover:text-ink hover:bg-surface-sub"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Party table */}
      <div className="card overflow-hidden">
        {/* Desktop header */}
        <div className={`hidden sm:grid gap-2 px-5 py-2.5 border-b border-border bg-surface-sub/30 text-[10px] font-medium text-text-tertiary uppercase tracking-wider ${
          hasScores
            ? "sm:grid-cols-[1fr_60px_90px_90px_70px]"
            : "sm:grid-cols-[1fr_70px_80px]"
        }`}>
          <span>Partij</span>
          <span className="text-right">Zetels</span>
          {hasScores && (
            <>
              <span className="text-right">
                <Term definition="Track record: hoe consistent stemde deze partij met haar beloften uit 2022?">
                  2022
                </Term>
              </span>
              <span className="text-right">
                <Term definition="Vooruitblik: hoe consistent stemde deze partij al met wat ze nu beloven voor 2026?">
                  2026
                </Term>
              </span>
            </>
          )}
          <span className="text-right">Raadsleden</span>
        </div>

        {sortedParties.map((p, idx) => {
          const color = getPartyColor(p.abbreviation, p.colorNeutral);
          const sc2022 = scorecards2022Map.get(p.id);
          const sc2026 = scorecards2026Map.get(p.id);

          return (
            <Link
              key={p.id}
              href={r.partij(p.id)}
              className={`block hover:bg-surface-sub/40 transition-colors ${
                idx < sortedParties.length - 1 ? "border-b border-border-subtle" : ""
              }`}
            >
              {/* Desktop row */}
              <div className={`hidden sm:grid gap-2 items-center px-5 py-3 ${
                hasScores
                  ? "sm:grid-cols-[1fr_60px_90px_90px_70px]"
                  : "sm:grid-cols-[1fr_70px_80px]"
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <PartyAvatar abbreviation={p.abbreviation} color={color} size="sm" />
                  <div className="min-w-0">
                    <span className="text-[14px] font-semibold text-ink">
                      {p.abbreviation}
                    </span>
                    <div className="text-[11px] text-text-tertiary truncate">
                      {p.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[18px] font-serif text-ink">
                    {p.seats}
                  </span>
                </div>
                {hasScores && (
                  <>
                    <div className="text-right">
                      {sc2022 && sc2022.scoredPromises > 0 ? (
                        <div>
                          <span className="text-[16px] font-serif text-ink">
                            {sc2022.mandateConsistencyScore}
                          </span>
                          <div className="text-[10px] text-text-tertiary">
                            {sc2022.scoredPromises}/{sc2022.totalPromises}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[13px] text-text-tertiary">—</span>
                      )}
                    </div>
                    <div className="text-right">
                      {sc2026 && sc2026.scoredPromises > 0 ? (
                        <div>
                          <span className="text-[16px] font-serif text-ink font-medium">
                            {sc2026.mandateConsistencyScore}
                          </span>
                          <div className="text-[10px] text-text-tertiary">
                            {sc2026.scoredPromises}/{sc2026.totalPromises}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[13px] text-text-tertiary">—</span>
                      )}
                    </div>
                  </>
                )}
                <div className="text-right text-[13px] text-text-secondary">
                  {p._count.mps}
                </div>
              </div>

              {/* Mobile card */}
              <div className="sm:hidden px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PartyAvatar abbreviation={p.abbreviation} color={color} size="sm" />
                    <div>
                      <span className="text-[15px] font-semibold text-ink">
                        {p.abbreviation}
                      </span>
                      <div className="text-[11px] text-text-tertiary truncate max-w-[180px]">
                        {p.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-serif text-ink">
                      {p.seats}
                    </span>
                    <span className="text-[11px] text-text-tertiary ml-0.5">
                      {p.seats === 1 ? "zetel" : "zetels"}
                    </span>
                  </div>
                </div>
                {/* Mobile scores row */}
                {hasScores && (sc2022?.scoredPromises || sc2026?.scoredPromises) && (
                  <div className="flex gap-4 mt-2 pt-2 border-t border-border-subtle">
                    {sc2022 && sc2022.scoredPromises > 0 && (
                      <div className="text-[11px]">
                        <span className="text-text-tertiary">2022: </span>
                        <span className="font-serif text-[14px] text-ink">{sc2022.mandateConsistencyScore}</span>
                        <span className="text-text-tertiary ml-1">({sc2022.scoredPromises}/{sc2022.totalPromises})</span>
                      </div>
                    )}
                    {sc2026 && sc2026.scoredPromises > 0 && (
                      <div className="text-[11px]">
                        <span className="text-text-tertiary">2026: </span>
                        <span className="font-serif text-[14px] text-ink font-medium">{sc2026.mandateConsistencyScore}</span>
                        <span className="text-text-tertiary ml-1">({sc2026.scoredPromises}/{sc2026.totalPromises})</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Score legend */}
      {hasScores && (
        <div className="mt-4 text-[11px] text-text-tertiary leading-relaxed">
          <strong className="text-text-secondary">2022</strong> = track record (hoe consistent stemde de partij met beloften uit 2022).{" "}
          <strong className="text-text-secondary">2026</strong> = vooruitblik (hoe consistent stemde de partij al met nieuwe beloften voor 2026).{" "}
          Scores van 0–100. Achter de score: beoordeelde/totaal beloften.
        </div>
      )}
    </div>
  );
}
