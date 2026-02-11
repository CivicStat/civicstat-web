import Link from "next/link";
import { getParties, getAllScorecards } from "../../lib/api";
import type { PartyScorecard } from "../../lib/types";
import { getPartyColor } from "../../lib/utils";
import { TK_SEATS } from "../../lib/seats";

export const revalidate = 3600; // ISR: re-generate at most every hour

export const metadata = { title: "Partijen — CivicStat" };

export default async function PartijenPage() {
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

  // Fetch scorecards (non-blocking — don't break page if it fails)
  let scorecardMap = new Map<string, PartyScorecard>();
  try {
    const scorecards = await getAllScorecards();
    for (const sc of scorecards) {
      scorecardMap.set(sc.partyId, sc);
    }
  } catch {
    // Scorecards unavailable — continue without them
  }

  // Filter to only parties with known seats, sorted by seats desc
  const activeParties = parties
    .filter((p) => TK_SEATS[p.abbreviation])
    .sort((a, b) => (TK_SEATS[b.abbreviation] || 0) - (TK_SEATS[a.abbreviation] || 0));

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Partijen
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-6">
        Fracties in de Tweede Kamer met zetelverdeling en stemgedrag.
      </p>

      {/* Seat distribution bar */}
      <div className="card p-[18px] mb-6">
        <div className="section-label">Zetelverdeling (150 zetels)</div>
        <div className="flex h-7 rounded-md overflow-hidden gap-px">
          {activeParties.map((p) => {
            const seats = TK_SEATS[p.abbreviation] || 0;
            const color = getPartyColor(p.abbreviation, p.colorNeutral);
            return (
              <div
                key={p.id}
                title={`${p.abbreviation}: ${seats} zetels`}
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
          {activeParties.slice(0, 7).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-1 text-[11px] text-text-secondary"
            >
              <span
                className="w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: getPartyColor(
                    p.abbreviation,
                    p.colorNeutral
                  ),
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
        {activeParties.map((p) => {
          const color = getPartyColor(p.abbreviation, p.colorNeutral);
          const seats = TK_SEATS[p.abbreviation] || 0;

          return (
            <Link key={p.id} href={`/partijen/${encodeURIComponent(p.abbreviation)}`} className="card p-[18px] hover:border-moss/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-extrabold"
                    style={{
                      backgroundColor: `${color}18`,
                      border: `2px solid ${color}40`,
                      color: color,
                    }}
                  >
                    {p.abbreviation.slice(0, 3)}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-ink">
                      {p.abbreviation}
                    </div>
                    <div className="text-[11px] text-text-tertiary truncate max-w-[180px]">
                      {p.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif text-ink">{seats}</span>
                  <span className="text-[11px] text-text-tertiary ml-0.5">
                    zetels
                  </span>
                </div>
              </div>
              {p._count?.mps > 0 && (
                <div className="mt-2 text-[11px] text-text-tertiary">
                  {p._count.mps} leden in database
                </div>
              )}
              {(() => {
                const sc = scorecardMap.get(p.id);
                if (!sc || sc.scoredPromises === 0) {
                  return (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary/40" />
                      <span className="text-[11px] text-text-tertiary">Geen analyse</span>
                    </div>
                  );
                }
                return (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-moss shrink-0" />
                    <span className="text-[11px] text-text-tertiary">
                      Consistentie: {sc.mandateConsistencyScore}%
                    </span>
                    <div className="flex-1 flex h-1.5 rounded-full overflow-hidden gap-px max-w-[80px]">
                      {sc.consistentCount > 0 && (
                        <div className="bg-ink/20" style={{ flex: sc.consistentCount }} />
                      )}
                      {sc.mixedCount > 0 && (
                        <div className="bg-ink/8" style={{ flex: sc.mixedCount }} />
                      )}
                      {sc.inconsistentCount > 0 && (
                        <div className="bg-ink/4" style={{ flex: sc.inconsistentCount }} />
                      )}
                    </div>
                  </div>
                );
              })()}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
