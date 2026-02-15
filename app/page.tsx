import Link from "next/link";
import { getMotions, getAllScorecards, getPromiseStats } from "../lib/api";
import { formatDate, getPartyColor } from "../lib/utils";
import PartyBadge from "../components/PartyBadge";
import StatusBadge from "../components/StatusBadge";
import VoteBar from "../components/VoteBar";
import SearchBar from "../components/SearchBar";
import PartyAvatar from "../components/PartyAvatar";
import { routes } from "../lib/routes";

export const revalidate = 3600; // ISR: re-generate at most every hour

export default async function HomePage() {
  let recentMotions;
  let scorecards;
  const [motionsResult, scorecardsResult, statsResult] = await Promise.allSettled([
    getMotions({ limit: 20 }),
    getAllScorecards(),
    getPromiseStats(),
  ]);
  recentMotions =
    motionsResult.status === "fulfilled"
      ? motionsResult.value.items
          .filter((m) => m.vote || (m.votes && m.votes.length > 0))
          .slice(0, 5)
      : null;
  scorecards =
    scorecardsResult.status === "fulfilled" ? scorecardsResult.value : null;
  const promiseStats = statsResult.status === "fulfilled" ? statsResult.value : null;

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-moss/[0.04] via-mist to-surface-sub dark:from-moss/[0.06] dark:via-[#0E1623] dark:to-[#0E1623]" />
        {/* Subtle geometric pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-[72px] pb-16">
          <p className="text-[13px] font-medium text-moss tracking-wide mb-4">
            Onafhankelijke transparantie over politiek handelen
          </p>
          <h1 className="font-serif text-[clamp(30px,5vw,48px)] font-normal text-ink leading-[1.18] tracking-tight max-w-[640px] mb-5">
            Wat beloven partijen vóór verkiezingen — en hoe stemmen zij{" "}
            <span className="italic">daarna?</span>
          </h1>
          <p className="text-base leading-relaxed text-text-secondary max-w-[500px] mb-8">
            CivicStat maakt het zichtbaar.
            <br />
            Feitelijk. Controleerbaar. Open.
          </p>
          <div className="flex gap-2.5 flex-wrap mb-8">
            <Link
              href={routes.tk.partijen}
              className="inline-flex items-center gap-2 rounded-[9px] bg-moss px-5 py-2.5 text-sm font-medium text-white hover:bg-moss-hover transition-colors"
            >
              Bekijk partijen
            </Link>
            <Link
              href={routes.tk.moties}
              className="inline-flex items-center gap-2 rounded-[9px] border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-sub transition-colors"
            >
              Vergelijk stemgedrag
            </Link>
          </div>
          <SearchBar />
        </div>
      </div>

      {/* Platform stats banner */}
      {promiseStats && (
        <div className="border-b border-border-subtle">
          <div className="mx-auto max-w-[1200px] px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-serif text-ink">{promiseStats.totalPromises.toLocaleString("nl-NL")}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Beloften geanalyseerd</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-serif text-ink">{promiseStats.totalMatches.toLocaleString("nl-NL")}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Belofte-motie koppelingen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-serif text-ink">{promiseStats.byParty.length}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Partijen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-serif text-ink">{promiseStats.byTheme.length}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">Thema&apos;s</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1200px] px-6">
        {/* Why section */}
        <section className="py-14 border-b border-border-subtle">
          <h2 className="font-serif text-[clamp(24px,3.5vw,34px)] font-normal text-ink max-w-[560px] leading-[1.25] mb-5">
            Verkiezingsprogramma&apos;s zijn openbaar.
            <br />
            Stemgedrag is openbaar.
            <br />
            <span className="italic text-text-secondary">
              Maar de vertaalslag ontbreekt.
            </span>
          </h2>
          <p className="text-[15px] leading-relaxed text-text-secondary max-w-[540px] mb-6">
            CivicStat legt die verbinding — structureel, reproduceerbaar en
            zonder politieke agenda. Wij analyseren verkiezingsprogramma&apos;s,
            Kamerstemmen, moties en wetsvoorstellen.
          </p>
          <p className="text-[15px] font-medium text-ink max-w-[400px]">
            Niet op gevoel. Niet op framing. Op data.
          </p>
        </section>

        {/* Features */}
        <section className="py-12 border-b border-border-subtle">
          <div className="section-label">Wat CivicStat laat zien</div>
          <div className="grid gap-4 sm:grid-cols-3 mt-4">
            {[
              {
                title: "Belofte → Stemgedrag",
                desc: "Per partij, per thema: wat is beloofd? Wat is gesteund, verworpen of genegeerd?",
              },
              {
                title: "Scores zonder oordeel",
                desc: "Consistentiescores, afwijkingspercentages en stemfrequenties. Geen moreel oordeel.",
              },
              {
                title: "Individuele volksvertegenwoordigers",
                desc: "Niet alleen partijen, maar ook individuele Kamerleden. Wie stemt consequent?",
              },
            ].map((f, i) => (
              <div key={i} className="card p-6">
                <h3 className="font-serif text-lg text-ink mb-2">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Belofteconsistentie teaser */}
        {scorecards && scorecards.length > 0 && (
          <section className="py-12 border-b border-border-subtle">
            <div className="flex items-baseline justify-between mb-5">
              <div>
                <div className="section-label">Belofteconsistentie</div>
                <h2 className="font-serif text-[22px] font-normal text-ink mt-1.5">
                  Hoe consistent zijn partijen?
                </h2>
              </div>
              <Link
                href={routes.tk.partijen}
                className="text-[13px] font-medium text-moss hover:underline"
              >
                Alle partijen →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {scorecards
                .sort((a, b) => b.mandateConsistencyScore - a.mandateConsistencyScore)
                .map((sc) => {
                  const color = getPartyColor(sc.abbreviation);
                  return (
                    <Link
                      key={sc.partyId}
                      href={routes.tk.partij(sc.partyId)}
                      className="card p-4 hover:border-moss/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <PartyAvatar abbreviation={sc.abbreviation} color={color} size="sm" />
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-ink">{sc.abbreviation}</div>
                          <div className="text-[11px] text-text-tertiary">{sc.scoredPromises} beloften</div>
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="text-[28px] font-serif text-ink leading-none">{sc.mandateConsistencyScore}</div>
                        <div className="text-[10px] text-text-tertiary mb-1">van 100</div>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden gap-px mt-2">
                        {sc.consistentCount > 0 && <div className="bg-ink/25" style={{ flex: sc.consistentCount }} />}
                        {sc.mixedCount > 0 && <div className="bg-ink/10" style={{ flex: sc.mixedCount }} />}
                        {sc.inconsistentCount > 0 && <div className="bg-ink/4" style={{ flex: sc.inconsistentCount }} />}
                      </div>
                    </Link>
                  );
                })}
            </div>
          </section>
        )}
      </div>

      {/* Recent motions */}
      <div className="bg-surface-sub border-t border-border mt-12 px-6 py-12 pb-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-serif text-[22px] font-normal text-ink">
              Laatste stemmingen
            </h2>
            <Link
              href={routes.tk.moties}
              className="text-[13px] font-medium text-moss hover:text-moss-hover transition-colors inline-flex items-center gap-1"
            >
              Alle moties →
            </Link>
          </div>

          {recentMotions ? (
            <div className="card overflow-hidden">
              {recentMotions.map((m, i) => {
                const vote = m.vote || m.votes?.[0];
                const party = m.sponsors?.[0]?.mp?.party;

                return (
                  <Link
                    key={m.id}
                    href={routes.tk.motie(m.id)}
                    className={`flex items-center gap-4 px-5 py-3.5 table-row-hover ${
                      i < recentMotions.length - 1
                        ? "border-b border-border-subtle"
                        : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">
                        {m.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-text-tertiary">
                        <span>{formatDate(m.dateIntroduced)}</span>
                        {party && (
                          <>
                            <span>·</span>
                            <PartyBadge
                              abbreviation={party.abbreviation}
                              colorNeutral={party.colorNeutral}
                              size="sm"
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-3">
                      {vote && (
                        <div className="w-20 hidden sm:block">
                          <VoteBar
                            voor={vote.totalFor}
                            tegen={vote.totalAgainst}
                            height={6}
                          />
                        </div>
                      )}
                      <StatusBadge status={m.status} size="sm" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="card p-6 text-sm text-text-tertiary">
              Kon de laatste stemmingen niet laden.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
