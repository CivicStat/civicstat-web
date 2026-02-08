import Link from "next/link";
import { getPromise } from "../../../lib/api";
import { formatDate } from "../../../lib/utils";
import PartyBadge from "../../../components/PartyBadge";
import VoteBar from "../../../components/VoteBar";
import type { PromiseMotionMatch } from "../../../lib/types";

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

function themeLabel(theme: string): string {
  const map: Record<string, string> = {
    BESTUUR: "Bestuur",
    BUITENLAND: "Buitenland",
    DEFENSIE: "Defensie",
    ECONOMIE: "Economie",
    KLIMAAT: "Klimaat",
    LANDBOUW: "Landbouw",
    MIGRATIE: "Migratie",
    ONDERWIJS: "Onderwijs",
    SOCIAAL: "Sociaal",
    VEILIGHEID: "Veiligheid",
    WONEN: "Wonen",
    ZORG: "Zorg",
  };
  return map[theme] || theme;
}

function specificityLabel(s: string): string {
  const map: Record<string, string> = {
    CONCRETE: "Concreet",
    DIRECTIONAL: "Directioneel",
    MODERATE: "Matig",
    VAGUE: "Vaag",
  };
  return map[s] || s;
}

function directionLabel(d: string): string {
  return d === "VOOR"
    ? "Verwacht: voor"
    : d === "TEGEN"
    ? "Verwacht: tegen"
    : d;
}

function matchTypeLabel(t: string) {
  switch (t) {
    case "EXPLICIT_MATCH":
      return "direct";
    case "CONTRA_MATCH":
      return "contra";
    default:
      return "impliciet";
  }
}

function matchTypeBadgeClass(t: string) {
  switch (t) {
    case "EXPLICIT_MATCH":
      return "bg-accent-subtle text-moss";
    case "CONTRA_MATCH":
      return "bg-red-500/10 text-red-400";
    default:
      return "bg-surface-sub text-text-secondary";
  }
}

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

// ─── Page ─────────────────────────────────────────────────────

export default async function BelofteDetailPage({ params }: Props) {
  let promise;
  try {
    promise = await getPromise(params.id);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <Link
          href="/beloften"
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

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-6 pb-24">
      {/* Back */}
      <Link
        href="/beloften"
        className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-ink transition-colors mb-6"
      >
        <svg
          width={15}
          height={15}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Alle beloften
      </Link>

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
          <span className="inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
            {specificityLabel(p.specificity)}
          </span>
          {p.expectedVoteDirection && (
            <span className="inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
              {directionLabel(p.expectedVoteDirection)}
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
            <p className="text-[13px] text-text-secondary leading-relaxed max-w-[68ch]">
              <PassageWithHighlight
                passage={p.passage.passageText}
                promiseText={p.text}
              />
            </p>
          </div>
        )}
      </div>

      {/* ─── MOTION MATCHES SECTION ──────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[22px] font-normal text-ink">
            Gerelateerde moties ({stats.total})
          </h2>
          {stats.total > 0 && (
            <div className="flex items-center gap-3 text-[12px] text-text-secondary">
              {stats.adopted > 0 && (
                <span className="flex items-center gap-1">
                  <svg
                    width={11}
                    height={11}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {stats.adopted} aangenomen
                </span>
              )}
              {stats.rejected > 0 && (
                <span className="flex items-center gap-1">
                  <svg
                    width={11}
                    height={11}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    viewBox="0 0 24 24"
                  >
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
            Nog geen gerelateerde moties gevonden voor deze belofte.
          </div>
        ) : (
          <div className="card overflow-hidden">
            {p.motionMatches.map((match, i) => {
              const vote = match.motion.votes?.[0];
              return (
                <Link
                  key={match.id}
                  href={`/moties/${match.motion.id}`}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-sub group ${
                    i < p.motionMatches.length - 1
                      ? "border-b border-border-subtle"
                      : ""
                  }`}
                >
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

      {/* ─── METHODOLOGY NOTE ────────────────────────────────── */}
      <div className="card px-5 py-4">
        <h3 className="text-[13px] font-semibold text-ink mb-1">
          Over de koppeling
        </h3>
        <p className="text-[12px] text-text-secondary leading-relaxed max-w-[68ch]">
          Moties worden automatisch gekoppeld aan beloften op basis van
          trefwoordovereenkomsten en tekstuele gelijkenis. Het matchtype geeft
          aan of de motie direct, impliciet of tegenstrijdig gerelateerd is. De
          betrouwbaarheidsscore (%) weerspiegelt de sterkte van de match.
        </p>
        {p.motionMatches.length > 0 && (
          <div className="mt-2 text-[11px] text-text-tertiary font-mono">
            Methode: {p.motionMatches[0].matchMethod}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

/** Renders passage text with the promise text highlighted inline */
function PassageWithHighlight({
  passage,
  promiseText,
}: {
  passage: string;
  promiseText: string;
}) {
  // Try to find the promise text within the passage
  const idx = passage.toLowerCase().indexOf(promiseText.toLowerCase().slice(0, 60));

  if (idx === -1) {
    // No overlap found — just show the passage
    return <>{passage}</>;
  }

  // Find the end of the matching region (use first 60 chars for fuzzy locate)
  const before = passage.slice(0, idx);
  const highlighted = passage.slice(idx, idx + promiseText.length);
  const after = passage.slice(idx + promiseText.length);

  return (
    <>
      {before}
      <mark className="bg-accent-subtle/60 text-ink rounded-sm px-0.5">
        {highlighted}
      </mark>
      {after}
    </>
  );
}
