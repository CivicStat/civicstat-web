import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getParliament,
  getScopedMotions,
  getScopedParties,
  getScopedStats,
  getScopedPromiseStats,
} from "../../../../lib/api";
import { formatDate, getPartyColor } from "../../../../lib/utils";
import PartyBadge from "../../../../components/PartyBadge";
import StatusBadge from "../../../../components/StatusBadge";
import VoteBar from "../../../../components/VoteBar";
import PartyAvatar from "../../../../components/PartyAvatar";
import { gemeente } from "../../../../lib/routes";

export const revalidate = 300;

interface Props {
  params: Promise<{ city: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { city } = await params;
  try {
    const parliament = await getParliament(city);
    return {
      title: `${parliament.shortName}`,
      description: `Overzicht gemeenteraad ${parliament.shortName} — moties, stemgedrag en partijanalyse.`,
    };
  } catch {
    return { title: "Gemeenteraad" };
  }
}

/* ── tiny inline icons ─────────────────────────────────── */
function MotionIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function MemberIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function PartyIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" />
    </svg>
  );
}
function VoteIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function PromiseIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default async function CityDashboardPage({ params }: Props) {
  const { city } = await params;

  let parliament;
  try {
    parliament = await getParliament(city);
  } catch {
    notFound();
  }

  const r = gemeente(city);

  const [motionsResult, partiesResult, statsResult, promiseStatsResult] =
    await Promise.allSettled([
      getScopedMotions(city, { limit: 8 }),
      getScopedParties(city),
      getScopedStats(city),
      getScopedPromiseStats(city),
    ]);

  const recentMotions =
    motionsResult.status === "fulfilled"
      ? motionsResult.value.items.slice(0, 5)
      : null;
  const parties =
    partiesResult.status === "fulfilled" ? partiesResult.value : null;
  const stats =
    statsResult.status === "fulfilled" ? statsResult.value : null;
  const promiseStats =
    promiseStatsResult.status === "fulfilled" ? promiseStatsResult.value : null;

  const quickCards = [
    {
      icon: <MotionIcon />,
      label: "Moties",
      count: stats?.motions ?? parliament._count.motions,
      href: r.moties,
      desc: "Ingediende raadsmoties met stemresultaten",
    },
    {
      icon: <PartyIcon />,
      label: "Partijen",
      count: stats?.parties ?? parliament._count.parties,
      href: r.partijen,
      desc: "Raadsfracties en zetelverdeling",
    },
    {
      icon: <MemberIcon />,
      label: "Raadsleden",
      count: stats?.members ?? parliament._count.mps,
      href: r.raadsleden,
      desc: "Gemeenteraadsleden en hun stemgedrag",
    },
    {
      icon: <VoteIcon />,
      label: "Stemmingen",
      count: stats?.votes ?? parliament._count.votes,
      href: r.moties,
      desc: "Stemresultaten per motie",
    },
    ...(promiseStats && promiseStats.totalPromises > 0
      ? [
          {
            icon: <PromiseIcon />,
            label: "Beloften",
            count: promiseStats.totalPromises,
            href: r.beloften,
            desc: "Verkiezingsbeloften gekoppeld aan stemgedrag",
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-20">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-text-tertiary mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-moss transition-colors">
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
        <span className="text-ink font-medium">{parliament.shortName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
          Gemeenteraad
        </p>
        <h1 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink leading-[1.2] tracking-tight">
          {parliament.name}
        </h1>
        <p className="text-[15px] text-text-secondary mt-2 max-w-[540px] leading-relaxed">
          Overzicht van raadsmoties, stemgedrag en partijanalyse voor de
          gemeenteraad van {parliament.shortName} — {parliament.seats} zetels.
        </p>
      </div>

      {/* Quick-access cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {quickCards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="card p-4 group hover:border-moss/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2 text-text-tertiary group-hover:text-moss transition-colors">
              {c.icon}
              <span className="text-[13px] font-semibold text-ink">
                {c.label}
              </span>
            </div>
            {c.count != null && (
              <div className="text-[28px] font-serif text-ink leading-none mb-1">
                {c.count.toLocaleString("nl-NL")}
              </div>
            )}
            <p className="text-[11px] text-text-tertiary leading-snug">
              {c.desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: parties (3 cols) */}
        <div className="lg:col-span-3">
          {parties && parties.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="section-label">Fracties</div>
                  <h2 className="font-serif text-[20px] font-normal text-ink mt-1">
                    Partijen in de raad
                  </h2>
                </div>
                <Link
                  href={r.partijen}
                  className="text-[12px] font-medium text-moss hover:underline inline-flex items-center gap-1"
                >
                  Alle partijen <ArrowIcon />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {parties
                  .sort((a, b) => b.seats - a.seats)
                  .slice(0, 9)
                  .map((p) => {
                    const color = getPartyColor(
                      p.abbreviation,
                      p.colorNeutral,
                    );
                    return (
                      <Link
                        key={p.id}
                        href={r.partij(p.id)}
                        className="card p-3.5 hover:border-moss/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 mb-2">
                          <PartyAvatar
                            abbreviation={p.abbreviation}
                            color={color}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="text-[12px] font-semibold text-ink truncate">
                              {p.abbreviation}
                            </div>
                            <div className="text-[10px] text-text-tertiary">
                              {p.seats} {p.seats === 1 ? "zetel" : "zetels"}
                            </div>
                          </div>
                        </div>
                        <div className="text-[11px] text-text-tertiary">
                          {p._count.mps}{" "}
                          {p._count.mps === 1 ? "raadslid" : "raadsleden"}
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>
          )}
        </div>

        {/* Right: recent motions (2 cols) */}
        <div className="lg:col-span-2">
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="section-label">Stemmingen</div>
                <h2 className="font-serif text-[20px] font-normal text-ink mt-1">
                  Laatste moties
                </h2>
              </div>
              <Link
                href={r.moties}
                className="text-[12px] font-medium text-moss hover:underline inline-flex items-center gap-1"
              >
                Alle moties <ArrowIcon />
              </Link>
            </div>
            {recentMotions && recentMotions.length > 0 ? (
              <div className="card overflow-hidden">
                {recentMotions.map((m, i) => {
                  const vote = m.vote || m.votes?.[0];
                  const party = m.sponsors?.[0]?.mp?.party;
                  return (
                    <Link
                      key={m.id}
                      href={r.motie(m.id)}
                      className={`flex items-center gap-3 px-4 py-3 table-row-hover ${
                        i < recentMotions.length - 1
                          ? "border-b border-border-subtle"
                          : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-ink truncate">
                          {m.title}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-tertiary">
                          <span>{formatDate(m.dateIntroduced)}</span>
                          {party && (
                            <>
                              <span>&middot;</span>
                              <PartyBadge
                                abbreviation={party.abbreviation}
                                colorNeutral={party.colorNeutral}
                                size="sm"
                              />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {vote &&
                        (vote.totalFor > 0 || vote.totalAgainst > 0) ? (
                          <div className="w-16 hidden sm:block">
                            <VoteBar
                              voor={vote.totalFor}
                              tegen={vote.totalAgainst}
                              height={5}
                            />
                          </div>
                        ) : null}
                        {vote?.result ? (
                          <StatusBadge status={vote.result} size="sm" />
                        ) : (
                          <span className="text-[10px] text-text-tertiary whitespace-nowrap">
                            Geen stemming
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="card p-5 text-[13px] text-text-tertiary">
                {recentMotions
                  ? "Nog geen moties beschikbaar."
                  : "Kon moties niet laden."}
              </div>
            )}
          </section>

          {/* Stats summary */}
          {stats && (
            <section className="mt-6">
              <div className="section-label mb-3">Raad in cijfers</div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { n: stats.motions, l: "Moties" },
                  { n: stats.votes, l: "Stemmingen" },
                  { n: stats.parties, l: "Partijen" },
                  { n: stats.members, l: "Raadsleden" },
                  ...(promiseStats && promiseStats.totalPromises > 0
                    ? [{ n: promiseStats.totalPromises, l: "Beloften" }]
                    : []),
                ].map((s) => (
                  <div key={s.l} className="card p-3 text-center">
                    <div className="text-[20px] font-serif text-ink leading-none">
                      {s.n.toLocaleString("nl-NL")}
                    </div>
                    <div className="text-[10px] text-text-tertiary mt-1">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
