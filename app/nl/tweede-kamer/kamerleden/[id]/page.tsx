import Link from "next/link";
import { getMember, getMemberScorecard } from "../../../../../lib/api";
import type { MpScorecard } from "../../../../../lib/types";
import { getPartyColor, formatDate } from "../../../../../lib/utils";
import PartyBadge from "../../../../../components/PartyBadge";
import { routes } from "../../../../../lib/routes";
import VoteBar from "../../../../../components/VoteBar";
import MemberPhoto from "../../../../../components/MemberPhoto";

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const member = await getMember(params.id);
    return { title: `${member.surname} — CivicStat` };
  } catch {
    return { title: "Kamerlid — CivicStat" };
  }
}

export default async function KamerlidDetailPage({ params }: { params: { id: string } }) {
  let member;
  try {
    member = await getMember(params.id);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <Link href={routes.tk.kamerleden} className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-ink mb-5">
          <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Terug naar kamerleden
        </Link>
        <div className="card p-6 text-sm text-text-secondary">Kon dit kamerlid niet laden.</div>
      </div>
    );
  }

  // Fetch scorecard (graceful degradation)
  let scorecard: MpScorecard | null = null;
  try {
    scorecard = await getMemberScorecard(params.id);
  } catch {
    // Scorecard not available — no problem
  }

  const color = getPartyColor(member.party.abbreviation, member.party.colorNeutral);
  const motions = member.motions || [];
  const vs = member.voteStats;

  // Separate motions by role
  const sponsored = motions.filter((m: any) =>
    m.sponsors?.some((s: any) => s.role === "indiener")
  );
  const cosigned = motions.filter((m: any) =>
    m.sponsors?.every((s: any) => s.role !== "indiener")
  );

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Back link */}
      <Link href={routes.tk.kamerleden} className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-ink mb-6">
        <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        Terug naar kamerleden
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <MemberPhoto tkId={member.tkId} name={member.name} size="lg" color={color} />
        <div>
          <h1 className="font-serif text-[clamp(24px,4vw,32px)] text-ink leading-tight">
            {member.surname}
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">{member.name}</p>
          <div className="mt-2">
            <Link href={routes.tk.partij(member.party.id)}>
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

      {/* Belofteconsistentie (MCS) */}
      {scorecard && scorecard.scoredPromises > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-serif text-xl text-ink">Belofteconsistentie</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sub border border-border px-2.5 py-0.5 text-[11px] font-semibold text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-text-secondary" />
              {scorecard.mandateConsistencyScore}%
            </span>
          </div>
          <p className="text-[13px] text-text-secondary mb-4 max-w-[68ch]">
            In hoeverre stemt {member.party.abbreviation} in lijn met de beloften uit het verkiezingsprogramma ({scorecard.electionYear}).
            Gebaseerd op {scorecard.scoredPromises} beoordeelde beloften.
          </p>

          <div className="card p-5 space-y-4">
            {/* MCS bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Mandaatconsistentie
                </span>
                <span className="text-[12px] text-text-secondary font-mono">
                  {scorecard.mandateConsistencyScore}%
                </span>
              </div>
              <div className="flex overflow-hidden bg-mist" style={{ height: 14, borderRadius: 7 }}>
                {scorecard.consistentCount > 0 && (
                  <div
                    className="bg-bar-voor transition-[width] duration-500 ease-out"
                    style={{ width: `${(scorecard.consistentCount / scorecard.scoredPromises) * 100}%` }}
                    title={`Consistent: ${scorecard.consistentCount}`}
                  />
                )}
                {scorecard.mixedCount > 0 && (
                  <div
                    className="bg-amber-400/60 transition-[width] duration-500 ease-out"
                    style={{ width: `${(scorecard.mixedCount / scorecard.scoredPromises) * 100}%` }}
                    title={`Gemengd: ${scorecard.mixedCount}`}
                  />
                )}
                {scorecard.inconsistentCount > 0 && (
                  <div
                    className="bg-bar-tegen transition-[width] duration-500 ease-out"
                    style={{ width: `${(scorecard.inconsistentCount / scorecard.scoredPromises) * 100}%` }}
                    title={`Inconsistent: ${scorecard.inconsistentCount}`}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-text-tertiary">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-bar-voor" />
                  Consistent ({scorecard.consistentCount})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400/60" />
                  Gemengd ({scorecard.mixedCount})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-bar-tegen" />
                  Inconsistent ({scorecard.inconsistentCount})
                </span>
                {scorecard.insufficientDataPromises > 0 && (
                  <span className="ml-auto">
                    {scorecard.insufficientDataPromises} onvoldoende data
                  </span>
                )}
              </div>
            </div>

            {/* Per-theme breakdown */}
            {Object.keys(scorecard.byTheme).length > 0 && (
              <div className="border-t border-border-subtle pt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-3">
                  Per thema
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(scorecard.byTheme)
                    .sort(([,a], [,b]) => b.total - a.total)
                    .map(([theme, data]) => {
                      const scored = data.consistent + data.inconsistent + data.mixed;
                      const pct = scored > 0 ? Math.round((data.consistent / scored) * 100) : 0;
                      return (
                        <div key={theme} className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-surface-sub text-[12px]">
                          <span className="text-ink capitalize">{theme.toLowerCase()}</span>
                          <span className={`font-mono text-[11px] ${pct >= 60 ? "text-moss" : pct <= 30 ? "text-text-tertiary" : "text-text-secondary"}`}>
                            {scored > 0 ? `${pct}%` : "–"}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div className="card px-4 py-3 mt-3 bg-surface-sub/50">
            <p className="text-[12px] text-text-secondary leading-relaxed">
              <span className="font-semibold text-ink">Hoe lezen?</span>{" "}
              De score geeft aan welk percentage van de beoordeelde verkiezingsbeloften consistent
              is teruggestemd door {member.party.abbreviation}. De meeste stemmingen zijn &apos;met
              handopsteken&apos; (partijniveau) — individueel stemgedrag is alleen beschikbaar
              bij hoofdelijke stemmingen.
            </p>
          </div>

          {/* Link to party scorecard */}
          <div className="mt-2">
            <Link
              href={routes.tk.partij(member.party.id)}
              className="text-[12px] text-text-secondary hover:text-ink underline underline-offset-2"
            >
              Bekijk de volledige partijscorecard van {member.party.abbreviation} →
            </Link>
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
                  href={routes.tk.motie(m.id)}
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-sub ${
                    i < motions.length - 1 ? "border-b border-border-subtle" : ""
                  }`}
                >
                  <span className="shrink-0 w-[70px] text-center text-[11px] font-medium text-text-tertiary capitalize">
                    {role}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink truncate">{m.title}</div>
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
            Moties waarbij dit kamerlid als indiener of mede-indiener betrokken is.
          </p>
        </section>
      )}
    </div>
  );
}
