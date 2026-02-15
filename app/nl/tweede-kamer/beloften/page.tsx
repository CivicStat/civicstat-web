import Link from "next/link";
import { getPromises, getParties } from "../../../../lib/api";
import type { PromiseListItem } from "../../../../lib/types";
import PartyBadge from "../../../../components/PartyBadge";
import BeloftenFilters from "./BeloftenFilters";
import MotionMatchList from "./MotionMatchList";
import { routes } from "../../../../lib/routes";

interface Props {
  searchParams: {
    partij?: string;
    thema?: string;
    page?: string;
    sort?: string;
  };
}

const PAGE_SIZE = 25;

export const revalidate = 3600; // ISR: re-generate at most every hour

export const metadata = {
  title: "Beloften — CivicStat",
  description:
    "Vergelijk verkiezingsbeloften met het stemgedrag van partijen in de Tweede Kamer.",
};

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
  return d === "VOOR" ? "Verwacht: voor" : d === "TEGEN" ? "Verwacht: tegen" : d;
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

  const { items: rawItems, total } = data;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Client-side sort
  const items = searchParams.sort
    ? [...rawItems].sort((a, b) => {
        switch (searchParams.sort) {
          case "partij":
            return a.program.party.abbreviation.localeCompare(b.program.party.abbreviation);
          case "thema":
            return a.theme.localeCompare(b.theme);
          default:
            return 0;
        }
      })
    : rawItems;

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
        currentSort={searchParams.sort}
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
                  <span className="hidden sm:inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
                    {specificityLabel(promise.specificity)}
                  </span>
                  {promise.expectedVoteDirection && (
                    <span className="hidden sm:inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
                      {directionLabel(promise.expectedVoteDirection)}
                    </span>
                  )}
                  <span className="hidden sm:inline text-[11px] text-text-tertiary ml-auto font-mono">
                    {promise.promiseCode}
                  </span>
                </div>

                {/* Summary */}
                <h2 className="text-[15px] font-medium text-ink leading-snug mb-1.5">
                  <Link
                    href={routes.tk.belofte(promise.id)}
                    className="hover:text-moss transition-colors"
                  >
                    {promise.summary}
                  </Link>
                </h2>
                <span className="sm:hidden text-[11px] text-text-tertiary font-mono">
                  {promise.promiseCode}
                </span>

                {/* Original program text */}
                <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-3">
                  {promise.text}
                </p>

                {/* Source line */}
                <div className="mt-2 text-[11px] text-text-tertiary">
                  Bron:{" "}
                  <span className="italic">
                    {promise.program.title}
                  </span>{" "}
                  ({promise.program.electionYear})
                  {promise.pageRef && <> &middot; p. {promise.pageRef}</>}
                </div>
              </div>

              {/* Motion matches */}
              {stats.total > 0 ? (
                <MotionMatchList
                  matches={promise.motionMatches}
                  adopted={stats.adopted}
                  rejected={stats.rejected}
                  noVote={stats.noVote}
                />
              ) : (
                <div className="border-t border-border-subtle px-5 py-3 bg-surface-sub/30">
                  <span className="text-[11px] text-text-tertiary">
                    Nog geen gerelateerde moties gevonden. Wordt automatisch bijgewerkt wanneer relevante moties worden ingediend en gestemd.
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
                label="\u2190 Vorige"
              />
            )}
            {page < totalPages && (
              <PaginationLink
                page={page + 1}
                partij={searchParams.partij}
                thema={searchParams.thema}
                label="Volgende \u2192"
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
      href={`${routes.tk.beloften}?${sp.toString()}`}
      className="rounded-lg border border-border px-3.5 py-1.5 text-[13px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
    >
      {label}
    </Link>
  );
}
