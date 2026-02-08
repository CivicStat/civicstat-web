import Link from "next/link";
import { getPromises, getParties } from "../../lib/api";
import type { PromiseListItem } from "../../lib/types";
import { formatDate } from "../../lib/utils";
import PartyBadge from "../../components/PartyBadge";
import VoteBar from "../../components/VoteBar";
import BeloftenFilters from "./BeloftenFilters";

interface Props {
  searchParams: {
    partij?: string;
    thema?: string;
    page?: string;
  };
}

const PAGE_SIZE = 25;

export const metadata = {
  title: "Beloften — CivicStat",
  description:
    "Vergelijk verkiezingsbeloften met het stemgedrag van partijen in de Tweede Kamer.",
};

// ─── Helpers ──────────────────────────────────────────────────

function themeLabel(theme: string): string {
  const map: Record<string, string> = {
    DEFENSIE: "Defensie",
    MIGRATIE: "Migratie",
    KLIMAAT: "Klimaat",
    ZORG: "Zorg",
    ONDERWIJS: "Onderwijs",
    ECONOMIE: "Economie",
    VEILIGHEID: "Veiligheid",
    WONEN: "Wonen",
    BESTUUR: "Bestuur",
  };
  return map[theme] || theme;
}

function specificityLabel(s: string): string {
  const map: Record<string, string> = {
    CONCRETE: "Concreet",
    MODERATE: "Matig",
    VAGUE: "Vaag",
  };
  return map[s] || s;
}

/** Count how many matched motions were adopted / rejected */
function matchStats(promise: PromiseListItem) {
  let adopted = 0;
  let rejected = 0;
  let noVote = 0;

  for (const m of promise.motionMatches) {
    const vote = m.motion.votes?.[0];
    if (!vote) {
      noVote++;
    } else if (vote.result === "Aangenomen") {
      adopted++;
    } else {
      rejected++;
    }
  }

  return { adopted, rejected, noVote, total: promise.motionMatches.length };
}

// ─── Page ─────────────────────────────────────────────────────

