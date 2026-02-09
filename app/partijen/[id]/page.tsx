import Link from "next/link";
import { getParty, getPartyScorecard } from "../../../lib/api";
import type { PartyScorecard, PromiseScore } from "../../../lib/types";
import { getPartyColor, getInitials } from "../../../lib/utils";
import VoteBar from "../../../components/VoteBar";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const party = await getParty(params.id);
    return { title: `${party.abbreviation} — CivicStat` };
  } catch {
    return { title: "Partij — CivicStat" };
  }
}

const SEATS: Record<string, number> = {
  PVV: 37, "GroenLinks-PvdA": 25, "GL-PvdA": 25, VVD: 24, NSC: 20,
  D66: 9, BBB: 7, CDA: 5, SP: 5, PvdD: 3, ChristenUnie: 3, CU: 3,
  FVD: 3, SGP: 3, DENK: 3, Volt: 2, JA21: 1,
};

export default async function PartyDetailPage({ params }: { params: { id: string } }) {
  let party;
  try {
    party = await getParty(params.id);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <Link href="/partijen" className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-ink mb-5">
          <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Terug naar partijen
        </Link>
        <div className="card p-6 text-sm text-text-secondary">Kon deze partij niet laden.</div>
      </div>
    );
  }

  let scorecard: PartyScorecard | null = null;
  try {
    scorecard = await getPartyScorecard(params.id);
  } catch {
    // Party has no promises — don't show scorecard section
  }

  const color = getPartyColor(party.abbreviation, party.colorNeutral);
  const seats = SEATS[party.abbreviation] || 0;
  const activeMps = party.mps?.filter((m: any) => !m.endDate) || [];
  const vs = party.voteStats;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Back link */}
      <Link href="/partijen" className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-ink mb-6">
        <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        Terug naar partijen
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl text-base font-extrabold shrink-0"
          style={{ backgroundColor: `${color}18`, border: `2px solid ${color}40`, color }}
        >
          {party.abbreviation.slice(0, 3)}
        </div>
        <div>
          <h1 className="font-serif text-[clamp(26px,4vw,34px)] text-ink leading-tight">
            {party.abbreviation}
          </h1>
          <p className="text-sm text-text-secondary mt-1">{party.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {seats > 0 && (
          <div className="card p-4">
            <div className="section-label">Zetels</div>
            <div className="text-2xl font-serif text-ink">{seats}</div>
          </div>
        )}
        <div className="card p-4">
          <div className="section-label">Actieve leden</div>
          <div className="text-2xl font-serif text-ink">{activeMps.length}</div>
        </div>
        {vs && vs.totalVotes > 0 && (
          <>
            <div className="card p-4">
              <div className="section-label">Stemmingen</div>
              <div className="text-2xl font-serif text-ink">{vs.totalVotes}</div>
            </div>
            <div className="card p-4">
              <div className="section-label">Gewonnen</div>
              <div className="text-2xl font-serif text-ink">
                {vs.votesWon != null ? `${Math.round((vs.votesWon / vs.totalVotes) * 100)}%` : "–"}
              </div>
            </div>
          </>
        )}
        {party.startDate && (
          <div className="card p-4">
            <div className="section-label">Opgericht</div>
            <div className="text-lg font-serif text-ink">{new Date(party.startDate).getFullYear()}</div>
          </div>
        )}
      </div>

      {/* Voting pattern */}
      {vs && vs.totalVotes > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Stempatroon</h2>
          <div className="card p-5">
            <VoteBar voor={vs.for} tegen={vs.against} afwezig={vs.abstain || 0} height={12} showLabels />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-sm">
              <div>
                <span className="text-text-tertiary text-xs">Voor</span>
                <div className="text-ink font-semibold">{vs.for} ({Math.round((vs.for / vs.totalVotes) * 100)}%)</div>
              </div>
              <div>
                <span className="text-text-tertiary text-xs">Tegen</span>
                <div className="text-ink font-semibold">{vs.against} ({Math.round((vs.against / vs.totalVotes) * 100)}%)</div>
              </div>
              <div>
                <span className="text-text-tertiary text-xs">Onthouden</span>
                <div className="text-ink font-semibold">{vs.abstain || 0}</div>
              </div>
              {vs.votesWon != null && (
                <div>
                  <span className="text-text-tertiary text-xs">Winnende kant</span>
                  <div className="text-ink font-semibold">{vs.votesWon} van {vs.totalVotes}</div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mandate consistency scorecard */}
      {scorecard && scorecard.scoredPromises > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Belofteconsistentie</h2>

          <div className="card p-5 mb-4">
            {/* Big score + summary */}
            <div className="flex items-start gap-6 mb-5">
              <div className="text-center shrink-0">
                <div className="text-[42px] font-serif text-ink leading-none">
                  {scorecard.mandateConsistencyScore}
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text-secondary mb-3">
                  Van {scorecard.totalPromises} verkiezingsbeloften zijn er{" "}
                  {scorecard.scoredPromises} gekoppeld aan stemmingen.
                </div>
                {/* Consistency bar */}
                <div className="flex h-3 rounded-md overflow-hidden gap-px">
                  {scorecard.consistentCount > 0 && (
                    <div
                      className="bg-ink/15"
                      style={{ flex: scorecard.consistentCount }}
                      title={`Consistent: ${scorecard.consistentCount}`}
                    />
                  )}
                  {scorecard.mixedCount > 0 && (
                    <div
                      className="bg-surface-sub"
                      style={{ flex: scorecard.mixedCount }}
                      title={`Wisselend: ${scorecard.mixedCount}`}
                    />
                  )}
                  {scorecard.inconsistentCount > 0 && (
                    <div
                      className="bg-surface-sub/50"
                      style={{ flex: scorecard.inconsistentCount }}
                      title={`Afwijkend: ${scorecard.inconsistentCount}`}
                    />
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/15" />
                    Consistent ({scorecard.consistentCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-surface-sub border border-border" />
                    Wisselend ({scorecard.mixedCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-surface-sub/50 border border-border" />
                    Afwijkend ({scorecard.inconsistentCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Theme breakdown */}
            {Object.keys(scorecard.byTheme).length > 0 && (
              <div className="border-t border-border pt-4 mb-4">
                <div className="section-label mb-3">Per thema</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(scorecard.byTheme)
                    .sort(([, a], [, b]) => b.total - a.total)
                    .map(([theme, data]) => (
                      <div key={theme} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-surface-sub/40">
                        <span className="text-[12px] text-ink truncate">{themeLabel(theme)}</span>
                        <span className="text-[11px] text-text-tertiary whitespace-nowrap">
                          {data.consistent}/{data.total}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Promise list */}
            {scorecard.promises && scorecard.promises.length > 0 && (
              <div className="border-t border-border pt-4">
                <div className="section-label mb-3">Individuele beloften</div>
                <div className="space-y-1">
                  {scorecard.promises.map((ps) => (
                    <Link
                      key={ps.promiseId}
                      href={`/beloften/${encodeURIComponent(ps.promiseCode)}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-sub/60 transition-colors"
                    >
                      <span className="text-sm shrink-0">{statusIcon(ps.status)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-ink truncate">{ps.summary}</div>
                        <div className="flex items-center gap-2 text-[11px] text-text-tertiary mt-0.5">
                          <span className="font-mono">{ps.promiseCode}</span>
                          <span>·</span>
                          <span>{themeLabel(ps.theme)}</span>
                        </div>
                      </div>
                      {ps.totalMotionsWithVotes > 0 && (
                        <span className="text-[11px] text-text-tertiary shrink-0">
                          {ps.alignedVotes}/{ps.totalMotionsWithVotes}
                        </span>
                      )}
                      <span className={`text-[10px] rounded-full px-2 py-0.5 border shrink-0 ${statusBadgeClass(ps.status)}`}>
                        {statusLabel(ps.status)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Methodology */}
            <div className="border-t border-border pt-3 mt-4">
              <details className="text-xs text-text-tertiary">
                <summary className="cursor-pointer hover:text-text-secondary underline underline-offset-2">
                  Methodologie
                </summary>
                <p className="mt-2 max-w-lg leading-relaxed">
                  De consistentiescore is gebaseerd op de verhouding tussen stemgedrag en
                  verkiezingsbeloften. Per belofte wordt gekeken of de partij in de verwachte richting
                  stemde bij gerelateerde moties. Score: consistent (≥60% aligned), wisselend (40-60%),
                  afwijkend (≤40%). Moties worden gekoppeld via trefwoordanalyse (keyword-overlap-v1).
                </p>
              </details>
            </div>
          </div>
        </section>
      )}

      {/* Members */}
      {activeMps.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-ink mb-4">Kamerleden ({activeMps.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeMps.sort((a: any, b: any) => a.surname.localeCompare(b.surname)).map((mp: any) => (
              <Link key={mp.id} href={`/kamerleden/${mp.id}`} className="card p-4 hover:border-moss/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-ink shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${color}18, ${color}38)`,
                      border: `2px solid ${color}33`,
                    }}
                  >
                    {getInitials(mp.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">{mp.surname}</div>
                    <div className="text-[11px] text-text-tertiary truncate">{mp.name}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

function themeLabel(theme: string): string {
  const map: Record<string, string> = {
    BESTUUR: "Bestuur", BUITENLAND: "Buitenland", DEFENSIE: "Defensie",
    ECONOMIE: "Economie", KLIMAAT: "Klimaat", LANDBOUW: "Landbouw",
    MIGRATIE: "Migratie", ONDERWIJS: "Onderwijs", SOCIAAL: "Sociaal",
    VEILIGHEID: "Veiligheid", WONEN: "Wonen", ZORG: "Zorg",
  };
  return map[theme] || theme;
}

function statusIcon(status: PromiseScore["status"]): string {
  switch (status) {
    case "consistent": return "●";
    case "mixed": return "◐";
    case "inconsistent": return "○";
    default: return "·";
  }
}

function statusLabel(status: PromiseScore["status"]): string {
  switch (status) {
    case "consistent": return "Consistent";
    case "mixed": return "Wisselend";
    case "inconsistent": return "Afwijkend";
    default: return "Onvoldoende data";
  }
}

function statusBadgeClass(status: PromiseScore["status"]): string {
  switch (status) {
    case "consistent": return "text-ink border-ink/20 bg-ink/5";
    case "mixed": return "text-text-secondary border-border bg-surface-sub";
    case "inconsistent": return "text-text-tertiary border-border bg-surface-sub/50";
    default: return "text-text-tertiary border-border-subtle bg-transparent";
  }
}
