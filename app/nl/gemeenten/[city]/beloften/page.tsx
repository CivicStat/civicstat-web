import Link from "next/link";
import { getScopedPromises, getScopedParties, getParliament } from "../../../../../lib/api";
import type { PromiseListItem } from "../../../../../lib/types";
import { themeLabel, formatSpecificity } from "../../../../../lib/utils";
import PartyBadge from "../../../../../components/PartyBadge";
import { gemeente } from "../../../../../lib/routes";
import MunicipalBeloftenFilters from "./MunicipalBeloftenFilters";

interface Props {
  params: { city: string };
  searchParams: {
    partij?: string;
    thema?: string;
    jaar?: string;
    page?: string;
  };
}

const PAGE_SIZE = 25;

export async function generateMetadata({ params }: { params: { city: string } }) {
  let name = params.city;
  try {
    const parliament = await getParliament(params.city);
    name = parliament.shortName;
  } catch {}
  return {
    title: `Beloften ${name} — CivicStat`,
    description: `Verkiezingsbeloften uit gemeenteraadsprogramma's van ${name}, vergeleken met stemgedrag.`,
  };
}

export default async function MunicipalBeloftenPage({ params, searchParams }: Props) {
  const slug = params.city;
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;
  const routes = gemeente(slug);

  let data;
  let parties: { abbreviation: string; id: string }[] = [];
  let cityName = slug;

  try {
    const [promiseData, partyData, parliament] = await Promise.all([
      getScopedPromises(slug, {
        party: searchParams.partij,
        theme: searchParams.thema,
        year: searchParams.jaar ? Number(searchParams.jaar) : undefined,
        limit: PAGE_SIZE,
        offset,
      }),
      getScopedParties(slug),
      getParliament(slug),
    ]);
    data = promiseData;
    parties = partyData.map((p) => ({
      abbreviation: p.abbreviation,
      id: p.id,
    }));
    cityName = parliament.shortName;
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-2xl text-ink mb-2">Beloften</h1>
        <div className="card p-6 text-text-secondary text-sm">
          Er zijn nog geen beloften beschikbaar voor deze gemeente, of de API is
          niet bereikbaar. Binnenkort worden verkiezingsbeloften geanalyseerd en
          gekoppeld aan stemgedrag.
        </div>
      </div>
    );
  }

  const { items: rawItems, total } = data;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Sort by theme then code
  const items = rawItems;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Header */}
      <p className="text-[11px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
        {cityName}
      </p>
      <h1 className="font-serif text-[clamp(22px,3.5vw,28px)] font-normal text-ink mb-1.5">
        Verkiezingsbeloften
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">
        {total} beloften uit {searchParams.jaar ? `verkiezingsprogramma's ${searchParams.jaar}` : "gemeenteraadsprogramma\u2019s"}, vergeleken met
        stemgedrag in de gemeenteraad van {cityName}.
      </p>

      {/* Filters */}
      <MunicipalBeloftenFilters
        currentParty={searchParams.partij}
        currentTheme={searchParams.thema}
        currentYear={searchParams.jaar}
        parties={parties}
        citySlug={slug}
      />

      {/* Promise cards */}
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="card px-5 py-10 text-center text-sm text-text-tertiary">
            Geen beloften gevonden voor deze filters.
          </div>
        )}

        {items.map((promise: PromiseListItem) => {
          const matchCount = promise.motionMatches?.length ?? 0;

          return (
            <div key={promise.id} className="card overflow-hidden">
              <div className="px-5 pt-4 pb-3">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Link
                    href={`${routes.beloften}?partij=${encodeURIComponent(promise.program.party.abbreviation)}`}
                  >
                    <PartyBadge
                      abbreviation={promise.program.party.abbreviation}
                      colorNeutral={promise.program.party.colorNeutral}
                      size="sm"
                    />
                  </Link>
                  <Link
                    href={`${routes.beloften}?thema=${encodeURIComponent(promise.theme)}`}
                    className="inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-semibold text-text-secondary hover:border-moss/40 hover:text-moss transition-colors"
                  >
                    {themeLabel(promise.theme)}
                  </Link>
                  <span className="hidden sm:inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] font-medium text-text-tertiary">
                    {formatSpecificity(promise.specificity).label}
                  </span>
                  <span className="hidden sm:inline text-[11px] text-text-tertiary ml-auto font-mono">
                    {promise.promiseCode}
                  </span>
                </div>

                {/* Summary */}
                <Link href={routes.belofte(promise.id)} className="block group">
                <h2 className="text-[15px] font-medium text-ink group-hover:text-moss transition-colors leading-snug mb-1.5">
                  {promise.summary}
                </h2>
                <span className="sm:hidden text-[11px] text-text-tertiary font-mono">
                  {promise.promiseCode}
                </span>

                {/* Original text */}
                <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-3">
                  {promise.text}
                </p>

                {/* Source */}
                <div className="mt-2 text-[11px] text-text-tertiary">
                  Bron:{" "}
                  <span className="italic">
                    {promise.program.title}
                  </span>{" "}
                  ({promise.program.electionYear})
                </div>
                </Link>
              </div>

              {/* Motion matches footer */}
              {matchCount > 0 ? (
                <div className="border-t border-border-subtle px-5 py-3 bg-surface-sub/30">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    {matchCount} gerelateerde motie{matchCount !== 1 ? "s" : ""}
                  </span>
                </div>
              ) : (
                <div className="border-t border-border-subtle px-5 py-3 bg-surface-sub/30">
                  <span className="text-[11px] text-text-tertiary">
                    Wordt automatisch gekoppeld aan relevante raadsmoties.
                  </span>
                </div>
              )}
            </div>
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
                jaar={searchParams.jaar}
                basePath={routes.beloften}
                label={"\u2190 Vorige"}
              />
            )}
            {page < totalPages && (
              <PaginationLink
                page={page + 1}
                partij={searchParams.partij}
                thema={searchParams.thema}
                jaar={searchParams.jaar}
                basePath={routes.beloften}
                label={"Volgende \u2192"}
              />
            )}
          </div>
        </div>
      )}

      {/* Methodology */}
      <div className="mt-6 card px-5 py-4">
        <h3 className="text-[13px] font-semibold text-ink mb-1">
          Over deze data
        </h3>
        <p className="text-[12px] text-text-secondary leading-relaxed">
          Beloften zijn geëxtraheerd uit officiële gemeentelijke
          verkiezingsprogramma&apos;s via AI-analyse en worden gekoppeld aan
          raadsmoties. Niet alle moties zijn direct te koppelen aan een belofte.
          CivicStat geeft geen oordeel over partijen; alle data is openbaar en
          controleerbaar.
        </p>
      </div>
    </div>
  );
}

function PaginationLink({
  page,
  partij,
  thema,
  jaar,
  basePath,
  label,
}: {
  page: number;
  partij?: string;
  thema?: string;
  jaar?: string;
  basePath: string;
  label: string;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  if (partij) sp.set("partij", partij);
  if (thema) sp.set("thema", thema);
  if (jaar) sp.set("jaar", jaar);

  return (
    <Link
      href={`${basePath}?${sp.toString()}`}
      className="rounded-lg border border-border px-3.5 py-1.5 text-[13px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
    >
      {label}
    </Link>
  );
}
