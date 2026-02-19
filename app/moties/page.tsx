import Link from "next/link";
import { getMotions } from "../../lib/api";
import type { MotionListItem } from "../../lib/types";
import { formatDate } from "../../lib/utils";
import PartyBadge from "../../components/PartyBadge";
import StatusBadge from "../../components/StatusBadge";
import MotionTypeBadge from "../../components/MotionTypeBadge";
import VoteBar from "../../components/VoteBar";
import MotiesFilters from "./MotiesFilters";

interface Props {
  searchParams: {
    status?: string;
    q?: string;
    page?: string;
    sort?: string;
    hasVotes?: string;
    hasPredictions?: string;
  };
}

const PAGE_SIZE = 25;

export const revalidate = 1800; // ISR: re-generate at most every 30 minutes

export const metadata = {
  title: "Moties — CivicStat",
};

export default async function MotiesPage({ searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  // Default to showing only motions with votes, unless explicitly disabled or when searching/filtering by status
  const hasVotes = searchParams.hasVotes === "false" ? false : !searchParams.q && !searchParams.status;
  const hasPredictions = searchParams.hasPredictions === "true";

  let data;
  try {
    data = await getMotions({
      status: searchParams.status,
      q: searchParams.q,
      hasVotes: hasVotes || undefined,
      hasPromiseMatches: hasPredictions || undefined,
      limit: PAGE_SIZE,
      offset,
    });
  } catch (err) {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-2xl text-ink mb-2">Moties</h1>
        <div className="card p-6 text-text-secondary text-sm">
          Kon geen verbinding maken met de API. Probeer het later opnieuw.
        </div>
      </div>
    );
  }

  const { items, total } = data;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Client-side sort: when sort=votes, reorder current page by total votes desc
  const sortedItems =
    searchParams.sort === "votes"
      ? [...items].sort((a, b) => {
          const aV = (a.vote?.totalFor ?? 0) + (a.vote?.totalAgainst ?? 0);
          const bV = (b.vote?.totalFor ?? 0) + (b.vote?.totalAgainst ?? 0);
          return bV - aV;
        })
      : items;

  // Helper to get first vote data from a motion
  function getVote(m: MotionListItem) {
    if (m.vote) return m.vote;
    if (m.votes && m.votes.length > 0) return m.votes[0];
    return null;
  }

  // Helper to get first sponsor party
  function getSponsorParty(m: MotionListItem) {
    const sponsor = m.sponsors?.[0];
    if (sponsor?.mp?.party) return sponsor.mp.party;
    return null;
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Header */}
      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Moties
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">
        {total.toLocaleString("nl-NL")} ingediende moties met stemresultaat en
        bronverwijzing.
      </p>

      {/* Filters */}
      <MotiesFilters
        currentStatus={searchParams.status}
        currentQ={searchParams.q}
        currentSort={searchParams.sort}
        currentHasVotes={hasVotes}
        currentHasPredictions={hasPredictions}
      />

      {/* Table */}
      <div className="card overflow-hidden">
        {/* Table header (desktop) */}
        <div className="hidden sm:grid grid-cols-[1fr_100px_80px_100px] gap-2 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary border-b border-border bg-surface-sub rounded-t-card">
          <span>Motie</span>
          <span>Datum</span>
          <span>Uitslag</span>
          <span>Status</span>
        </div>

        {/* Rows */}
        {sortedItems.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-text-tertiary">
            Geen moties gevonden.
          </div>
        )}
        {sortedItems.map((m, i) => {
          const vote = getVote(m);
          const party = getSponsorParty(m);
          const sponsorName = m.sponsors?.[0]?.mp?.surname ?? null;

          return (
            <Link
              key={m.id}
              href={`/moties/${m.id}`}
              className={`block sm:grid sm:grid-cols-[1fr_100px_80px_100px] items-center gap-2 px-5 py-3.5 table-row-hover ${
                i < sortedItems.length - 1 ? "border-b border-border-subtle" : ""
              }`}
            >
              {/* Title + meta */}
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink truncate">
                  {m.title}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
                  {m.soort && m.soort !== "Motie" && (
                    <>
                      <MotionTypeBadge type={m.soort} size="sm" />
                      <span>·</span>
                    </>
                  )}
                  {m.tkNumber && (
                    <>
                      <span>{m.tkNumber}</span>
                      <span>·</span>
                    </>
                  )}
                  {party && (
                    <>
                      <PartyBadge
                        abbreviation={party.abbreviation}
                        colorNeutral={party.colorNeutral}
                        size="sm"
                      />
                      {sponsorName && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[140px]">
                            {sponsorName}
                          </span>
                        </>
                      )}
                    </>
                  )}
                  {!party && sponsorName && (
                    <span className="truncate max-w-[140px]">
                      {sponsorName}
                    </span>
                  )}
                  {m.hasPromiseMatches && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-0.5 text-moss" title="Voorspelling beschikbaar">
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        <span className="text-[11px]">Voorspelling</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Date */}
              <span className="hidden sm:block text-[13px] text-text-secondary">
                {formatDate(m.dateIntroduced)}
              </span>

              {/* Vote bar */}
              <div className="hidden sm:block w-[60px]">
                {vote ? (
                  <>
                    <VoteBar
                      voor={vote.totalFor}
                      tegen={vote.totalAgainst}
                      height={6}
                    />
                    <div className="mt-0.5 text-[11px] text-text-tertiary">
                      {vote.totalFor}–{vote.totalAgainst}
                    </div>
                  </>
                ) : (
                  <span className="text-[11px] text-text-tertiary">–</span>
                )}
              </div>

              {/* Status */}
              <div className="mt-2 sm:mt-0">
                <StatusBadge status={m.status} size="sm" />
              </div>

              {/* Mobile extras */}
              <div className="mt-1.5 flex items-center gap-3 sm:hidden text-xs text-text-tertiary">
                <span>{formatDate(m.dateIntroduced)}</span>
                {vote && (
                  <div className="flex items-center gap-2">
                    <div className="w-[50px]">
                      <VoteBar voor={vote.totalFor} tegen={vote.totalAgainst} height={4} />
                    </div>
                    <span>{vote.totalFor}–{vote.totalAgainst}</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-text-tertiary text-xs">
            Pagina {page} van {totalPages} ({total.toLocaleString("nl-NL")}{" "}
            moties)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <PaginationLink
                page={page - 1}
                status={searchParams.status}
                q={searchParams.q}
                sort={searchParams.sort}
                hasVotes={hasVotes}
                hasPredictions={hasPredictions}
                label="← Vorige"
              />
            )}
            {page < totalPages && (
              <PaginationLink
                page={page + 1}
                status={searchParams.status}
                q={searchParams.q}
                sort={searchParams.sort}
                hasVotes={hasVotes}
                hasPredictions={hasPredictions}
                label="Volgende →"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PaginationLink({
  page,
  status,
  q,
  sort,
  hasVotes,
  hasPredictions,
  label,
}: {
  page: number;
  status?: string;
  q?: string;
  sort?: string;
  hasVotes?: boolean;
  hasPredictions?: boolean;
  label: string;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  if (status) sp.set("status", status);
  if (q) sp.set("q", q);
  if (sort) sp.set("sort", sort);
  if (hasVotes === false) sp.set("hasVotes", "false");
  if (hasPredictions) sp.set("hasPredictions", "true");

  return (
    <Link
      href={`/moties?${sp.toString()}`}
      className="rounded-lg border border-border px-3.5 py-1.5 text-[13px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
    >
      {label}
    </Link>
  );
}
