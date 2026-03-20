import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getParliament,
  getFormation,
  getFormationKansen,
} from "../../../../lib/api";
import { routes } from "../../../../lib/routes";
import type { KansenCoalition } from "../../../../lib/types";
import { formatDate, getPartyColor } from "../../../../lib/utils";
import PartyAvatar from "../../../../components/PartyAvatar";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

const PHASE_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  VERKENNING: {
    label: "Verkenning",
    color: "bg-amber-100 text-amber-800",
    desc: "De verkenner onderzoekt welke coalities mogelijk zijn.",
  },
  INFORMATIE: {
    label: "Informatie",
    color: "bg-blue-100 text-blue-800",
    desc: "De informateur voert inhoudelijke gesprekken met mogelijke coalitiepartijen.",
  },
  FORMATIE: {
    label: "Formatie",
    color: "bg-emerald-100 text-emerald-800",
    desc: "De formateur rondt de coalitieonderhandelingen af en schrijft het akkoord.",
  },
  AFGEROND: {
    label: "Afgerond",
    color: "bg-zinc-100 text-zinc-600",
    desc: "De coalitie is gevormd en het college is geinstalleerd.",
  },
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const parliament = await getParliament(slug);
    return {
      title: `Formatie ${parliament.shortName} — CivicStat`,
      description: `Coalitievorming in ${parliament.shortName} na de gemeenteraadsverkiezingen 2026. Deelnemende partijen, stemovereenkomst en coalitiekansen.`,
    };
  } catch {
    return { title: "Formatie — CivicStat" };
  }
}

function SeatBar({
  seats,
  total,
  threshold,
}: {
  seats: number;
  total: number;
  threshold: number;
}) {
  const pct = Math.round((seats / total) * 100);
  const thresholdPct = Math.round((threshold / total) * 100);
  return (
    <div className="relative h-3 bg-surface-sub rounded-full overflow-hidden">
      <div
        className={`absolute inset-y-0 left-0 rounded-full transition-all ${
          seats >= threshold ? "bg-emerald-500" : "bg-amber-400"
        }`}
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute inset-y-0 w-px bg-ink/30"
        style={{ left: `${thresholdPct}%` }}
        title={`Meerderheid: ${threshold} zetels`}
      />
    </div>
  );
}

