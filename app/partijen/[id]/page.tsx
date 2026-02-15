import Link from "next/link";
import { Suspense } from "react";
import { getParty, getPartyScorecard, getScorecardYears, getKoersvastheid, getRegeerakkoordScorecard, getCoalitieverwatering } from "../../../lib/api";
import type { PartyScorecard, KoersvastheidResponse, PromiseScore, CoalitieverwateringResponse } from "../../../lib/types";
import { getPartyColor } from "../../../lib/utils";
import VoteBar from "../../../components/VoteBar";
import MethodologyLink from "../../../components/MethodologyLink";
import PeriodSelector from "../../../components/PeriodSelector";
import Term from "../../../components/Term";
import PartyAvatar from "../../../components/PartyAvatar";
import MemberPhoto from "../../../components/MemberPhoto";
import { getCoalitionsForParty, COALITIONS } from "../../../lib/coalitions";
import type { Coalition } from "../../../lib/coalitions";
import PartyBadge from "../../../components/PartyBadge";
import ConfidenceBadge from "../../../components/ConfidenceBadge";
import { getScoreConfidence } from "../../../lib/scoring";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const party = await getParty(params.id);
    return { title: `${party.abbreviation} — CivicStat` };
  } catch {
    return { title: "Partij — CivicStat" };
  }
}

