import Link from "next/link";
import { notFound } from "next/navigation";
import { getParliament, getScopedMotions } from "../../../../../lib/api";
import { gemeente } from "../../../../../lib/routes";
import type { MotionListItem } from "../../../../../lib/types";
import { formatDate } from "../../../../../lib/utils";
import PartyBadge from "../../../../../components/PartyBadge";
import StatusBadge from "../../../../../components/StatusBadge";
import VoteBar from "../../../../../components/VoteBar";

interface Props {
  params: Promise<{ city: string }>;
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 25;

export const revalidate = 1800;

export async function generateMetadata({ params }: Props) {
  const { city } = await params;
  try {
    const parliament = await getParliament(city);
    return {
      title: `Moties — ${parliament.shortName}`,
      description: `Alle raadsmoties van ${parliament.shortName} met stemresultaten.`,
    };
  } catch {
    return { title: "Moties" };
  }
}

export default async function GemeenteMotiesPage({ params, searchParams }: Props) {
  const { city } = await params;
  const sp = await searchParams;

  let parliament;
  try {
    parliament = await getParliament(city);
  } catch {
    notFound();
  }

  const r = gemeente(city);
  const page = Math.max(1, Number(sp.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  let data;
  try {
    data = await getScopedMotions(city, {
      status: sp.status,
      q: sp.q,
      limit: PAGE_SIZE,
      offset,
    });
  } catch {
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

  function getVote(m: MotionListItem) {
    if (m.vote) return m.vote;
    if (m.votes && m.votes.length > 0) return m.votes[0];
    return null;
  }

  function getSponsorParty(m: MotionListItem) {
    const sponsor = m.sponsors?.[0];
    if (sponsor?.mp?.party) return sponsor.mp.party;
    return null;
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-text-tertiary mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-moss transition-colors">Home</Link>
        <span>/</span>
        <Link href="/nl/gemeenten" className="hover:text-moss transition-colors">Gemeenten</Link>
        <span>/</span>
        <Link href={r.root} className="hover:text-moss transition-colors">{parliament.shortName}</Link>
        <span>/</span>
        <span className="text-ink font-medium">Moties</span>
      </nav>

      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Moties
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">
        {total.toLocaleString("nl-NL")} raadsmoties van{" "}
        {parliament.shortName}.
      </p>

      {/* Simple search */}
      <form className="mb-5">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Zoek in moties..."
            className="flex-1 rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-ink placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-moss/30"
          />
          <button
            type="submit"
            className="rounded-lg bg-moss px-4 py-2 text-sm font-medium text-white hover:bg-moss-hover transition-colors"
          >
            Zoek
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_100px_80px_100px] gap-2 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary border-b border-border bg-surface-sub rounded-t-card">
          <span>Motie</span>
          <span>Datum</span>
          <span>Uitslag</span>
          <span>Status</span>
        </div>

        {items.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-text-tertiary">
            Geen moties gevonden.
          </div>
        )}
        {items.map((m, i) => {
          const vote = getVote(m);
          const party = getSponsorParty(m);

          return (
            <Link
              key={m.id}
              href={r.motie(m.id)}
              className={`block sm:grid sm:grid-cols-[1fr_100px_80px_100px] items-center gap-2 px-5 py-3.5 table-row-hover ${
                i < items.length - 1 ? "border-b border-border-subtle" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink truncate">
                  {m.title}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
                  {party && (
                    <PartyBadge
                      abbreviation={party.abbreviation}
                      colorNeutral={party.colorNeutral}
                      size="sm"
                    />
                  )}
                </div>
              </div>

              <span className="hidden sm:block text-[13px] text-text-secondary">
                {formatDate(m.dateIntroduced)}
              </span>

              <div className="hidden sm:block w-[60px]">
                {vote ? (
                  <>
                    <VoteBar
                      voor={vote.totalFor}
                      tegen={vote.totalAgainst}
                      height={6}
                    />
                    <div className="mt-0.5 text-[11px] text-text-tertiary">
                      {vote.totalFor}&ndash;{vote.totalAgainst}
                    </div>
                  </>
                ) : (
                  <span className="text-[11px] text-text-tertiary">&ndash;</span>
                )}
              </div>

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
                    <span>{vote.totalFor}&ndash;{vote.totalAgainst}</span>
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
              <PagLink
                basePath={r.moties}
                page={page - 1}
                status={sp.status}
                q={sp.q}
                label="\u2190 Vorige"
              />
            )}
            {page < totalPages && (
              <PagLink
                basePath={r.moties}
                page={page + 1}
                status={sp.status}
                q={sp.q}
                label="Volgende \u2192"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PagLink({
  basePath,
  page,
  status,
  q,
  label,
}: {
  basePath: string;
  page: number;
  status?: string;
  q?: string;
  label: string;
}) {
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  if (status) sp.set("status", status);
  if (q) sp.set("q", q);

  return (
    <Link
      href={`${basePath}?${sp.toString()}`}
      className="rounded-lg border border-border px-3.5 py-1.5 text-[13px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
    >
      {label}
    </Link>
  );
}
