import Link from "next/link";
import { Suspense } from "react";
import { getParties, getAllScorecards } from "../../../../lib/api";
import type { PartyScorecard } from "../../../../lib/types";
import { getPartyColor } from "../../../../lib/utils";
import PartyAvatar from "../../../../components/PartyAvatar";
import { routes } from "../../../../lib/routes";
import PartySortControl from "../../../../components/PartySortControl";
import { getCoalitionsForParty } from "../../../../lib/coalitions";
import { getScoreConfidence } from "../../../../lib/scoring";

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

  // Filter to only parties with seats
  const activeParties = parties.filter((p) => p.seats > 0);

  // Helper: compute delta for a party
  function getDelta(partyId: string): number | null {
    const sc23 = scorecardMap2023.get(partyId);
    const sc25 = scorecardMap2025.get(partyId);
    if (sc23 && sc23.scoredPromises > 0 && sc25 && sc25.scoredPromises > 0) {
      return sc25.mandateConsistencyScore - sc23.mandateConsistencyScore;
    }
    return null;
  }

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
      case "delta": {
        const aDelta = getDelta(a.id) ?? -999;
        const bDelta = getDelta(b.id) ?? -999;
        return bDelta - aDelta; // Higher delta (improvement) first
      }
      case "name":
        return a.abbreviation.localeCompare(b.abbreviation);
      default: // seats
        return b.seats - a.seats;
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
            .sort((a, b) => b.seats - a.seats)
            .map((p) => {
              const color = getPartyColor(p.abbreviation, p.colorNeutral);
              return (
                <Link
                  key={p.id}
                  href={routes.tk.partij(p.abbreviation)}
                  title={`${p.abbreviation}: ${p.seats} ${p.seats === 1 ? "zetel" : "zetels"}`}
                  className="block transition-opacity hover:opacity-100"
                  style={{
                    width: `${(p.seats / 150) * 100}%`,
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
                href={routes.tk.partij(p.abbreviation)}
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

      {/* Data-rich party table */}
      <div className="card overflow-hidden">
        {/* Table header — hidden on mobile */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_60px_80px_80px_60px] lg:grid-cols-[1fr_70px_100px_100px_70px] gap-2 px-5 py-2.5 border-b border-border bg-surface-sub/30 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
          <span>Partij</span>
          <span className="text-right">Zetels</span>
          <span className="text-right">MCS 2023</span>
          <span className="text-right">MCS 2025</span>
          <span className="text-right">{"\u0394"}</span>
        </div>

        {/* Party rows */}
        {sortedParties.map((p, idx) => {
          const color = getPartyColor(p.abbreviation, p.colorNeutral);
          const seats = p.seats;
          const sc23 = scorecardMap2023.get(p.id);
          const sc25 = scorecardMap2025.get(p.id);
          const has23 = sc23 && sc23.scoredPromises > 0;
          const has25 = sc25 && sc25.scoredPromises > 0;
          const delta = getDelta(p.id);
          const coalitions = getCoalitionsForParty(p.abbreviation);

          return (
            <Link
              key={p.id}
              href={routes.tk.partij(p.abbreviation)}
              className={`block hover:bg-surface-sub/40 transition-colors ${
                idx < sortedParties.length - 1 ? "border-b border-border-subtle" : ""
              }`}
            >
              {/* Desktop row */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_60px_80px_80px_60px] lg:grid-cols-[1fr_70px_100px_100px_70px] gap-2 items-center px-5 py-3">
                {/* Party info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <PartyAvatar abbreviation={p.abbreviation} color={color} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-semibold text-ink">{p.abbreviation}</span>
                      {coalitions.map((c) => (
                        <span
                          key={c.year}
                          className="text-[8px] px-1.5 py-px rounded-full border border-border text-text-tertiary leading-tight cursor-help"
                          title={`${c.name} (${c.year}) — ${c.subtitle}\nCoalitiepartijen: ${c.parties.join(", ")}`}
                        >
                          {c.name.replace("Kabinet-", "")}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] text-text-tertiary truncate">{p.name}</div>
                  </div>
                </div>

                {/* Seats */}
                <div className="text-right">
                  <span className="text-[18px] font-serif text-ink">{seats}</span>
                </div>

                {/* MCS 2023 */}
                <div className="text-right">
                  {has23 ? (() => {
                    const conf23 = getScoreConfidence(sc23.scoredPromises, sc23.totalPromises);
                    const muted23 = conf23.level === "onvoldoende" || conf23.level === "laag";
                    return (
                      <div>
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex h-1.5 rounded-full overflow-hidden gap-px w-[40px]">
                            {sc23.consistentCount > 0 && <div className="bg-ink/25" style={{ flex: sc23.consistentCount }} />}
                            {sc23.mixedCount > 0 && <div className="bg-ink/10" style={{ flex: sc23.mixedCount }} />}
                            {sc23.inconsistentCount > 0 && <div className="bg-ink/4" style={{ flex: sc23.inconsistentCount }} />}
                          </div>
                          <span className={`text-[16px] font-serif tabular-nums ${muted23 ? "text-text-tertiary" : "text-ink"}`}>{sc23.mandateConsistencyScore}</span>
                        </div>
                        <div className="text-[10px] text-text-tertiary tabular-nums mt-0.5">{sc23.scoredPromises}/{sc23.totalPromises}</div>
                      </div>
                    );
                  })() : (
                    <span className="text-[12px] text-text-tertiary">{"\u2014"}</span>
                  )}
                </div>

                {/* MCS 2025 */}
                <div className="text-right">
                  {has25 ? (() => {
                    const conf25 = getScoreConfidence(sc25.scoredPromises, sc25.totalPromises);
                    const muted25 = conf25.level === "onvoldoende" || conf25.level === "laag";
                    return (
                      <div>
                        <div className="flex items-center justify-end gap-2">
                          <div className="flex h-1.5 rounded-full overflow-hidden gap-px w-[40px]">
                            {sc25.consistentCount > 0 && <div className="bg-ink/25" style={{ flex: sc25.consistentCount }} />}
                            {sc25.mixedCount > 0 && <div className="bg-ink/10" style={{ flex: sc25.mixedCount }} />}
                            {sc25.inconsistentCount > 0 && <div className="bg-ink/4" style={{ flex: sc25.inconsistentCount }} />}
                          </div>
                          <span className={`text-[16px] font-serif tabular-nums ${muted25 ? "text-text-tertiary" : "text-ink"}`}>{sc25.mandateConsistencyScore}</span>
                        </div>
                        <div className="text-[10px] text-text-tertiary tabular-nums mt-0.5">{sc25.scoredPromises}/{sc25.totalPromises}</div>
                      </div>
                    );
                  })() : (
                    <span className="text-[12px] text-text-tertiary">{"\u2014"}</span>
                  )}
                </div>

                {/* Delta */}
                <div className="text-right">
                  {delta !== null ? (
                    <span className={`text-[13px] font-medium tabular-nums ${
                      delta > 0 ? "text-ink" : delta < 0 ? "text-text-tertiary" : "text-text-secondary"
                    }`}>
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  ) : (
                    <span className="text-[12px] text-text-tertiary">{"\u2014"}</span>
                  )}
                </div>
              </div>

              {/* Mobile card layout */}
              <div className="sm:hidden px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PartyAvatar abbreviation={p.abbreviation} color={color} size="sm" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px] font-semibold text-ink">{p.abbreviation}</span>
                        {coalitions.map((c) => (
                          <span
                            key={c.year}
                            className="text-[9px] px-1.5 py-0.5 rounded-full border border-border text-text-tertiary cursor-help"
                            title={`${c.name} (${c.year}) — ${c.subtitle}\nCoalitiepartijen: ${c.parties.join(", ")}`}
                          >
                            {c.name.replace("Kabinet-", "")}
                          </span>
                        ))}
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

                {/* Mobile MCS row */}
                {(has23 || has25) && (
                  <div className="mt-3 pt-3 border-t border-border-subtle">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-[10px] text-text-tertiary mb-1">TK2023</div>
                        {has23 ? (
                          <span className="text-lg font-serif text-ink">{sc23.mandateConsistencyScore}</span>
                        ) : (
                          <span className="text-[11px] text-text-tertiary">{"\u2014"}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-text-tertiary mb-1">TK2025</div>
                        {has25 ? (
                          <span className="text-lg font-serif text-ink">{sc25.mandateConsistencyScore}</span>
                        ) : (
                          <span className="text-[11px] text-text-tertiary">{"\u2014"}</span>
                        )}
                      </div>
                      {delta !== null && (
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-text-tertiary mb-1">{"\u0394"}</div>
                          <span className={`text-[13px] font-medium ${
                            delta > 0 ? "text-ink" : delta < 0 ? "text-text-tertiary" : "text-text-secondary"
                          }`}>
                            {delta > 0 ? "+" : ""}{delta}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!has23 && !has25 && (
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary/40" />
                    <span className="text-[11px] text-text-tertiary">
                      {(sc23 || sc25) ? "Onvoldoende data" : "Geen analyse"}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
