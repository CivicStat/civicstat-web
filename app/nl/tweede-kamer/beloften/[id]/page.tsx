import Link from "next/link";
import { getPromise, getPromises, getPartyScorecard } from "../../../../../lib/api";
import { formatDate, getPartyColor, themeLabel, formatSpecificity, directionLabel, matchTypeLabel, matchTypeBadgeClass } from "../../../../../lib/utils";
import PartyBadge from "../../../../../components/PartyBadge";
import PartyAvatar from "../../../../../components/PartyAvatar";
import VoteBar from "../../../../../components/VoteBar";
import ExpandablePassage from "./ExpandablePassage";
import MethodologyLink from "../../../../../components/MethodologyLink";
import Term from "../../../../../components/Term";
import { isCoalitionParty } from "../../../../../lib/coalitions";
import { routes } from "../../../../../lib/routes";
import type { PromiseMotionMatch, PromiseListItem, PartyScorecard, PromiseDetail } from "../../../../../lib/types";
import Breadcrumbs from "../../../../../components/Breadcrumbs";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  try {
    const p = await getPromise(params.id);
    return { title: `${p.promiseCode} — CivicStat` };
  } catch {
    return { title: "Belofte — CivicStat" };
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function matchStats(matches: PromiseMotionMatch[]) {
  let adopted = 0;
  let rejected = 0;
  let noVote = 0;

  for (const m of matches) {
    const vote = m.motion.votes?.[0];
    if (!vote) {
      noVote++;
    } else if (vote.result === "Aangenomen") {
      adopted++;
    } else {
      rejected++;
    }
  }

  return { adopted, rejected, noVote, total: matches.length };
}

/**
 * Get status label and styling from server-computed promiseStatus.
 */
function statusBadge(
  status: PromiseDetail["promiseStatus"],
  scoringSummary: PromiseDetail["scoringSummary"],
): { label: string; icon: "check" | "mixed" | "cross" | "none"; className: string; description: string } {
  const scored = scoringSummary?.scoredMatches ?? 0;
  switch (status) {
    case "CONSISTENT":
      return {
        label: "Consistent",
        icon: "check",
        className: "bg-accent-subtle text-moss",
        description: `${scoringSummary?.alignedCount ?? 0} van ${scored} beoordeelde moties zijn in lijn met de belofte.`,
      };
    case "BROKEN":
      return {
        label: "Niet in lijn",
        icon: "cross",
        className: "bg-red-500/10 text-red-400",
        description: `${scoringSummary?.opposedCount ?? 0} van ${scored} beoordeelde moties wijken af van de belofte.`,
      };
    case "MIXED":
      return {
        label: "Gemengd",
        icon: "mixed",
        className: "bg-amber-500/10 text-amber-600",
        description: `Stemgedrag is deels in lijn (${scoringSummary?.alignedCount ?? 0}/${scored}) en deels afwijkend (${scoringSummary?.opposedCount ?? 0}/${scored}).`,
      };
    default:
      return {
        label: "Onvoldoende data",
        icon: "none",
        className: "bg-surface-sub text-text-tertiary",
        description: "Er zijn onvoldoende stemmingen om de consistentie te bepalen.",
      };
  }
}

/**
 * Legacy client-side consistency for cross-party items (no server enrichment).
 */
function computeConsistency(
  matches: PromiseMotionMatch[],
  expectedDirection: string
): { label: string; className: string } {
  let aligned = 0;
  let opposed = 0;

  for (const m of matches) {
    const vote = m.motion.votes?.[0];
    if (!vote) continue;
    const isAdopted = vote.result === "Aangenomen";
    const isContra = m.matchType === "CONTRA_MATCH";
    const expectsFor = expectedDirection === "VOOR";

    if (isContra) {
      if (isAdopted) opposed++;
      else aligned++;
    } else {
      if (expectsFor) {
        if (isAdopted) aligned++;
        else opposed++;
      } else {
        if (isAdopted) opposed++;
        else aligned++;
      }
    }
  }

  const scored = aligned + opposed;
  if (scored === 0) return { label: "Onvoldoende data", className: "bg-surface-sub text-text-tertiary" };
  const ratio = aligned / scored;
  if (ratio >= 0.7) return { label: "Consistent", className: "bg-accent-subtle text-moss" };
  if (ratio <= 0.3) return { label: "Niet in lijn", className: "bg-red-500/10 text-red-400" };
  return { label: "Gemengd", className: "bg-amber-500/10 text-amber-600" };
}

// ─── Page ─────────────────────────────────────────────────────

export default async function BelofteDetailPage({ params }: Props) {
  let promise: PromiseDetail;
  try {
    promise = await getPromise(params.id);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <Link
          href={routes.tk.beloften}
          className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-ink transition-colors mb-6"
        >
          &larr; Alle beloften
        </Link>
        <div className="card p-6 text-text-secondary text-sm">
          Deze belofte kon niet worden geladen.
        </div>
      </div>
    );
  }

  const p = promise;
  const stats = matchStats(p.motionMatches);
  const badge = statusBadge(p.promiseStatus, p.scoringSummary);

  // Fetch same-theme promises from other parties for cross-party comparison
  let crossPartyPromises: PromiseListItem[] = [];
  try {
    const sameTheme = await getPromises({ theme: p.theme, limit: 20 });
    crossPartyPromises = sameTheme.items.filter(
      (cp) =>
        cp.program.party.abbreviation !== p.program.party.abbreviation &&
        cp.id !== p.id
    );
  } catch {
    // Non-critical — ignore
  }

  // Fetch party scorecard for context card
  let partyScorecard: PartyScorecard | null = null;
  try {
    partyScorecard = await getPartyScorecard(p.program.party.id);
  } catch {
    // Non-critical — ignore
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-6 pb-24">
      <Breadcrumbs items={[
        { label: "Tweede Kamer", href: routes.tk.root },
        { label: "Beloften", href: routes.tk.beloften },
        { label: p.promiseCode },
      ]} />

      {/* ─── HEADER SECTION ──────────────────────────────────── */}
      <div className="mb-7">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <PartyBadge
            abbreviation={p.program.party.abbreviation}
            colorNeutral={p.program.party.colorNeutral}
            size="sm"
          />
          <span className="inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
            {themeLabel(p.theme)}
          </span>
          <span className="inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-medium text-text-tertiary cursor-help" title={formatSpecificity(p.specificity).description}>
            {formatSpecificity(p.specificity).label}
          </span>
          {p.expectedVoteDirection && (
            <span className="inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
              {directionLabel(p.expectedVoteDirection)}
            </span>
          )}
          {isCoalitionParty(p.program.party.abbreviation) && (
            <span className="inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
              Coalitie
            </span>
          )}
          <span className="text-[13px] text-text-tertiary ml-auto font-mono">
            {p.promiseCode}
          </span>
        </div>

        {/* Summary as h1 */}
        <h1 className="font-serif text-[26px] font-normal text-ink leading-tight max-w-[700px] mb-4">
          {p.summary}
        </h1>

        {/* Original program quote */}
        <blockquote className="border-l-[3px] border-border pl-4 text-[14px] text-text-secondary leading-relaxed max-w-[68ch]">
          {p.text}
        </blockquote>
      </div>

      {/* ─── CONSISTENCY BADGE (server-computed) ─────────────────── */}
      {stats.total > 0 && (
        <div className="card px-5 py-4 mb-8 flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${badge.className}`}>
            {badge.icon === "check" && (
              <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {badge.icon === "cross" && (
              <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            {badge.icon === "mixed" && (
              <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
            {badge.label}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-text-secondary">
              {badge.description}
            </span>
            <span className="text-[11px] text-text-tertiary">
              {p.scoringSummary
                ? `${p.scoringSummary.alignedCount} in lijn · ${p.scoringSummary.opposedCount} afwijkend · van ${p.scoringSummary.totalMatches} koppelingen`
                : `Gebaseerd op ${stats.adopted + stats.rejected} moties`}
            </span>
          </div>
        </div>
      )}

      {/* ─── PARTY SCORECARD CONTEXT ─────────────────────────────── */}
      {partyScorecard && partyScorecard.scoredPromises > 0 && (
        <div className="card px-5 py-4 mb-8 -mt-5 flex items-center gap-4">
          <PartyAvatar abbreviation={p.program.party.abbreviation} color={getPartyColor(p.program.party.abbreviation, p.program.party.colorNeutral)} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-text-tertiary">
              Partijscore {p.program.party.abbreviation}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-serif text-ink">{partyScorecard.mandateConsistencyScore}</span>
              <span className="text-[11px] text-text-tertiary">van 100</span>
              <span className="text-[11px] text-text-tertiary">&middot;</span>
              <span className="text-[11px] text-text-tertiary">{partyScorecard.scoredPromises} beloften geanalyseerd</span>
            </div>
          </div>
          <Link href={routes.tk.partij(p.program.party.id)} className="text-[12px] text-moss hover:underline shrink-0">
            Partijpagina &rarr;
          </Link>
        </div>
      )}

      {/* ─── METHODOLOGY EXPANDABLE ────────────────────────────── */}
      {stats.total > 0 && (
        <details className="card px-5 py-3 mb-8 -mt-5 pt-5 border-t-0 rounded-t-none">
          <summary className="text-[12px] text-text-tertiary cursor-pointer hover:text-text-secondary transition-colors list-none flex items-center gap-1.5 [&::-webkit-details-marker]:hidden">
            <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className="underline underline-offset-2">Hoe wordt dit berekend?</span>
          </summary>
          <div className="mt-3 space-y-2 text-[12px] text-text-secondary leading-relaxed max-w-[68ch]">
            <p>
              De consistentiebadge vergelijkt het stemgedrag van {p.program.party.abbreviation} bij gerelateerde moties
              met de verwachte stemrichting van deze belofte ({p.expectedVoteDirection === "VOOR" ? "voor" : "tegen"}).
              De partijstem wordt bepaald via de stemresultaten van de Tweede Kamer.
            </p>
            <div className="grid grid-cols-3 gap-2 my-2">
              <div className="bg-surface-sub rounded-lg p-2.5 text-center">
                <div className="text-lg font-serif text-ink">{p.scoringSummary?.alignedCount ?? stats.adopted}</div>
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider">In lijn</div>
              </div>
              <div className="bg-surface-sub rounded-lg p-2.5 text-center">
                <div className="text-lg font-serif text-ink">{p.scoringSummary?.opposedCount ?? stats.rejected}</div>
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Afwijkend</div>
              </div>
              <div className="bg-surface-sub rounded-lg p-2.5 text-center">
                <div className="text-lg font-serif text-ink">{stats.noVote}</div>
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider">Geen stemming</div>
              </div>
            </div>
            <p>
              <strong className="text-ink">Consistent</strong> ({"\u2265"}70%): de meerderheid van
              gerelateerde moties is in lijn met de belofte.{" "}
              <strong className="text-ink">Niet in lijn</strong> ({"\u2264"}30%):
              de meerderheid wijkt af.{" "}
              <strong className="text-ink">Gemengd</strong>: tussen 30% en 70%.
            </p>
            <p className="text-text-tertiary">
              Moties zonder stemresultaat tellen niet mee. Het matchtype (direct, impliciet, contra)
              bepaalt of een stem als &ldquo;in lijn&rdquo; of &ldquo;afwijkend&rdquo; wordt
              geteld. Zwakke matches (&lt;30% betrouwbaarheid) worden overgeslagen.{" "}
              <em>Deze analyse is indicatief, niet definitief.</em>
            </p>
          </div>
        </details>
      )}

      {/* ─── SOURCE SECTION ──────────────────────────────────── */}
      <div className="card p-5 mb-8">
        <h2 className="font-serif text-[22px] font-normal text-ink mb-3">
          Bron
        </h2>

        <div className="text-sm text-text-secondary leading-relaxed mb-2">
          <span className="italic">{p.program.title}</span>{" "}
          ({p.program.electionYear})
          {p.pageRef && (
            <span className="text-text-tertiary"> &middot; p.&nbsp;{p.pageRef}</span>
          )}
        </div>

        {p.program.sourceUrl && (
          <a
            href={p.program.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-moss hover:text-ink transition-colors mb-3"
          >
            Bekijk bronprogramma (PDF)
            <svg
              width={12}
              height={12}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}

        {/* Passage context */}
        {p.passage && (
          <div className="mt-3 pt-3 border-t border-border-subtle">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
              Context in het programma
              {p.passage.chapter && (
                <span className="font-normal normal-case tracking-normal">
                  {" "}&middot; {p.passage.chapter}
                </span>
              )}
              {p.passage.heading && (
                <span className="font-normal normal-case tracking-normal">
                  {" "}&mdash; {p.passage.heading}
                </span>
              )}
            </div>
            <ExpandablePassage
              passage={p.passage.passageText}
              promiseText={p.text}
              maxLength={300}
            />
          </div>
        )}
      </div>

      {/* ─── MOTION MATCHES SECTION (with party vote indicators) ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[22px] font-normal text-ink">
            Gerelateerde moties ({stats.total})
          </h2>
          {stats.total > 0 && (
            <div className="flex items-center gap-3 text-[12px] text-text-secondary">
              {stats.adopted > 0 && (
                <span className="flex items-center gap-1">
                  <svg width={11} height={11} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {stats.adopted} aangenomen
                </span>
              )}
              {stats.rejected > 0 && (
                <span className="flex items-center gap-1">
                  <svg width={11} height={11} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {stats.rejected} verworpen
                </span>
              )}
              {stats.noVote > 0 && (
                <span>{stats.noVote} zonder stemming</span>
              )}
            </div>
          )}
        </div>

        {stats.total === 0 ? (
          <div className="card px-5 py-8 text-center text-sm text-text-tertiary">
            Nog geen gerelateerde moties gevonden voor deze belofte. Wordt automatisch bijgewerkt wanneer relevante moties worden ingediend en gestemd.
          </div>
        ) : (
          <div className="card overflow-hidden">
            {p.motionMatches.map((match, i) => {
              const vote = match.motion.votes?.[0];
              const pvd = match.partyVoteDirection;
              const cons = match.isConsistent;
              return (
                <Link
                  key={match.id}
                  href={routes.tk.motie(match.motion.id)}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-sub group ${
                    i < p.motionMatches.length - 1
                      ? "border-b border-border-subtle"
                      : ""
                  }`}
                >
                  {/* Party vote consistency indicator */}
                  <div className="flex-shrink-0 w-5 flex items-center justify-center">
                    {cons === true && (
                      <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-moss">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {cons === false && (
                      <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" className="text-red-400">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                    {cons === null && vote && (
                      <span className="w-1.5 h-1.5 rounded-full bg-border" title="Partijstem onbekend" />
                    )}
                    {!vote && (
                      <span className="w-1.5 h-1.5 rounded-full bg-border-subtle" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] text-ink leading-snug group-hover:text-moss transition-colors">
                      {match.motion.text || match.motion.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-text-tertiary">
                      {match.motion.tkNumber && (
                        <span className="font-mono">
                          {match.motion.tkNumber}
                        </span>
                      )}
                      <span>{formatDate(match.motion.dateIntroduced)}</span>
                      <span
                        className={`rounded-full px-1.5 py-0 text-[10px] font-medium ${matchTypeBadgeClass(
                          match.matchType
                        )}`}
                      >
                        {matchTypeLabel(match.matchType)}
                      </span>
                      <span className="text-[10px] font-mono text-text-tertiary">
                        {Math.round(match.confidence * 100)}%
                      </span>
                      {/* Party vote direction badge */}
                      {pvd && (
                        <span className={`rounded-full px-1.5 py-0 text-[10px] font-medium ${
                          pvd === "VOOR" ? "bg-bar-voor/10 text-ink" : "bg-bar-tegen/10 text-text-secondary"
                        }`}>
                          {p.program.party.abbreviation} {pvd === "VOOR" ? "voor" : "tegen"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vote result */}
                  {vote ? (
                    <div className="flex-shrink-0 w-[90px] text-right">
                      <div className="w-[70px] ml-auto">
                        <VoteBar
                          voor={vote.totalFor}
                          tegen={vote.totalAgainst}
                          height={5}
                        />
                      </div>
                      <div className="mt-0.5 text-[11px] text-text-tertiary">
                        {vote.totalFor}&ndash;{vote.totalAgainst}{" "}
                        <span
                          className={
                            vote.result === "Aangenomen"
                              ? "font-semibold text-ink"
                              : ""
                          }
                        >
                          {vote.result === "Aangenomen" ? "\u2713" : "\u2717"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="flex-shrink-0 text-[11px] text-text-tertiary italic">
                      geen stemming
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── CROSS-PARTY COMPARISON ─────────────────────────── */}
      {crossPartyPromises.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-[22px] font-normal text-ink mb-4">
            Zelfde thema bij andere partijen
          </h2>
          <div className="card overflow-hidden">
            {crossPartyPromises.slice(0, 8).map((cp, i) => (
              <Link
                key={cp.id}
                href={routes.tk.belofte(cp.id)}
                className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-sub group ${
                  i < Math.min(crossPartyPromises.length, 8) - 1
                    ? "border-b border-border-subtle"
                    : ""
                }`}
              >
                <PartyBadge
                  abbreviation={cp.program.party.abbreviation}
                  colorNeutral={cp.program.party.colorNeutral}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] text-ink leading-snug group-hover:text-moss transition-colors line-clamp-1">
                    {cp.summary}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-tertiary">
                    <span className="font-mono">{cp.promiseCode}</span>
                    {cp.motionMatches.length > 0 && (
                      <span>{cp.motionMatches.length} moties</span>
                    )}
                    {(() => {
                      const cpCon = computeConsistency(cp.motionMatches, cp.expectedVoteDirection);
                      return cp.motionMatches.length > 0 ? (
                        <span className={`text-[10px] rounded-full px-1.5 py-0 font-medium ${cpCon.className}`}>
                          {cpCon.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── METHODOLOGY NOTE ────────────────────────────────── */}
      <div className="card px-5 py-4">
        <h3 className="text-[13px] font-semibold text-ink mb-1">
          Over de koppeling
        </h3>
        <p className="text-[12px] text-text-secondary leading-relaxed max-w-[68ch]">
          Moties worden automatisch gekoppeld aan beloften op basis van
          trefwoordovereenkomsten en tekstuele gelijkenis. Het matchtype geeft
          aan of de motie{" "}
          <Term definition="De motie adresseert direct dezelfde concrete toezegging als de belofte. Weegt mee met factor 1.0.">direct</Term>,{" "}
          <Term definition="De motie valt binnen hetzelfde thema als de belofte, maar er is geen directe tekstuele overeenkomst. Weegt mee met factor 0.5.">impliciet</Term> of{" "}
          <Term definition="De motie druist in tegen de belofte. De voorspelde stemrichting wordt omgekeerd. Weegt mee met factor 1.0.">tegenstrijdig</Term> gerelateerd is. De
          betrouwbaarheidsscore (%) weerspiegelt de sterkte van de match.
          De partijstem wordt bepaald via de ruwe stemming-data van de Tweede Kamer.
        </p>
        {p.motionMatches.length > 0 && (
          <div className="mt-2 text-[11px] text-text-tertiary font-mono">
            Methode: {p.motionMatches[0].matchMethod}
          </div>
        )}
        <MethodologyLink />
      </div>
    </div>
  );
}
