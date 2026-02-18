import Link from "next/link";
import { notFound } from "next/navigation";
import { getParliament, getScopedParties } from "../../../../../lib/api";
import { getPartyColor } from "../../../../../lib/utils";
import PartyAvatar from "../../../../../components/PartyAvatar";
import { gemeente } from "../../../../../lib/routes";

interface Props {
  params: Promise<{ city: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props) {
  const { city } = await params;
  try {
    const parliament = await getParliament(city);
    return {
      title: `Partijen — ${parliament.shortName}`,
      description: `Raadsfracties van ${parliament.shortName} met zetelverdeling.`,
    };
  } catch {
    return { title: "Partijen" };
  }
}

export default async function GemeentePartijenPage({ params }: Props) {
  const { city } = await params;

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
        <h1 className="font-serif text-[26px] text-ink mb-2">Partijen</h1>
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API.
        </div>
      </div>
    );
  }

  const activeParties = parties.filter((p) => p.seats > 0);
  const totalSeats = parliament.seats;

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
        <span className="text-ink font-medium">Partijen</span>
      </nav>

      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Partijen
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">
        Fracties in de gemeenteraad van {parliament.shortName} met zetelverdeling.
      </p>

      {/* Seat distribution bar */}
      {activeParties.length > 0 && (
        <div className="card p-[18px] mb-6">
          <div className="section-label">
            Zetelverdeling ({totalSeats} zetels)
          </div>
          <div className="flex h-7 rounded-md overflow-hidden gap-px">
            {activeParties
              .sort((a, b) => b.seats - a.seats)
              .map((p) => {
                const color = getPartyColor(p.abbreviation, p.colorNeutral);
                return (
                  <Link
                    key={p.id}
                    href={r.partij(p.id)}
                    title={`${p.abbreviation}: ${p.seats} ${p.seats === 1 ? "zetel" : "zetels"}`}
                    className="block transition-opacity hover:opacity-100"
                    style={{
                      width: `${(p.seats / totalSeats) * 100}%`,
                      backgroundColor: color,
                      opacity: 0.8,
                      minWidth: p.seats > 1 ? 4 : 2,
                    }}
                  />
                );
              })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
            {activeParties
              .sort((a, b) => b.seats - a.seats)
              .map((p) => (
                <Link
                  key={p.id}
                  href={r.partij(p.id)}
                  className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-ink transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor: getPartyColor(p.abbreviation, p.colorNeutral),
                      opacity: 0.8,
                    }}
                  />
                  {p.abbreviation} ({p.seats})
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Party table */}
      <div className="card overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[1fr_70px_80px] gap-2 px-5 py-2.5 border-b border-border bg-surface-sub/30 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
          <span>Partij</span>
          <span className="text-right">Zetels</span>
          <span className="text-right">Raadsleden</span>
        </div>

        {parties
          .sort((a, b) => b.seats - a.seats)
          .map((p, idx) => {
            const color = getPartyColor(p.abbreviation, p.colorNeutral);
            return (
              <Link
                key={p.id}
                href={r.partij(p.id)}
                className={`block hover:bg-surface-sub/40 transition-colors ${
                  idx < parties.length - 1 ? "border-b border-border-subtle" : ""
                }`}
              >
                {/* Desktop row */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_70px_80px] gap-2 items-center px-5 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <PartyAvatar abbreviation={p.abbreviation} color={color} size="sm" />
                    <div className="min-w-0">
                      <span className="text-[14px] font-semibold text-ink">
                        {p.abbreviation}
                      </span>
                      <div className="text-[11px] text-text-tertiary truncate">
                        {p.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[18px] font-serif text-ink">
                      {p.seats}
                    </span>
                  </div>
                  <div className="text-right text-[13px] text-text-secondary">
                    {p._count.mps}
                  </div>
                </div>

                {/* Mobile card */}
                <div className="sm:hidden px-4 py-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <PartyAvatar abbreviation={p.abbreviation} color={color} size="sm" />
                      <div>
                        <span className="text-[15px] font-semibold text-ink">
                          {p.abbreviation}
                        </span>
                        <div className="text-[11px] text-text-tertiary truncate max-w-[180px]">
                          {p.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-serif text-ink">
                        {p.seats}
                      </span>
                      <span className="text-[11px] text-text-tertiary ml-0.5">
                        {p.seats === 1 ? "zetel" : "zetels"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
