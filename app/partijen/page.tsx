import Link from "next/link";
import { Suspense } from "react";
import { getParties, getAllScorecards } from "../../lib/api";
import type { PartyScorecard } from "../../lib/types";
import { getPartyColor } from "../../lib/utils";
import { TK_SEATS } from "../../lib/seats";
import PartyAvatar from "../../components/PartyAvatar";
import PartySortControl from "../../components/PartySortControl";
import { isCoalitionParty, getCoalitionsForParty } from "../../lib/coalitions";

export const revalidate = 3600; // ISR: re-generate at most every hour

export const metadata = { title: "Partijen — CivicStat" };

export default async function PartijenPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sortBy = typeof searchParams.sort === "string" ? searchParams.sort : "seats";

  let parties;
  try {
    parties = await getParties();
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

  // Fetch both TK2023 and TK2025 scorecards in parallel
  let scorecardMap2023 = new Map<string, PartyScorecard>();
  let scorecardMap2025 = new Map<string, PartyScorecard>();
  try {
    const [sc2023, sc2025] = await Promise.all([
      getAllScorecards({ year: 2023 }),
      getAllScorecards({ year: 2025 }),
    ]);
    for (const sc of sc2023) scorecardMap2023.set(sc.partyId, sc);
    for (const sc of sc2025) scorecardMap2025.set(sc.partyId, sc);
  } catch {
    // Scorecards unavailable — continue without them
  }

  // Filter to only parties with known seats
  const activeParties = parties.filter((p) => TK_SEATS[p.abbreviation]);

  // Sort based on selected option
  const sortedParties = [...activeParties].sort((a, b) => {
    switch (sortBy) {
      case "mcs2023": {
        const aScore = scorecardMap2023.get(a.id)?.mandateConsistencyScore ?? -1;
        const bScore = scorecardMap2023.get(b.id)?.mandateConsistencyScore ?? -1;
        return bScore - aScore;
      }
      case "mcs2025": {
        const aScore = scorecardMap2025.get(a.id)?.mandateConsistencyScore ?? -1;
        const bScore = scorecardMap2025.get(b.id)?.mandateConsistencyScore ?? -1;
        return bScore - aScore;
      }
      case "name":
        return a.abbreviation.localeCompare(b.abbreviation);
      default: // seats
        return (TK_SEATS[b.abbreviation] || 0) - (TK_SEATS[a.abbreviation] || 0);
    }
  });

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
            Partijen
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Fracties in de Tweede Kamer met zetelverdeling en belofteconsistentie.
          </p>
        </div>
        <Suspense fallback={null}>
          <PartySortControl />
        </Suspense>
      </div>

      {/* Seat distribution bar */}
      <div className="card p-[18px] mb-6">
        <div className="section-label">Zetelverdeling (150 zetels)</div>
        <div className="flex h-7 rounded-md overflow-hidden gap-px">
          {activeParties
            .sort((a, b) => (TK_SEATS[b.abbreviation] || 0) - (TK_SEATS[a.abbreviation] || 0))
            .map((p) => {
              const seats = TK_SEATS[p.abbreviation] || 0;
              const color = getPartyColor(p.abbreviation, p.colorNeutral);
              return (
                <div
                  key={p.id}
                  title={`${p.abbreviation}: ${seats} ${seats === 1 ? "zetel" : "zetels"}`}
                  className="cursor-pointer transition-opacity hover:opacity-100"
                  style={{
                    width: `${(seats / 150) * 100}%`,
                    backgroundColor: color,
                    opacity: 0.8,
                    minWidth: seats > 1 ? 4 : 2,
                  }}
                />
              );
            })}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {activeParties
            .sort((a, b) => (TK_SEATS[b.abbreviation] || 0) - (TK_SEATS[a.abbreviation] || 0))
            .slice(0, 7)
            .map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1 text-[11px] text-text-secondary"
              >
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{
                    backgroundColor: getPartyColor(p.abbreviation, p.colorNeutral),
                    opacity: 0.8,
                  }}
                />
                {p.abbreviation} ({TK_SEATS[p.abbreviation]})
              </div>
            ))}
        </div>
      </div>

      {/* Party grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {sortedParties.map((p) => {
          const color = getPartyColor(p.abbreviation, p.colorNeutral);
          const seats = TK_SEATS[p.abbreviation] || 0;
          const sc23 = scorecardMap2023.get(p.id);
          const sc25 = scorecardMap2025.get(p.id);
          const has23 = sc23 && sc23.scoredPromises > 0;
          const has25 = sc25 && sc25.scoredPromises > 0;

          return (
            <Link key={p.id} href={`/partijen/${encodeURIComponent(p.abbreviation)}`} className="card p-[18px] hover:border-moss/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <PartyAvatar abbreviation={p.abbreviation} color={color} size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-semibold text-ink">{p.abbreviation}</span>
                      {isCoalitionParty(p.abbreviation) && (() => {
                        const coalitions = getCoalitionsForParty(p.abbreviation);
                        // Only show tag for current governing coalition (Schoof)
                        const current = coalitions.find(c => c.year === 2024);
                        if (!current) return null;
                        return (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-border text-text-tertiary">
                            coalitie
                          </span>
                        );
                      })()}
                    </div>
                    <div className="text-[11px] text-text-tertiary truncate max-w-[180px]">
                      {p.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif text-ink">{seats}</span>
                  <span className="text-[11px] text-text-tertiary ml-0.5">{seats === 1 ? "zetel" : "zetels"}</span>
                </div>
              </div>

              {/* Dual-period MCS scores */}
              {!has23 && !has25 ? (
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary/40" />
                  <span className="text-[11px] text-text-tertiary">
                    {(sc23 || sc25) ? "Onvoldoende data" : "Geen analyse"}
                  </span>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <div className="flex items-center gap-4">
                    {/* TK2023 score */}
                    <div className="flex-1">
                      <div className="text-[10px] text-text-tertiary mb-1">TK2023</div>
                      {has23 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-serif text-ink">{sc23.mandateConsistencyScore}</span>
                          <div className="flex-1 flex h-1.5 rounded-full overflow-hidden gap-px max-w-[60px]">
                            {sc23.consistentCount > 0 && <div className="bg-ink/20" style={{ flex: sc23.consistentCount }} />}
                            {sc23.mixedCount > 0 && <div className="bg-ink/8" style={{ flex: sc23.mixedCount }} />}
                            {sc23.inconsistentCount > 0 && <div className="bg-ink/4" style={{ flex: sc23.inconsistentCount }} />}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-text-tertiary">{"\u2014"}</span>
                      )}
                    </div>

                    {/* TK2025 score */}
                    <div className="flex-1">
                      <div className="text-[10px] text-text-tertiary mb-1">TK2025</div>
                      {has25 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-serif text-ink">{sc25.mandateConsistencyScore}</span>
                          <div className="flex-1 flex h-1.5 rounded-full overflow-hidden gap-px max-w-[60px]">
                            {sc25.consistentCount > 0 && <div className="bg-ink/20" style={{ flex: sc25.consistentCount }} />}
                            {sc25.mixedCount > 0 && <div className="bg-ink/8" style={{ flex: sc25.mixedCount }} />}
                            {sc25.inconsistentCount > 0 && <div className="bg-ink/4" style={{ flex: sc25.inconsistentCount }} />}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-text-tertiary">{"\u2014"}</span>
                      )}
                    </div>

                    {/* Delta indicator */}
                    {has23 && has25 && (() => {
                      const delta = sc25.mandateConsistencyScore - sc23.mandateConsistencyScore;
                      return (
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-text-tertiary mb-1">{"\u0394"}</div>
                          <span className={`text-[13px] font-medium ${
                            delta > 0 ? "text-ink" : delta < 0 ? "text-text-tertiary" : "text-text-secondary"
                          }`}>
                            {delta > 0 ? "+" : ""}{delta}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
