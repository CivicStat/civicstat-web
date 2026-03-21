import Link from "next/link";
import { notFound } from "next/navigation";
import { getParliament, getScopedMember } from "../../../../../../lib/api";
import { getPartyColor, formatDate } from "../../../../../../lib/utils";
import PartyBadge from "../../../../../../components/PartyBadge";
import VoteBar from "../../../../../../components/VoteBar";
import MemberPhoto from "../../../../../../components/MemberPhoto";
import { gemeente } from "../../../../../../lib/routes";

interface Props {
  params: Promise<{ city: string; id: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props) {
  const { city, id } = await params;
  try {
    const member = await getScopedMember(city, id);
    const parliament = await getParliament(city);
    return {
      title: `${member.surname} — ${parliament.shortName} — CivicStat`,
    };
  } catch {
    return { title: "Raadslid — CivicStat" };
  }
}

export default async function RaadslidDetailPage({ params }: Props) {
  const { city, id } = await params;

  let parliament;
  try {
    parliament = await getParliament(city);
  } catch {
    notFound();
  }

  const r = gemeente(city);

  let member;
  try {
    member = await getScopedMember(city, id);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <Link
          href={r.raadsleden}
          className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-ink mb-5"
        >
          <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Terug naar raadsleden
        </Link>
        <div className="card p-6 text-sm text-text-secondary">
          Kon dit raadslid niet laden.
        </div>
      </div>
    );
  }

  const color = getPartyColor(member.party.abbreviation, member.party.colorNeutral);
  const motions = member.motions || [];
  const vs = member.voteStats;

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
        <Link href={r.raadsleden} className="hover:text-moss transition-colors">Raadsleden</Link>
        <span>/</span>
        <span className="text-ink font-medium">{member.surname}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <MemberPhoto tkId={member.tkId} name={member.name} size="lg" color={color} />
        <div>
          <h1 className="font-serif text-[clamp(24px,4vw,32px)] text-ink leading-tight">
            {member.surname}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">{member.name}</p>
          <div className="mt-2">
            <Link href={r.partij(member.party.id)}>
              <PartyBadge abbreviation={member.party.abbreviation} colorNeutral={member.party.colorNeutral} size="md" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="card p-4">
          <div className="section-label">Moties</div>
          <div className="text-2xl font-serif text-ink">{motions.length}</div>
        </div>
        {vs && vs.totalVotes > 0 && (
          <>
            <div className="card p-4">
              <div className="section-label">Stemmingen</div>
              <div className="text-2xl font-serif text-ink">{vs.totalVotes}</div>
            </div>
            <div className="card p-4">
              <div className="section-label">Voor gestemd</div>
              <div className="text-2xl font-serif text-ink">{vs.for}</div>
            </div>
            <div className="card p-4">
              <div className="section-label">Tegen gestemd</div>
              <div className="text-2xl font-serif text-ink">{vs.against}</div>
            </div>
          </>
        )}
        {(!vs || vs.totalVotes === 0) && member.startDate && (
          <div className="card p-4">
            <div className="section-label">Actief sinds</div>
            <div className="text-lg font-serif text-ink">{formatDate(member.startDate)}</div>
          </div>
        )}
      </div>

      {/* Voting pattern */}
      {vs && vs.totalVotes > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">Stempatroon</h2>
          <div className="card p-5">
            <VoteBar voor={vs.for} tegen={vs.against} afwezig={vs.abstain || 0} height={12} showLabels />
            {vs.participationRate != null && (
              <p className="text-[12px] text-text-tertiary mt-3">
                Participatiegraad: {vs.participationRate}%
                {vs.absent ? ` · ${vs.absent} keer afwezig` : ""}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Motions */}
      {motions.length > 0 && (
        <section>
          <h2 className="font-serif text-xl text-ink mb-4">Moties ({motions.length})</h2>
          <div className="card p-0">
            {motions.map((m: any, i: number) => {
              const role = m.sponsors?.[0]?.role || "indiener";
              return (
                <Link
                  key={m.id}
                  href={r.motie(m.id)}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-sub ${
                    i < motions.length - 1 ? "border-b border-border-subtle" : ""
                  }`}
                >
                  <span className="shrink-0 w-[70px] text-center text-[11px] font-medium text-text-tertiary capitalize">
                    {role}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink truncate" title={m.title}>{m.title}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[12px] text-text-tertiary">
                      <span>{m.tkNumber}</span>
                      {m.dateIntroduced && <><span>·</span><span>{formatDate(m.dateIntroduced)}</span></>}
                      {m.vote && (
                        <>
                          <span>·</span>
                          <span>{m.vote.result}</span>
                          <span>{m.vote.totalFor}–{m.vote.totalAgainst}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="text-[12px] text-text-tertiary mt-3">
            Moties waarbij dit raadslid als indiener of mede-indiener betrokken is.
          </p>
        </section>
      )}
    </div>
  );
}