export default async function FormatieDetailPage({ params }: Props) {
  const { slug } = await params;

  let parliament;
  try {
    parliament = await getParliament(slug);
  } catch {
    notFound();
  }

  const [formationData, kansenData] = await Promise.all([
    getFormation(slug),
    getFormationKansen(slug),
  ]);

  if (!formationData?.formation) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-20">
        <nav className="text-[11px] text-text-tertiary mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-moss transition-colors">Home</Link>
          <span>/</span>
          <Link href={routes.formatie.root} className="hover:text-moss transition-colors">Formatie</Link>
          <span>/</span>
          <span className="text-ink font-medium">{parliament.shortName}</span>
        </nav>
        <div className="card p-8 text-center">
          <p className="text-text-secondary">
            Er is geen actief formatieproces voor {parliament.shortName}.
          </p>
          <Link href={routes.formatie.root} className="inline-block mt-4 text-[13px] font-medium text-moss hover:underline">
            &larr; Terug naar formatie-overzicht
          </Link>
        </div>
      </div>
    );
  }

  const formation = formationData.formation;
  const phase = PHASE_LABELS[formation.phase] ?? {
    label: formation.phase,
    color: "bg-zinc-100 text-zinc-600",
    desc: "",
  };
  const participants = formation.participants;
  const totalParticipantSeats = participants.reduce(
    (s, p) => s + (p.party.seats ?? 0),
    0,
  );
  const majorityThreshold = Math.floor(parliament.seats / 2) + 1;
  const coalitions = kansenData?.coalitions ?? [];

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-20">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-text-tertiary mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-moss transition-colors">Home</Link>
        <span>/</span>
        <Link href={routes.formatie.root} className="hover:text-moss transition-colors">Formatie</Link>
        <span>/</span>
        <span className="text-ink font-medium">{parliament.shortName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
          Coalitievorming
        </p>
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink leading-[1.2] tracking-tight">
            Formatie {parliament.shortName}
          </h1>
          <span className={`mt-2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${phase.color}`}>
            {phase.label}
          </span>
        </div>
        <p className="text-[15px] text-text-secondary mt-2 max-w-[600px] leading-relaxed">
          {phase.desc}
        </p>
      </div>

      {/* Formation info */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* Left: Key info */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            <h2 className="text-[13px] font-semibold text-ink mb-3">Status</h2>
            <dl className="space-y-2.5 text-[13px]">
              <div>
                <dt className="text-text-tertiary text-[11px]">Fase</dt>
                <dd className="text-ink font-medium">{phase.label}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-[11px] capitalize">{formation.leaderRole}</dt>
                <dd className="text-ink font-medium">{formation.currentLeader}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-[11px]">Verkiezingsdatum</dt>
                <dd className="text-ink font-medium">{formatDate(formation.electionDate)}</dd>
              </div>
              <div>
                <dt className="text-text-tertiary text-[11px]">Gestart</dt>
                <dd className="text-ink font-medium">{formatDate(formation.startedAt)}</dd>
              </div>
              {formation.notes && (
                <div>
                  <dt className="text-text-tertiary text-[11px]">Toelichting</dt>
                  <dd className="text-text-secondary text-[12px]">{formation.notes}</dd>
                </div>
              )}
              <div>
                <dt className="text-text-tertiary text-[11px]">Totaal zetels</dt>
                <dd className="text-ink font-medium">
                  {parliament.seats} (meerderheid: {majorityThreshold})
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right: Participants */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <h2 className="text-[13px] font-semibold text-ink mb-3">
              Deelnemende partijen
              {participants.length > 0 && (
                <span className="text-text-tertiary font-normal ml-2">
                  ({totalParticipantSeats} zetels)
                </span>
              )}
            </h2>

            {participants.length > 0 ? (
              <>
                <SeatBar
                  seats={totalParticipantSeats}
                  total={parliament.seats}
                  threshold={majorityThreshold}
                />
                <p className="text-[11px] text-text-tertiary mt-1 mb-4">
                  {totalParticipantSeats} / {majorityThreshold} zetels nodig voor meerderheid
                  {totalParticipantSeats >= majorityThreshold
                    ? " — meerderheid behaald"
                    : ` — nog ${majorityThreshold - totalParticipantSeats} zetels tekort`}
                </p>

                <div className="grid sm:grid-cols-2 gap-2.5">
                  {participants.map((p) => (
                    <div
                      key={p.party.id}
                      className="flex items-center gap-3 p-3 bg-surface-sub/50 rounded-lg"
                    >
                      <PartyAvatar
                        abbreviation={p.party.abbreviation}
                        color={getPartyColor(p.party.abbreviation)}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-ink truncate">
                          {p.party.abbreviation}
                        </div>
                        <div className="text-[11px] text-text-tertiary">
                          {p.party.seats} {p.party.seats === 1 ? "zetel" : "zetels"}
                          {p.status !== "deelnemend" && (
                            <span className="ml-1 text-amber-600">({p.status})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[13px] text-text-secondary">
                Er zijn nog geen deelnemende partijen bekendgemaakt. Dit wordt
                verwacht zodra de verkenner eerste gesprekken heeft afgerond.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Formation rounds / timeline */}
      {formation.rounds.length > 0 && (
        <section className="mb-10">
          <div className="section-label mb-3">Tijdlijn</div>
          <div className="card overflow-hidden">
            {formation.rounds.map((round, i) => (
              <div
                key={round.id}
                className={`px-5 py-3.5 ${
                  i < formation.rounds.length - 1 ? "border-b border-border-subtle" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-surface-sub flex items-center justify-center text-[12px] font-semibold text-ink flex-shrink-0">
                    {round.roundNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink">
                      {round.phase}
                      {round.leader && (
                        <span className="text-text-tertiary font-normal ml-2">
                          ({round.leaderRole}: {round.leader})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-text-tertiary mt-0.5">
                      {formatDate(round.startedAt)}
                      {round.endedAt && ` — ${formatDate(round.endedAt)}`}
                      {round.outcome && (
                        <span className="ml-2 text-text-secondary">{round.outcome}</span>
                      )}
                    </div>
                    {round.notes && (
                      <p className="text-[12px] text-text-secondary mt-1">{round.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Coalitie-kansen */}
      {coalitions.length > 0 && kansenData && (
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="section-label">Coalitiekansen</div>
              <h2 className="font-serif text-[20px] font-normal text-ink mt-1">
                Mogelijke coalities
              </h2>
              <p className="text-[12px] text-text-secondary mt-1 max-w-[500px]">
                Op basis van stemovereenkomst en zetelverdeling. Hoger = vaker op
                dezelfde lijn gestemd in de vorige raadsperiode.
              </p>
            </div>
            <div className="text-[11px] text-text-tertiary">
              Meerderheid: {kansenData.majorityThreshold} / {kansenData.totalSeats} zetels
            </div>
          </div>

          <div className="space-y-3">
            {coalitions.slice(0, 10).map((c: KansenCoalition, i: number) => {
              const hasMajority = c.totalSeats >= kansenData.majorityThreshold;
              const allParticipating = c.parties.every((p) => p.isParticipating);
              const someParticipating = c.parties.some((p) => p.isParticipating);

              return (
                <div
                  key={i}
                  className={`card p-4 ${
                    allParticipating
                      ? "ring-1 ring-moss/30"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {c.parties.map((p) => (
                        <span
                          key={p.abbreviation}
                          className={`text-[12px] font-medium px-2 py-0.5 rounded ${
                            p.isParticipating
                              ? "bg-moss/10 text-moss"
                              : "bg-surface-sub text-ink"
                          }`}
                        >
                          {p.abbreviation}
                          <span className="text-text-tertiary ml-1">
                            {p.seats}
                          </span>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-[18px] font-serif text-ink leading-none">
                          {c.averageAlignment}%
                        </div>
                        <div className="text-[10px] text-text-tertiary">
                          stemovereenkomst
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-[18px] font-serif leading-none ${
                            hasMajority ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {c.totalSeats}
                        </div>
                        <div className="text-[10px] text-text-tertiary">
                          zetels
                        </div>
                      </div>
                    </div>
                  </div>

                  <SeatBar
                    seats={c.totalSeats}
                    total={kansenData.totalSeats}
                    threshold={kansenData.majorityThreshold}
                  />

                  {/* Pairwise breakdown (collapsed for brevity) */}
                  {c.pairwiseBreakdown.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5">
                      {c.pairwiseBreakdown.map((pair) => (
                        <span
                          key={`${pair.partyA}-${pair.partyB}`}
                          className="text-[10px] text-text-tertiary"
                        >
                          {pair.partyA} — {pair.partyB}:{" "}
                          <span className="text-ink">{pair.alignment}%</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {allParticipating && (
                    <p className="text-[10px] text-moss font-medium mt-2">
                      Alle partijen nemen deel aan de verkenning
                    </p>
                  )}
                  {someParticipating && !allParticipating && (
                    <p className="text-[10px] text-text-tertiary mt-2">
                      Deels deelnemend aan de verkenning
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {coalitions.length > 10 && (
            <p className="text-[12px] text-text-tertiary mt-3 text-center">
              {coalitions.length - 10} overige combinaties niet getoond.
            </p>
          )}
        </section>
      )}

      {/* Compatibility overlay (pairwise matrix summary) */}
      {formationData.compatibilityOverlay && participants.length > 1 && (
        <section className="mb-10">
          <div className="section-label mb-3">Stemovereenkomst deelnemers</div>
          <div className="card p-5">
            <p className="text-[12px] text-text-secondary mb-3">
              Percentage van gedeelde stemmingen waarin deze partijen hetzelfde
              stemden in de vorige raadsperiode.
            </p>
            <div className="text-center mb-3">
              <span className="text-[28px] font-serif text-ink">
                {formationData.compatibilityOverlay.averagePairwiseAlignment}%
              </span>
              <p className="text-[11px] text-text-tertiary">
                gemiddelde stemovereenkomst
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {formationData.compatibilityOverlay.pairwiseBreakdown
                .filter(
                  (p) =>
                    participants.some((x) => x.party.abbreviation === p.partyA) &&
                    participants.some((x) => x.party.abbreviation === p.partyB),
                )
                .map((pair) => (
                  <div
                    key={`${pair.partyA}-${pair.partyB}`}
                    className="flex items-center justify-between px-3 py-2 bg-surface-sub/50 rounded"
                  >
                    <span className="text-[12px] text-ink">
                      {pair.partyA} — {pair.partyB}
                    </span>
                    <span className="text-[14px] font-serif text-ink font-medium">
                      {pair.agreementPct}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Back link */}
      <Link
        href={routes.formatie.root}
        className="text-[12px] text-text-tertiary hover:text-moss transition-colors"
      >
        &larr; Terug naar formatie-overzicht
      </Link>
    </div>
  );
}