export default async function BeloftenPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  let data;
  let parties: { abbreviation: string; id: string }[] = [];

  try {
    const [promiseData, partyData] = await Promise.all([
      getPromises({
        party: searchParams.partij,
        theme: searchParams.thema,
        limit: PAGE_SIZE,
        offset,
      }),
      getParties(),
    ]);
    data = promiseData;
    parties = partyData.map((p) => ({
      abbreviation: p.abbreviation,
      id: p.id,
    }));
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-2xl text-ink mb-2">Beloften</h1>
        <div className="card p-6 text-text-secondary text-sm">
          Kon geen verbinding maken met de API. Probeer het later opnieuw.
        </div>
      </div>
    );
  }

  const { items, total } = data;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Group promises by party for the summary banner
  const partyGroups = new Map<string, number>();
  for (const item of items) {
    const abbr = item.program.party.abbreviation;
    partyGroups.set(abbr, (partyGroups.get(abbr) || 0) + 1);
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Header */}
      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Beloften
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">
        {total} verkiezingsbeloften uit partijprogramma&apos;s, vergeleken met
        stemgedrag in de Tweede Kamer.
      </p>

      {/* Filters */}
      <BeloftenFilters
        currentParty={searchParams.partij}
        currentTheme={searchParams.thema}
        parties={parties}
      />

      {/* Promise cards */}
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="card px-5 py-10 text-center text-sm text-text-tertiary">
            Geen beloften gevonden voor deze filters.
          </div>
        )}

        {items.map((promise) => {
          const stats = matchStats(promise);

          return (
            <article key={promise.id} className="card overflow-hidden">
              {/* Top section */}
              <div className="px-5 pt-4 pb-3">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <PartyBadge
                    abbreviation={promise.program.party.abbreviation}
                    colorNeutral={promise.program.party.colorNeutral}
                    size="sm"
                  />
                  <span className="inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                    {themeLabel(promise.theme)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
                    {specificityLabel(promise.specificity)}
                  </span>
                  <span className="text-[11px] text-text-tertiary ml-auto">
                    {promise.promiseCode}
                  </span>
                </div>

                {/* Summary */}
                <h2 className="text-[15px] font-medium text-ink leading-snug mb-1.5">
                  {promise.summary}
                </h2>

                {/* Original program text */}
                <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2">
                  {promise.text}
                </p>

                {/* Source line */}
                <div className="mt-2 text-[11px] text-text-tertiary">
                  Bron: {promise.program.title} ({promise.program.electionYear})
                  {promise.pageRef && ` · p. ${promise.pageRef}`}
                </div>
              </div>

              {/* Match summary bar */}
              {stats.total > 0 ? (
                <div className="border-t border-border-subtle px-5 py-3 bg-surface-sub/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                      Gerelateerde moties ({stats.total})
                    </span>
                    <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                      {stats.adopted > 0 && (
                        <span className="flex items-center gap-1">
                          <svg width={10} height={10} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {stats.adopted} aangenomen
                        </span>
                      )}
                      {stats.rejected > 0 && (
                        <span className="flex items-center gap-1">
                          <svg width={10} height={10} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          {stats.rejected} verworpen
                        </span>
                      )}
                      {stats.noVote > 0 && (
                        <span>{stats.noVote} zonder stemming</span>
                      )}
                    </div>
                  </div>

                  {/* Show first 3 matched motions */}
                  <div className="space-y-1.5">
                    {promise.motionMatches.slice(0, 3).map((match) => {
                      const vote = match.motion.votes?.[0];
                      return (
                        <Link
                          key={match.id}
                          href={`/moties/${match.motion.id}`}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 -mx-1 transition-colors hover:bg-surface-sub"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] text-ink truncate">
                              {match.motion.text || match.motion.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-tertiary">
                              {match.motion.tkNumber && (
                                <span>{match.motion.tkNumber}</span>
                              )}
                              <span>{formatDate(match.motion.dateIntroduced)}</span>
                              <span
                                className={`rounded-full px-1.5 py-0 text-[10px] font-medium ${
                                  match.matchType === "EXPLICIT_MATCH"
                                    ? "bg-accent-subtle text-moss"
                                    : match.matchType === "CONTRA_MATCH"
                                    ? "bg-surface-sub text-text-tertiary"
                                    : "bg-surface-sub text-text-secondary"
                                }`}
                              >
                                {match.matchType === "EXPLICIT_MATCH"
                                  ? "direct"
                                  : match.matchType === "CONTRA_MATCH"
                                  ? "contra"
                                  : "impliciet"}
                              </span>
                            </div>
                          </div>

                          {/* Vote result */}
                          {vote ? (
                            <div className="flex-shrink-0 w-[80px] text-right">
                              <div className="w-[60px] ml-auto">
                                <VoteBar
                                  voor={vote.totalFor}
                                  tegen={vote.totalAgainst}
                                  height={5}
                                />
                              </div>
                              <div className="mt-0.5 text-[11px] text-text-tertiary">
                                {vote.totalFor}–{vote.totalAgainst}{" "}
                                <span
                                  className={
                                    vote.result === "Aangenomen"
                                      ? "font-semibold text-ink"
                                      : ""
                                  }
                                >
                                  {vote.result === "Aangenomen" ? "✓" : "✗"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="flex-shrink-0 text-[11px] text-text-tertiary">
                              –
                            </span>
                          )}
                        </Link>
                      );
                    })}

                    {promise.motionMatches.length > 3 && (
                      <div className="text-[11px] text-text-tertiary pl-3 pt-1">
                        + {promise.motionMatches.length - 3} meer
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-t border-border-subtle px-5 py-3 bg-surface-sub/30">
                  <span className="text-[11px] text-text-tertiary">
                    Nog geen gerelateerde moties gevonden.
                  </span>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-text-tertiary text-xs">
            Pagina {page} van {totalPages} ({total} beloften)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <PaginationLink
                page={page - 1}
                partij={searchParams.partij}
                thema={searchParams.thema}
                label="← Vorige"
              />
            )}
            {page < totalPages && (
              <PaginationLink
                page={page + 1}
                partij={searchParams.partij}
                thema={searchParams.thema}
                label="Volgende →"
              />
            )}
          </div>
        </div>
      )}

      {/* Methodology note */}
      <div className="mt-6 card px-5 py-4">
        <h3 className="text-[13px] font-semibold text-ink mb-1">
          Over deze data
        </h3>
        <p className="text-[12px] text-text-secondary leading-relaxed">
          Beloften zijn geëxtraheerd uit officiële verkiezingsprogramma&apos;s en
          gekoppeld aan Kamermoties via trefwoordanalyse. Niet alle moties
          zijn direct te koppelen aan een belofte — de weergegeven koppelingen
          zijn indicatief. CivicStat geeft geen oordeel over partijen; alle
          data is openbaar en controleerbaar.
        </p>
      </div>
    </div>
  );
}

function PaginationLink({
  page,
  partij,
  thema,
  label,
}: {
  page: number;
  partij?: string;
  thema?: string;
  label: string;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  if (partij) sp.set("partij", partij);
  if (thema) sp.set("thema", thema);

  return (
    <Link
      href={`/beloften?${sp.toString()}`}
      className="rounded-lg border border-border px-3.5 py-1.5 text-[13px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
    >
      {label}
    </Link>
  );
}
