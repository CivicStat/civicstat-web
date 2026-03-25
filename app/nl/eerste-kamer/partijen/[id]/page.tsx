import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getParliament,
  getScopedParties,
  getScopedScorecard,
  getScopedPromiseStats,
  getAllScorecards,
} from "../../../../../lib/api";
import type { PartyScorecard } from "../../../../../lib/types";
import { getPartyColor, themeLabel } from "../../../../../lib/utils";
import PartyAvatar from "../../../../../components/PartyAvatar";
import ConfidenceBadge from "../../../../../components/ConfidenceBadge";
import MethodologyLink from "../../../../../components/MethodologyLink";
import Term from "../../../../../components/Term";
import { routes } from "../../../../../lib/routes";

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

const SLUG = "eerste-kamer";

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const parties = await getScopedParties(SLUG);
    const party = parties.find(
      (p) =>
        p.id === id ||
        p.abbreviation.toLowerCase() === decodeURIComponent(id).toLowerCase(),
    );
    if (party) {
      return {
        title: `${party.abbreviation} — Eerste Kamer — CivicStat`,
        description: `${party.name} in de Eerste Kamer.`,
      };
    }
    return { title: "Partij — Eerste Kamer — CivicStat" };
  } catch {
    return { title: "Partij — Eerste Kamer — CivicStat" };
  }
}