export default async function PartyDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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

  // Determine selected period (default: 2023)
  const jaarParam = typeof searchParams.jaar === "string" ? parseInt(searchParams.jaar) : 2023;
  const activeYear = [2023, 2025].includes(jaarParam) ? jaarParam : 2023;
  const availableYears = [2023, 2025];

  let scorecard: PartyScorecard | null = null;
  try {
    scorecard = await getPartyScorecard(params.id, { year: activeYear });
  } catch {
    // Party has no promises — don't show scorecard section
  }

  // Fetch the OTHER year's scorecard too (for comparison)
  const otherYear = activeYear === 2023 ? 2025 : 2023;
  let otherScorecard: PartyScorecard | null = null;
  try {
    otherScorecard = await getPartyScorecard(params.id, { year: otherYear });
  } catch {}

  // Fetch koersvastheid for comparison
  let koersvastheid: KoersvastheidResponse | null = null;
  try {
    koersvastheid = await getKoersvastheid(params.id);
  } catch {
    // Not available yet
  }

  // Fetch regeerakkoord data for coalition parties
  const coalitions = getCoalitionsForParty(party.abbreviation);
  let coalitionData: { coalition: Coalition; regeerakkoord: PartyScorecard | null; verwatering: CoalitieverwateringResponse | null }[] = [];

  if (coalitions.length > 0) {
    coalitionData = await Promise.all(
      coalitions.map(async (c) => {
        const [regeerakkoord, verwatering] = await Promise.all([
          getRegeerakkoordScorecard(params.id, { year: c.year }),
          getCoalitieverwatering(params.id, { year: c.year }),
        ]);
        return { coalition: c, regeerakkoord, verwatering };
      }),
    );
  }

  const color = getPartyColor(party.abbreviation, party.colorNeutral);
  const seats = party.seats ?? 0;
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
        <PartyAvatar abbreviation={party.abbreviation} color={color} size="md" showColor />
        <div>
          <h1 className="font-serif text-[clamp(26px,4vw,34px)] text-ink leading-tight">
            {party.abbreviation}
          </h1>
          <p className="text-sm text-text-secondary mt-1">{party.name}</p>
          {coalitions.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {coalitions.map((c) => (
                <span key={c.year} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-text-tertiary">
                  Coalitie {c.name}
                </span>
              ))}
            </div>
          )}
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

      {/* Period comparison overview — only when both periods have data */}
      {scorecard && scorecard.scoredPromises > 0 && otherScorecard && otherScorecard.scoredPromises > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Vergelijking verkiezingsperiodes</h2>
          <div className="card p-5">
            <div className="grid grid-cols-2 gap-6 mb-5">
              {[
                activeYear === 2023 ? scorecard : otherScorecard,
                activeYear === 2025 ? scorecard : otherScorecard,
              ].map((sc, i) => {
                const year = i === 0 ? 2023 : 2025;
                const isActive = year === activeYear;
                return (
                  <div key={year} className={`text-center ${isActive ? "" : "opacity-60"}`}>
                    <div className="text-[11px] font-medium text-text-tertiary mb-2">TK{year}</div>
                    <div className="text-[36px] font-serif text-ink leading-none">
                      {sc.mandateConsistencyScore}
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-1">
                      {sc.scoredPromises}/{sc.totalPromises} beloften
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden gap-px mt-3 mx-auto max-w-[120px]">
                      {sc.consistentCount > 0 && <div className="bg-ink/30" style={{ flex: sc.consistentCount }} />}
                      {sc.mixedCount > 0 && <div className="bg-ink/12" style={{ flex: sc.mixedCount }} />}
                      {sc.inconsistentCount > 0 && <div className="bg-ink/4 border border-border/50" style={{ flex: sc.inconsistentCount }} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {(() => {
              const sc2023 = activeYear === 2023 ? scorecard : otherScorecard;
              const sc2025 = activeYear === 2025 ? scorecard : otherScorecard;
              const delta = sc2025!.mandateConsistencyScore - sc2023!.mandateConsistencyScore;
              return (
                <div className="flex items-center justify-center gap-2 py-3 border-t border-border">
                  <span className="text-[12px] text-text-tertiary">Verschil:</span>
                  <span className={`text-sm font-semibold ${
                    delta > 0 ? "text-ink" : delta < 0 ? "text-text-tertiary" : "text-text-secondary"
                  }`}>
                    {delta > 0 ? "+" : ""}{delta} punt{Math.abs(delta) !== 1 ? "en" : ""}
                  </span>
                  <span className="text-[12px] text-text-tertiary">
                    {delta > 5 ? "(consistenter geworden)" :
                     delta < -5 ? "(minder consistent)" :
                     "(stabiel)"}
                  </span>
                </div>
              );
            })()}

            {koersvastheid && koersvastheid.koersvastheid !== null && (
              <div className="flex items-center justify-center gap-2 pt-2 text-[12px] text-text-tertiary">
                Koersvastheid: <span className="font-semibold text-ink">{Math.round(koersvastheid.koersvastheid)}%</span>
              </div>
            )}
          </div>
        </section>
      )}

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-ink">Belofteconsistentie</h2>
            <Suspense fallback={null}>
              <PeriodSelector years={availableYears} activeYear={activeYear} />
            </Suspense>
          </div>

          <div className="card p-5 mb-4">
            {/* Big score + summary */}
            <div className="flex items-start gap-6 mb-5">
              <div className="text-center shrink-0">
                <div className="text-[42px] font-serif text-ink leading-none">
                  {scorecard.mandateConsistencyScore}
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
                <div className={`text-[10px] mt-1.5 font-medium ${
                  scorecard.mandateConsistencyScore >= 70
                    ? "text-ink"
                    : scorecard.mandateConsistencyScore >= 40
                      ? "text-text-secondary"
                      : "text-text-tertiary"
                }`}>
                  {scorecard.mandateConsistencyScore >= 70
                    ? "Hoog"
                    : scorecard.mandateConsistencyScore >= 40
                      ? "Gemiddeld"
                      : "Laag"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <ConfidenceBadge scored={scorecard.scoredPromises} total={scorecard.totalPromises} />
                </div>
                <div className="text-sm text-text-secondary mb-3">
                  {scorecard.note || `Score gebaseerd op ${scorecard.scoredPromises} van ${scorecard.totalPromises} beloften met voldoende stemdata`}
                  {(scorecard.insufficientDataPromises ?? 0) > 0 && (
                    <span className="text-text-tertiary">
                      {" "}({scorecard.insufficientDataPromises} beloften: onvoldoende data)
                    </span>
                  )}
                </div>
                {/* Consistency bar */}
                <div className="flex h-3 rounded-md overflow-hidden gap-px">
                  {scorecard.consistentCount > 0 && (
                    <div
                      className="bg-ink/30 dark:bg-white/30"
                      style={{ flex: scorecard.consistentCount }}
                      title={`Consistent: ${scorecard.consistentCount}`}
                    />
                  )}
                  {scorecard.mixedCount > 0 && (
                    <div
                      className="bg-ink/12 dark:bg-white/12"
                      style={{ flex: scorecard.mixedCount }}
                      title={`Wisselend: ${scorecard.mixedCount}`}
                    />
                  )}
                  {scorecard.inconsistentCount > 0 && (
                    <div
                      className="bg-ink/4 dark:bg-white/4 border border-border/50"
                      style={{ flex: scorecard.inconsistentCount }}
                      title={`Afwijkend: ${scorecard.inconsistentCount}`}
                    />
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/30 dark:bg-white/30" />
                    <Term definition="Het stemgedrag komt in ≥70% van de gerelateerde moties overeen met de belofte.">Consistent</Term> ({scorecard.consistentCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/12 dark:bg-white/12" />
                    <Term definition="Het stemgedrag komt in 40-70% van de gerelateerde moties overeen met de belofte.">Wisselend</Term> ({scorecard.mixedCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/4 dark:bg-white/4 border border-border/50" />
                    <Term definition="Het stemgedrag wijkt in >60% van de gerelateerde moties af van de belofte.">Afwijkend</Term> ({scorecard.inconsistentCount})
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
                  De consistentiescore is gebaseerd op de gewogen verhouding tussen stemgedrag en
                  verkiezingsbeloften. Per belofte wordt gekeken of de partij in de verwachte richting
                  stemde bij gerelateerde moties. Het gewicht van elke motie-koppeling is afhankelijk van
                  het matchtype (direct=1.0, impliciet=0.5) en de betrouwbaarheidsscore.
                  Score: consistent ({"\u2265"}70%), wisselend (30-70%), afwijkend ({"\u2264"}30%).
                  Beloften met minder dan 3 gerelateerde moties krijgen geen score.
                  Moties worden gekoppeld via trefwoordanalyse (keyword-overlap-v2).
                </p>
              </details>
              <MethodologyLink />
            </div>
          </div>
        </section>
      )}

      {/* No-promises info */}
      {(!scorecard || scorecard.scoredPromises === 0) && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-ink">Belofteconsistentie</h2>
            <Suspense fallback={null}>
              <PeriodSelector years={availableYears} activeYear={activeYear} />
            </Suspense>
          </div>
          <div className="card px-5 py-6 text-center">
            <p className="text-sm text-text-secondary">
              Voor {party.abbreviation} zijn nog geen beloften geanalyseerd voor TK{activeYear}.
            </p>
            <p className="text-xs text-text-tertiary mt-2">
              Zodra beloften zijn geëxtraheerd en gekoppeld aan moties, verschijnt hier de consistentiescore.
            </p>
          </div>
        </section>
      )}

      {/* Koersvastheid (cross-period comparison) */}
      {koersvastheid && koersvastheid.koersvastheid !== null && koersvastheid.periods.length >= 2 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Koersvastheid</h2>
          <div className="card p-5">
            <div className="flex items-start gap-6 mb-4">
              <div className="text-center shrink-0">
                <div className="text-[42px] font-serif text-ink leading-none">
                  {Math.round(koersvastheid.koersvastheid)}
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
                <div className={`text-[10px] mt-1.5 font-medium ${
                  koersvastheid.koersvastheid >= 70
                    ? "text-ink"
                    : koersvastheid.koersvastheid >= 40
                      ? "text-text-secondary"
                      : "text-text-tertiary"
                }`}>
                  {koersvastheid.koersvastheid >= 80
                    ? "Zeer stabiel"
                    : koersvastheid.koersvastheid >= 60
                      ? "Stabiel"
                      : koersvastheid.koersvastheid >= 40
                        ? "Wisselend"
                        : "Instabiel"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-secondary mb-3">
                  <Term definition="Koersvastheid meet hoe consistent een partij scoort over meerdere verkiezingsperiodes. 100 = identieke score, 0 = maximaal verschil.">
                    Koersvastheid
                  </Term>{" "}
                  vergelijkt de belofteconsistentie van {party.abbreviation} over meerdere verkiezingsperiodes.
                </p>
                {/* Period scores */}
                <div className="flex gap-3">
                  {koersvastheid.periods.map((p) => (
                    <div key={p.electionYear} className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-sub/40">
                      <span className="text-[12px] font-medium text-ink">TK{p.electionYear}</span>
                      <span className="text-[18px] font-serif text-ink">{p.mandateConsistencyScore}</span>
                      <span className="text-[11px] text-text-tertiary">/ 100</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme stability breakdown */}
            {Object.keys(koersvastheid.themeStability).length > 0 && (
              <div className="border-t border-border pt-4">
                <div className="section-label mb-3">Stabiliteit per thema</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(koersvastheid.themeStability)
                    .sort(([, a], [, b]) => b - a)
                    .map(([theme, stability]) => (
                      <div key={theme} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-surface-sub/40">
                        <span className="text-[12px] text-ink truncate">{themeLabel(theme)}</span>
                        <span className={`text-[11px] font-medium ${
                          stability >= 80 ? "text-ink" : stability >= 50 ? "text-text-secondary" : "text-text-tertiary"
                        }`}>
                          {Math.round(stability)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-3 mt-4">
              <p className="text-[11px] text-text-tertiary">
                Formule: koersvastheid = 100 − |MCS(TK2023) − MCS(TK2025)|.
                Een hoge score betekent dat de partij in beide periodes vergelijkbaar scoort.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Regeerakkoord + Coalitieverwatering — per coalition */}
      {coalitionData.map(({ coalition, regeerakkoord: regSc, verwatering: cv }) => {
        if (!regSc && !cv) return null;
        const coalitionParties = COALITIONS.find(c => c.year === coalition.year)?.parties ?? [];
        return (
          <section key={`coalition-${coalition.year}`} className="mb-8">
            {/* Section header */}
            <div className="mb-4">
              <h2 className="font-serif text-xl text-ink">
                Regeerakkoord {"\u00B7"} {coalition.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-[12px] text-text-tertiary italic">{coalition.subtitle}</span>
                <span className="text-text-tertiary text-[10px]">{"\u00B7"}</span>
                {coalitionParties.map((abbr) => (
                  <PartyBadge key={abbr} abbreviation={abbr} colorNeutral={null} size="sm" />
                ))}
              </div>
              <p className="text-[13px] text-text-secondary mt-1.5">
                Hoe consistent stemt {party.abbreviation} met het regeerakkoord?
              </p>
            </div>

            {/* Regeerakkoord-consistentie card */}
            {regSc && regSc.scoredPromises > 0 ? (
              <div className="card p-5 mb-4">
                <div className="section-label mb-3">Regeerakkoord-consistentie</div>
                <div className="flex items-start gap-6 mb-4">
                  <div className="text-center shrink-0">
                    <div className="text-[42px] font-serif text-ink leading-none">
                      {regSc.mandateConsistencyScore}
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary mb-3">
                      {regSc.scoredPromises} van {regSc.totalPromises} akkoordpunten consistent vertaald in stemgedrag.
                      {(regSc.insufficientDataPromises ?? 0) > 0 && (
                        <span className="text-text-tertiary">
                          {" "}({regSc.insufficientDataPromises} met onvoldoende data)
                        </span>
                      )}
                    </p>
                    <div className="flex h-3 rounded-md overflow-hidden gap-px">
                      {regSc.consistentCount > 0 && (
                        <div className="bg-ink/30" style={{ flex: regSc.consistentCount }} title={`Consistent: ${regSc.consistentCount}`} />
                      )}
                      {regSc.mixedCount > 0 && (
                        <div className="bg-ink/12" style={{ flex: regSc.mixedCount }} title={`Wisselend: ${regSc.mixedCount}`} />
                      )}
                      {regSc.inconsistentCount > 0 && (
                        <div className="bg-ink/4 border border-border/50" style={{ flex: regSc.inconsistentCount }} title={`Afwijkend: ${regSc.inconsistentCount}`} />
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-ink/30" />
                        Consistent ({regSc.consistentCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-ink/12" />
                        Wisselend ({regSc.mixedCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-ink/4 border border-border/50" />
                        Afwijkend ({regSc.inconsistentCount})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-[11px] text-text-tertiary">
                    Het regeerakkoord bevat afspraken tussen coalitiepartijen.
                    Deze score meet of {party.abbreviation} stemt in lijn met die afspraken.
                  </p>
                </div>
              </div>
            ) : regSc ? (
              <div className="card px-5 py-4 mb-4">
                <div className="flex items-center gap-2 text-[13px] text-text-tertiary italic">
                  <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  Akkoordpunten worden momenteel gekoppeld aan moties. Data volgt binnenkort.
                </div>
              </div>
            ) : null}

            {/* Coalitieverwatering card */}
            {cv && cv.totalPartyPromises > 0 && (
              <div className="card p-5">
                <div className="section-label mb-3">
                  <Term definition="Welk deel van de partijbeloften overleefde de coalitieonderhandelingen?">
                    Coalitieverwatering
                  </Term>
                </div>
                <div className="flex items-start gap-6 mb-4">
                  <div className="text-center shrink-0">
                    <div className="text-[42px] font-serif text-ink leading-none">
                      {Math.round(cv.dilutionRate)}%
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-1">verwatering</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary mb-3">
                      Van de {cv.totalPartyPromises} verkiezingsbeloften van {party.abbreviation} zijn
                      er {cv.survivedCount} herkenbaar terug te vinden in het regeerakkoord.
                      {cv.dilutedCount > 0 && ` ${cv.dilutedCount} beloften zijn niet overgenomen.`}
                    </p>
                    <div className="flex h-3 rounded-md overflow-hidden gap-px">
                      {cv.survivedCount > 0 && (
                        <div className="bg-ink/30" style={{ flex: cv.survivedCount }} title={`Overgenomen: ${cv.survivedCount}`} />
                      )}
                      {cv.dilutedCount > 0 && (
                        <div className="bg-ink/4 border border-border/50" style={{ flex: cv.dilutedCount }} title={`Niet overgenomen: ${cv.dilutedCount}`} />
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-ink/30" />
                        Overgenomen ({cv.survivedCount})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-ink/4 border border-border/50" />
                        Niet overgenomen ({cv.dilutedCount})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-[11px] text-text-tertiary">
                    De verwateringsscore is gebaseerd op trefwoordoverlap tussen partijprogramma en regeerakkoord.
                  </p>
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* Fractieleden photo grid */}
      {activeMps.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-ink mb-4">Fractieleden ({activeMps.length})</h2>
          <div className="flex flex-wrap gap-3.5">
            {activeMps.sort((a: any, b: any) => a.surname.localeCompare(b.surname)).map((mp: any) => (
              <Link
                key={mp.id}
                href={`/kamerleden/${mp.id}`}
                className="flex flex-col items-center gap-1.5 w-[68px] group"
              >
                <MemberPhoto tkId={mp.tkId} name={mp.name} size="md" color={color} />
                <span className="text-[11px] text-text-secondary text-center truncate max-w-[68px] group-hover:text-ink transition-colors">
                  {mp.surname}
                </span>
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
