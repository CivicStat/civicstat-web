import Link from "next/link";
import { notFound } from "next/navigation";
import { getParliament, getScopedMotion } from "../../../../../lib/api";
import { formatDate, getPartyColor, getInitials } from "../../../../../lib/utils";
import PartyBadge from "../../../../../components/PartyBadge";
import StatusBadge from "../../../../../components/StatusBadge";
import VoteBar from "../../../../../components/VoteBar";
import { routes } from "../../../../../lib/routes";
import type { VoteRecord, RawStemming } from "../../../../../lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

const SLUG = "eerste-kamer";

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const m = await getScopedMotion(SLUG, id);
    return { title: `${m.title} — Eerste Kamer — CivicStat` };
  } catch {
    return { title: "Motie — Eerste Kamer — CivicStat" };
  }
}

export default async function EKMotieDetailPage({ params }: Props) {
  const { id } = await params;

  let parliament;
  try {
    parliament = await getParliament(SLUG);
  } catch {
    notFound();
  }

  let motion;
  try {
    motion = await getScopedMotion(SLUG, id);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <Link
          href={routes.ek.moties}
          className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-ink transition-colors mb-6"
        >
          &larr; Terug naar moties
        </Link>
        <div className="card p-6 text-text-secondary text-sm">
          Deze motie kon niet worden geladen.
        </div>
      </div>
    );
  }

  const m = motion;
  const vote = m.vote;
  const firstSponsor = m.sponsors?.[0]?.mp;
  const firstSponsorParty = firstSponsor?.party;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-text-tertiary mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-moss transition-colors">Home</Link>
        <span>/</span>
        <Link href={routes.ek.root} className="hover:text-moss transition-colors">Eerste Kamer</Link>
        <span>/</span>
        <Link href={routes.ek.moties} className="hover:text-moss transition-colors">Moties</Link>
        <span>/</span>
        <span className="text-ink font-medium truncate max-w-[200px]">{m.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-[clamp(22px,3.5vw,30px)] font-normal text-ink leading-[1.25] mb-2">
          {m.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5 text-[13px] text-text-secondary">
          <span>{formatDate(m.dateIntroduced)}</span>
          <StatusBadge status={m.status} />
          {firstSponsorParty && (
            <PartyBadge
              abbreviation={firstSponsorParty.abbreviation}
              colorNeutral={firstSponsorParty.colorNeutral}
            />
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: text + sponsors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Motion text */}
          <section className="card p-5">
            <div className="section-label mb-2">Samenvatting</div>
            <p className="text-[14px] text-text-secondary leading-relaxed whitespace-pre-line">
              {m.text}
            </p>
          </section>

          {/* Sponsors */}
          {m.sponsors && m.sponsors.length > 0 && (
            <section className="card p-5">
              <div className="section-label mb-3">
                {m.sponsors.length === 1 ? "Indiener" : "Indieners"}
              </div>
              <div className="space-y-2">
                {m.sponsors.map((s: any, i: number) => (
                  <Link key={i} href={routes.ek.senator(s.mp.id)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium text-white"
                      style={{
                        backgroundColor: getPartyColor(
                          s.mp.party?.abbreviation ?? "",
                          s.mp.party?.colorNeutral,
                        ),
                      }}
                    >
                      {getInitials(s.mp.name)}
                    </div>
                    <div>
                      <span className="text-[13px] font-medium text-ink">
                        {s.mp.name}
                      </span>
                      {s.mp.party && (
                        <span className="text-[11px] text-text-tertiary ml-1.5">
                          {s.mp.party.abbreviation}
                        </span>
                      )}
                      {s.role && s.role !== "SPONSOR" && (
                        <span className="text-[10px] text-text-tertiary ml-1">
                          ({s.role.toLowerCase()})
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Vote result detail */}
          {vote && (
            <section className="card p-5">
              <div className="section-label mb-3">Stemuitslag</div>
              <div className="mb-4">
                <VoteBar
                  voor={vote.totalFor}
                  tegen={vote.totalAgainst}
                  height={10}
                />
                <div className="flex justify-between mt-2 text-[13px]">
                  <span className="text-ink font-medium">
                    {vote.totalFor} voor
                  </span>
                  <span className="text-text-secondary">
                    {vote.totalAgainst} tegen
                  </span>
                </div>
              </div>

              {vote.result && (
                <div className="mb-3">
                  <StatusBadge status={vote.result} />
                </div>
              )}

              {/* Party-level votes from raw data */}
              {vote.rawData?.Stemming && vote.rawData.Stemming.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">
                    Per fractie
                  </div>
                  <div className="space-y-1.5">
                    {(vote.rawData.Stemming as RawStemming[])
                      .sort((a: RawStemming, b: RawStemming) => b.FractieGrootte - a.FractieGrootte)
                      .map((s: RawStemming) => (
                        <div
                          key={s.Id}
                          className="flex items-center justify-between text-[12px]"
                        >
                          <span className="text-ink">
                            {s.ActorNaam}
                            <span className="text-text-tertiary ml-1">
                              ({s.FractieGrootte})
                            </span>
                          </span>
                          <span
                            className={
                              s.Soort === "Voor"
                                ? "text-ink font-medium"
                                : s.Soort === "Tegen"
                                  ? "text-text-secondary"
                                  : "text-text-tertiary"
                            }
                          >
                            {s.Soort}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Individual vote records */}
              {vote.records && vote.records.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <div className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2">
                    Individuele stemmen ({vote.records.length})
                  </div>
                  <div className="max-h-[300px] overflow-y-auto space-y-1">
                    {(vote.records as VoteRecord[])
                      .sort((a, b) => {
                        const order: Record<string, number> = { FOR: 0, AGAINST: 1, ABSTAIN: 2, ABSENT: 3 };
                        return (order[a.voteValue] ?? 4) - (order[b.voteValue] ?? 4);
                      })
                      .map((rec) => (
                        <div
                          key={rec.id}
                          className="flex items-center justify-between text-[12px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-ink">{rec.mp.name}</span>
                            <span className="text-text-tertiary">
                              {rec.party.abbreviation}
                            </span>
                          </div>
                          <span
                            className={
                              rec.voteValue === "FOR"
                                ? "text-ink font-medium"
                                : rec.voteValue === "AGAINST"
                                  ? "text-text-secondary"
                                  : "text-text-tertiary"
                            }
                          >
                            {rec.voteValue === "FOR"
                              ? "Voor"
                              : rec.voteValue === "AGAINST"
                                ? "Tegen"
                                : rec.voteValue === "ABSTAIN"
                                  ? "Onthouding"
                                  : "Afwezig"}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Source */}
          {m.sourceUrl && (
            <section className="card p-4">
              <div className="section-label mb-2">Bron</div>
              <a
                href={m.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-moss hover:underline break-all"
              >
                Bekijk origineel &rarr;
              </a>
            </section>
          )}

          {/* Quick facts */}
          <section className="card p-4">
            <div className="section-label mb-2">Details</div>
            <dl className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-text-tertiary">Datum</dt>
                <dd className="text-ink">{formatDate(m.dateIntroduced)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-tertiary">Status</dt>
                <dd><StatusBadge status={m.status} size="sm" /></dd>
              </div>
              {m.soort && (
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Type</dt>
                  <dd className="text-ink">{m.soort}</dd>
                </div>
              )}
              {vote && (
                <div className="flex justify-between">
                  <dt className="text-text-tertiary">Resultaat</dt>
                  <dd><StatusBadge status={vote.result} size="sm" /></dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