export default async function EKPartyDetailPage({ params }: Props) {
  const { id } = await params;

  let parliament;
  try {
    parliament = await getParliament(SLUG);
  } catch {
    notFound();
  }

  let parties;
  try {
    parties = await getScopedParties(SLUG);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API.
        </div>
      </div>
    );
  }

  const decodedId = decodeURIComponent(id);
  const party = parties.find(
    (p) =>
      p.id === decodedId ||
      p.abbreviation.toLowerCase() === decodedId.toLowerCase(),
  );

  if (!party) {
    notFound();
  }

  // Fetch scorecard and TK scorecards in parallel
  let scorecard: PartyScorecard | null = null;
  let tkScorecards: Omit<PartyScorecard, "promises">[] = [];

  const [scorecardResult, tkScorecardsResult] = await Promise.allSettled([
    getScopedScorecard(SLUG, party.id),
    getAllScorecards({ year: 2023 }),
  ]);

  if (scorecardResult.status === "fulfilled") scorecard = scorecardResult.value;
  if (tkScorecardsResult.status === "fulfilled") tkScorecards = tkScorecardsResult.value;

  // TK cross-reference: find matching TK party
  const tkScorecard = tkScorecards.find(
    (s) => s.abbreviation.toLowerCase() === party.abbreviation.toLowerCase(),
  ) ?? null;

  const color = getPartyColor(party.abbreviation, party.colorNeutral);
  const seats = party.seats ?? 0;
  const totalSeats = parliament.seats;
  const hasScore = scorecard && scorecard.scoredPromises > 0;

  // Prev/next navigation
  const sortedParties = [...parties]
    .filter((p) => p.seats > 0)
    .sort((a, b) => b.seats - a.seats);
  const currentIdx = sortedParties.findIndex((p) => p.id === party.id);
  const prevParty = currentIdx > 0 ? sortedParties[currentIdx - 1] : null;
  const nextParty =
    currentIdx >= 0 && currentIdx < sortedParties.length - 1
      ? sortedParties[currentIdx + 1]
      : null;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Breadcrumbs + prev/next */}
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[11px] text-text-tertiary flex items-center gap-1.5">
          <Link href="/" className="hover:text-moss transition-colors">Home</Link>
          <span>/</span>
          <Link href={routes.ek.root} className="hover:text-moss transition-colors">Eerste Kamer</Link>
          <span>/</span>
          <Link href={routes.ek.partijen} className="hover:text-moss transition-colors">Partijen</Link>
          <span>/</span>
          <span className="text-ink font-medium">{party.abbreviation}</span>
        </nav>
        <div className="flex items-center gap-2">
          {prevParty ? (
            <Link
              href={routes.ek.partij(prevParty.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
            >
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {prevParty.abbreviation}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[12px] text-text-tertiary opacity-40">
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
          )}
          {nextParty ? (
            <Link
              href={routes.ek.partij(nextParty.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
            >
              {nextParty.abbreviation}
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[12px] text-text-tertiary opacity-40">
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <PartyAvatar abbreviation={party.abbreviation} color={color} size="md" showColor />
        <div>
          <h1 className="font-serif text-[clamp(26px,4vw,34px)] text-ink leading-tight">
            {party.abbreviation}
          </h1>
          <p className="text-sm text-text-secondary mt-1">{party.name}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {seats > 0 && (
          <div className="card p-4">
            <div className="section-label">Zetels</div>
            <div className="text-2xl font-serif text-ink">{seats}</div>
            {totalSeats > 0 && (
              <div className="text-[11px] text-text-tertiary mt-0.5">
                van {totalSeats}
              </div>
            )}
          </div>
        )}
        <div className="card p-4">
          <div className="section-label">Senatoren</div>
          <div className="text-2xl font-serif text-ink">{party._count.mps}</div>
        </div>
        {hasScore && (
          <div className="card p-4">
            <div className="section-label">
              <Term definition="De Mandate Consistency Score (MCS) meet hoe consistent een partij stemt in lijn met haar verkiezingsbeloften. 100 = volledig consistent.">
                MCS
              </Term>
            </div>
            <div className="text-2xl font-serif text-ink">
              {scorecard!.mandateConsistencyScore}
            </div>
            <div className="text-[11px] text-text-tertiary mt-0.5">van 100</div>
          </div>
        )}
      </div>

      {/* Seat proportion bar */}
      {seats > 0 && totalSeats > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Zetelverdeling</h2>
          <div className="card p-5">
            <div className="flex h-7 rounded-md overflow-hidden gap-px">
              {sortedParties.map((p) => {
                const pColor = getPartyColor(p.abbreviation, p.colorNeutral);
                const isThis = p.id === party.id;
                return (
                  <div
                    key={p.id}
                    title={`${p.abbreviation}: ${p.seats} ${p.seats === 1 ? "zetel" : "zetels"}`}
                    className="block transition-opacity"
                    style={{
                      width: `${(p.seats / totalSeats) * 100}%`,
                      backgroundColor: pColor,
                      opacity: isThis ? 1 : 0.25,
                      minWidth: p.seats > 1 ? 4 : 2,
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-3 text-[12px] text-text-secondary">
              <span className="font-semibold text-ink">{party.abbreviation}</span>{" "}
              heeft {seats} van {totalSeats} zetels ({Math.round((seats / totalSeats) * 100)}%)
            </div>
          </div>
        </section>
      )}

      {/* Belofteconsistentie */}
      {hasScore && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-1">Belofteconsistentie</h2>
          <div className="text-[12px] text-text-tertiary mb-3">
            Eerste Kamer — Verkiezingsbeloften {scorecard!.electionYear}
          </div>

          <div className="card p-5 mb-4">
            <div className="flex items-start gap-6 mb-5">
              <div className="text-center shrink-0">
                <div className="text-[42px] font-serif text-ink leading-none">
                  {scorecard!.mandateConsistencyScore}
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
                <div
                  className={`text-[10px] mt-1.5 font-medium ${
                    scorecard!.mandateConsistencyScore >= 70
                      ? "text-ink"
                      : scorecard!.mandateConsistencyScore >= 40
                        ? "text-text-secondary"
                        : "text-text-tertiary"
                  }`}
                >
                  {scorecard!.mandateConsistencyScore >= 70
                    ? "Hoog"
                    : scorecard!.mandateConsistencyScore >= 40
                      ? "Gemiddeld"
                      : "Laag"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <ConfidenceBadge
                    scored={scorecard!.scoredPromises}
                    total={scorecard!.totalPromises}
                  />
                </div>
                <div className="text-sm text-text-secondary mb-3">
                  Score gebaseerd op {scorecard!.scoredPromises} van {scorecard!.totalPromises} beloften
                  met voldoende stemdata
                  {(scorecard!.insufficientDataPromises ?? 0) > 0 && (
                    <span className="text-text-tertiary">
                      {" "}({scorecard!.insufficientDataPromises} beloften: onvoldoende data)
                    </span>
                  )}
                </div>
                {/* Consistency bar */}
                <div className="flex h-3 rounded-md overflow-hidden gap-px">
                  {scorecard!.consistentCount > 0 && (
                    <div
                      className="bg-ink/30 dark:bg-white/30"
                      style={{ flex: scorecard!.consistentCount }}
                      title={`Consistent: ${scorecard!.consistentCount}`}
                    />
                  )}
                  {scorecard!.mixedCount > 0 && (
                    <div
                      className="bg-ink/12 dark:bg-white/12"
                      style={{ flex: scorecard!.mixedCount }}
                      title={`Wisselend: ${scorecard!.mixedCount}`}
                    />
                  )}
                  {scorecard!.inconsistentCount > 0 && (
                    <div
                      className="bg-ink/4 dark:bg-white/4 border border-border/50"
                      style={{ flex: scorecard!.inconsistentCount }}
                      title={`Afwijkend: ${scorecard!.inconsistentCount}`}
                    />
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/30 dark:bg-white/30" />
                    <Term definition="Het stemgedrag komt in 70% of meer van de gerelateerde moties overeen met de belofte.">Consistent</Term>{" "}
                    ({scorecard!.consistentCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/12 dark:bg-white/12" />
                    <Term definition="Het stemgedrag komt in 40-70% van de gerelateerde moties overeen met de belofte.">Wisselend</Term>{" "}
                    ({scorecard!.mixedCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/4 dark:bg-white/4 border border-border/50" />
                    <Term definition="Het stemgedrag wijkt in meer dan 60% van de gerelateerde moties af van de belofte.">Afwijkend</Term>{" "}
                    ({scorecard!.inconsistentCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Theme breakdown */}
            {scorecard!.byTheme && Object.keys(scorecard!.byTheme).length > 0 && (
              <div className="border-t border-border pt-4 mb-4">
                <div className="section-label mb-3">Per thema</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(scorecard!.byTheme)
                    .sort(([, a], [, b]) => b.total - a.total)
                    .map(([theme, data]) => (
                      <div
                        key={theme}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-surface-sub/40"
                      >
                        <span className="text-[12px] text-ink truncate">{themeLabel(theme)}</span>
                        <span className="text-[11px] text-text-tertiary whitespace-nowrap">
                          {data.consistent}/{data.total}
                        </span>
                      </div>
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
                  stemde bij gerelateerde moties. Score: consistent (≥70%), wisselend (30-70%),
                  afwijkend (≤30%). Beloften met minder dan 3 gerelateerde moties krijgen geen score.
                </p>
              </details>
              <MethodologyLink />
            </div>
          </div>
        </section>
      )}

      {/* TK cross-reference */}
      {tkScorecard && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Landelijk stemgedrag</h2>
          <div className="text-[12px] text-text-tertiary mb-3">
            Tweede Kamer — Hoe stemt {tkScorecard.abbreviation} landelijk?
          </div>

          <div className="card p-5 border-dashed">
            <div className="flex items-start gap-6 mb-4">
              <div className="text-center shrink-0">
                <div className="text-[36px] font-serif text-ink/70 leading-none">
                  {tkScorecard.mandateConsistencyScore}
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
                <div className="text-[10px] mt-1.5 font-medium text-text-tertiary">
                  TK {tkScorecard.electionYear}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <ConfidenceBadge scored={tkScorecard.scoredPromises} total={tkScorecard.totalPromises} compact />
                </div>
                <p className="text-sm text-text-secondary mb-3">
                  Dit is het landelijke stemgedrag van {tkScorecard.abbreviation} in de Tweede Kamer.
                  Dit kan een indicatie geven van hoe deze partij zich positioneert op nationale thema{"\u2019"}s.
                </p>
                <div className="flex h-2.5 rounded-md overflow-hidden gap-px opacity-60">
                  {tkScorecard.consistentCount > 0 && (
                    <div className="bg-ink/30" style={{ flex: tkScorecard.consistentCount }} />
                  )}
                  {tkScorecard.mixedCount > 0 && (
                    <div className="bg-ink/12" style={{ flex: tkScorecard.mixedCount }} />
                  )}
                  {tkScorecard.inconsistentCount > 0 && (
                    <div className="bg-ink/4 border border-border/50" style={{ flex: tkScorecard.inconsistentCount }} />
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                  <span>Consistent ({tkScorecard.consistentCount})</span>
                  <span>Wisselend ({tkScorecard.mixedCount})</span>
                  <span>Afwijkend ({tkScorecard.inconsistentCount})</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <Link
                href={`/nl/tweede-kamer/partijen/${encodeURIComponent(tkScorecard.abbreviation)}`}
                className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-moss transition-colors"
              >
                Bekijk volledig landelijk profiel
                <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
