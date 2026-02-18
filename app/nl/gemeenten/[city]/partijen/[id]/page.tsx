import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getParliament,
  getScopedParties,
  getScopedPromiseStats,
} from "../../../../../../lib/api";
import { getPartyColor, themeLabel } from "../../../../../../lib/utils";
import PartyAvatar from "../../../../../../components/PartyAvatar";
import { gemeente } from "../../../../../../lib/routes";

interface Props {
  params: Promise<{ city: string; id: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props) {
  const { city, id } = await params;
  try {
    const [parliament, parties] = await Promise.all([
      getParliament(city),
      getScopedParties(city),
    ]);
    const party = parties.find(
      (p) =>
        p.id === id ||
        p.abbreviation.toLowerCase() === id.toLowerCase(),
    );
    if (party) {
      return {
        title: `${party.abbreviation} — ${parliament.shortName} — CivicStat`,
        description: `${party.name} in de gemeenteraad van ${parliament.shortName}.`,
      };
    }
    return { title: "Partij — CivicStat" };
  } catch {
    return { title: "Partij — CivicStat" };
  }
}

export default async function GemeentePartyDetailPage({ params }: Props) {
  const { city, id } = await params;

  let parliament;
  try {
    parliament = await getParliament(city);
  } catch {
    notFound();
  }

  const r = gemeente(city);

  let parties;
  try {
    parties = await getScopedParties(city);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API.
        </div>
      </div>
    );
  }

  const party = parties.find(
    (p) =>
      p.id === id ||
      p.abbreviation.toLowerCase() === id.toLowerCase(),
  );

  if (!party) {
    notFound();
  }

  // Fetch promise stats for this parliament
  let promiseStats: { totalPromises: number; totalMatches: number; byParty: { abbreviation: string; name: string; count: number }[]; byTheme: { theme: string; count: number }[] } | null = null;
  try {
    promiseStats = await getScopedPromiseStats(city);
  } catch {}

  const partyPromiseCount = promiseStats?.byParty?.find(
    (p) => p.abbreviation.toLowerCase() === party.abbreviation.toLowerCase(),
  )?.count ?? 0;

  const color = getPartyColor(party.abbreviation, party.colorNeutral);
  const seats = party.seats ?? 0;
  const totalSeats = parliament.seats;

  // Prev/next navigation
  const sortedParties = [...parties]
    .filter((p) => p.seats > 0)
    .sort((a, b) => b.seats - a.seats);
  const currentIdx = sortedParties.findIndex(
    (p) => p.id === party.id,
  );
  const prevParty =
    currentIdx > 0 ? sortedParties[currentIdx - 1] : null;
  const nextParty =
    currentIdx >= 0 && currentIdx < sortedParties.length - 1
      ? sortedParties[currentIdx + 1]
      : null;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Breadcrumbs + prev/next */}
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[11px] text-text-tertiary flex items-center gap-1.5">
          <Link
            href="/"
            className="hover:text-moss transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href="/nl/gemeenten"
            className="hover:text-moss transition-colors"
          >
            Gemeenten
          </Link>
          <span>/</span>
          <Link
            href={r.root}
            className="hover:text-moss transition-colors"
          >
            {parliament.shortName}
          </Link>
          <span>/</span>
          <Link
            href={r.partijen}
            className="hover:text-moss transition-colors"
          >
            Partijen
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">
            {party.abbreviation}
          </span>
        </nav>
        <div className="flex items-center gap-2">
          {prevParty ? (
            <Link
              href={r.partij(prevParty.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
            >
              <svg
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {prevParty.abbreviation}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[12px] text-text-tertiary opacity-40">
              <svg
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
          )}
          {nextParty ? (
            <Link
              href={r.partij(nextParty.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
            >
              {nextParty.abbreviation}
              <svg
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[12px] text-text-tertiary opacity-40">
              <svg
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <PartyAvatar
          abbreviation={party.abbreviation}
          color={color}
          size="md"
          showColor
        />
        <div>
          <h1 className="font-serif text-[clamp(26px,4vw,34px)] text-ink leading-tight">
            {party.abbreviation}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {party.name}
          </p>
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
          <div className="section-label">Raadsleden</div>
          <div className="text-2xl font-serif text-ink">
            {party._count.mps}
          </div>
        </div>
        {partyPromiseCount > 0 && (
          <div className="card p-4">
            <div className="section-label">Beloften</div>
            <div className="text-2xl font-serif text-ink">
              {partyPromiseCount}
            </div>
          </div>
        )}
      </div>

      {/* Seat proportion bar */}
      {seats > 0 && totalSeats > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">
            Zetelverdeling
          </h2>
          <div className="card p-5">
            <div className="flex h-7 rounded-md overflow-hidden gap-px">
              {sortedParties.map((p) => {
                const pColor = getPartyColor(
                  p.abbreviation,
                  p.colorNeutral,
                );
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
              <span className="font-semibold text-ink">
                {party.abbreviation}
              </span>{" "}
              heeft {seats} van {totalSeats} zetels (
              {Math.round((seats / totalSeats) * 100)}%)
            </div>
          </div>
        </section>
      )}

      {/* Beloften link */}
      {partyPromiseCount > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">
            Beloften
          </h2>
          <Link
            href={`${r.beloften}?partij=${encodeURIComponent(party.abbreviation)}`}
            className="card p-5 block hover:bg-surface-sub/40 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink group-hover:text-moss transition-colors">
                  {partyPromiseCount} verkiezingsbeloften
                </div>
                <div className="text-[12px] text-text-tertiary mt-0.5">
                  Uit het verkiezingsprogramma van{" "}
                  {party.abbreviation} voor de
                  gemeenteraadsverkiezingen
                </div>
              </div>
              <svg
                width={20}
                height={20}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                className="text-text-tertiary group-hover:text-moss transition-colors"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        </section>
      )}

      {/* Coming soon for scorecards */}
      <section className="mb-8">
        <div className="card px-5 py-6 text-center border-dashed">
          <div className="text-[13px] text-text-tertiary">
            Belofteconsistentie en stempatroon voor gemeenteraadsfracties
            worden binnenkort beschikbaar.
          </div>
        </div>
      </section>
    </div>
  );
}
