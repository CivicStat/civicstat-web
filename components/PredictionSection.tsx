import type { MotionPrediction, VoteDetail } from "../lib/types";
import { getPartyColor } from "../lib/utils";
import VoteBar from "./VoteBar";

interface PredictionSectionProps {
  prediction: MotionPrediction;
  vote: VoteDetail | null;
  partyAggregates: PartyAggregate[] | null;
}

interface PartyAggregate {
  abbreviation: string;
  colorNeutral: string | null;
  voor: number;
  tegen: number;
  afwezig: number;
  total: number;
}

export default function PredictionSection({
  prediction,
  vote,
  partyAggregates,
}: PredictionSectionProps) {
  const { predictedVoor, predictedTegen, predictedOnbekend, reliability, partyPredictions, algorithm } = prediction;
  const totalSeats = predictedVoor + predictedTegen + predictedOnbekend;

  // Count known-direction parties
  const knownParties = partyPredictions.filter(p => p.predictedDirection !== "UNKNOWN");
  const unknownParties = partyPredictions.filter(p => p.predictedDirection === "UNKNOWN");

  // If there's actual vote data, compute belofte-kloof
  let matchCount = 0;
  let comparedCount = 0;
  if (vote && partyAggregates) {
    for (const pp of knownParties) {
      const actual = partyAggregates.find(
        a => a.abbreviation.toLowerCase() === pp.abbreviation.toLowerCase()
      );
      if (actual) {
        comparedCount++;
        const actualDirection = actual.voor > actual.tegen ? "FOR" : "AGAINST";
        if (actualDirection === pp.predictedDirection) matchCount++;
      }
    }
  }

  // Reliability label
  const reliabilityPct = Math.round(reliability * 100);
  const reliabilityLabel = reliabilityPct >= 40 ? "Gemiddeld" : "Laag";
  const reliabilityColor = reliabilityPct >= 40 ? "text-text-secondary" : "text-text-tertiary";

  // Predicted outcome label
  const predictedOutcome =
    predictedVoor > predictedTegen
      ? "Aangenomen"
      : predictedTegen > predictedVoor
      ? "Verworpen"
      : "Onzeker";

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <h2 className="font-serif text-[22px] font-normal text-ink">
          Verwachte uitkomst
        </h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-surface-sub border border-border px-2.5 py-0.5 text-[11px] font-semibold ${reliabilityColor}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              reliabilityPct >= 40 ? "bg-text-secondary" : "bg-text-tertiary"
            }`}
          />
          {reliabilityLabel} betrouwbaarheid
        </span>
      </div>
      <p className="text-[13px] text-text-secondary mb-4 max-w-[68ch]">
        Op basis van {knownParties.length} partij{knownParties.length !== 1 ? "en" : ""} met
        verkiezingsbeloften over dit onderwerp voorspellen we de stemuitslag.
        {unknownParties.length > 0 && ` Voor ${unknownParties.length} parti${unknownParties.length !== 1 ? "jen" : "j"} ontbreken koppelingen.`}
      </p>

      {/* Predicted outcome card */}
      <div className="card p-5 mb-4">
        <div className="space-y-4">
          {/* Predicted seat distribution */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Voorspelling
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0 text-[11px] font-semibold border ${
                    predictedOutcome === "Aangenomen"
                      ? "bg-surface-sub text-ink border-border"
                      : predictedOutcome === "Verworpen"
                      ? "bg-mist text-text-secondary border-border"
                      : "bg-surface-sub text-text-tertiary border-border"
                  }`}
                >
                  {predictedOutcome === "Aangenomen" && (
                    <svg width={10} height={10} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {predictedOutcome === "Verworpen" && (
                    <svg width={10} height={10} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                  {predictedOutcome}
                </span>
              </div>
              <span className="text-[12px] text-text-secondary font-mono">
                {predictedVoor}–{predictedTegen}
                {predictedOnbekend > 0 && (
                  <span className="text-text-tertiary"> ({predictedOnbekend} onbekend)</span>
                )}
              </span>
            </div>

            {/* Stacked seat bar: voor | tegen | onbekend */}
            <div
              className="flex overflow-hidden bg-mist"
              style={{ height: 14, borderRadius: 7 }}
            >
              {predictedVoor > 0 && (
                <div
                  className="bg-bar-voor transition-[width] duration-500 ease-out"
                  style={{ width: `${(predictedVoor / totalSeats) * 100}%` }}
                  title={`Voor: ${predictedVoor} zetels`}
                />
              )}
              {predictedTegen > 0 && (
                <div
                  className="bg-bar-tegen transition-[width] duration-500 ease-out"
                  style={{ width: `${(predictedTegen / totalSeats) * 100}%` }}
                  title={`Tegen: ${predictedTegen} zetels`}
                />
              )}
              {/* Remaining space is "onbekend" in bg-mist */}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 text-[11px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-bar-voor" />
                Voor ({predictedVoor})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-bar-tegen" />
                Tegen ({predictedTegen})
              </span>
              {predictedOnbekend > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-mist border border-border" />
                  Onbekend ({predictedOnbekend})
                </span>
              )}
              <span className="ml-auto text-text-tertiary">
                Meerderheid: {Math.ceil(totalSeats / 2)} zetels
              </span>
            </div>
          </div>

          {/* Belofte-kloof: comparison with actual vote */}
          {vote && (predictedVoor + predictedTegen > 0) && (
            <>
              <div className="border-t border-border-subtle pt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Werkelijk resultaat
                  </span>
                  <span className="text-[12px] text-text-secondary font-mono">
                    {vote.totalFor}–{vote.totalAgainst}
                  </span>
                </div>
                <VoteBar voor={vote.totalFor} tegen={vote.totalAgainst} height={14} />
              </div>

              {/* Delta indicator */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-text-secondary">
                  Belofte-kloof:{" "}
                  <span className="font-semibold text-ink">
                    {(() => {
                      const delta = vote.totalFor - predictedVoor;
                      return `${delta > 0 ? "+" : ""}${delta} stemmen`;
                    })()}
                  </span>{" "}
                  verschil
                </span>
                {comparedCount > 0 && (
                  <span className="text-[11px] text-text-tertiary font-mono">
                    {matchCount}/{comparedCount} partijen correct ({Math.round((matchCount / comparedCount) * 100)}%)
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Per-party breakdown */}
      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mb-2">
          Per partij ({knownParties.length} voorspeld, {unknownParties.length} onbekend)
        </div>
        <div className="flex flex-wrap gap-1.5">
          {/* Known parties first */}
          {knownParties
            .sort((a, b) => b.seats - a.seats)
            .map((pp) => {
              const actualRow = partyAggregates?.find(
                (a) => a.abbreviation.toLowerCase() === pp.abbreviation.toLowerCase()
              );
              const actualVote = actualRow
                ? actualRow.voor > actualRow.tegen
                  ? "FOR"
                  : "AGAINST"
                : null;
              const hasVoteData = vote !== null && actualVote !== null;
              const matches = hasVoteData && actualVote === pp.predictedDirection;
              const predictedLabel = pp.predictedDirection === "FOR" ? "voor" : "tegen";
              const actualLabel =
                actualVote === "FOR" ? "voor" : actualVote === "AGAINST" ? "tegen" : null;

              return (
                <div
                  key={pp.partyId}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] border ${
                    hasVoteData
                      ? matches
                        ? "bg-surface border-border-subtle"
                        : "bg-surface-sub border-border"
                      : "bg-surface border-border-subtle"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getPartyColor(pp.abbreviation) }}
                  />
                  <span className="font-medium text-ink">{pp.abbreviation}</span>
                  <span className="text-text-tertiary text-[11px]">{pp.seats}z</span>
                  <span
                    className={`text-[11px] ${
                      pp.predictedDirection === "FOR" ? "text-ink" : "text-text-secondary"
                    }`}
                  >
                    {predictedLabel}
                  </span>
                  {hasVoteData && !matches && actualLabel && (
                    <>
                      <span className="text-text-tertiary">→</span>
                      <span className="font-medium text-text-secondary">{actualLabel}</span>
                    </>
                  )}
                  {hasVoteData && (
                    matches ? (
                      <svg width={11} height={11} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-moss">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width={11} height={11} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" className="text-text-tertiary">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )
                  )}
                </div>
              );
            })}

          {/* Unknown parties (dimmed) */}
          {unknownParties.length > 0 && unknownParties.length <= 8 && (
            <>
              <div className="w-px h-6 bg-border mx-0.5 self-center" />
              {unknownParties
                .sort((a, b) => b.seats - a.seats)
                .map((pp) => (
                  <div
                    key={pp.partyId}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] border border-border-subtle bg-surface opacity-50"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getPartyColor(pp.abbreviation) }}
                    />
                    <span className="text-text-tertiary">{pp.abbreviation}</span>
                    <span className="text-text-tertiary">{pp.seats}z</span>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>

      {/* Reliability explanation */}
      <div className="card px-4 py-3 mt-3 bg-surface-sub/50">
        <p className="text-[12px] text-text-secondary leading-relaxed">
          <span className="font-semibold text-ink">
            Betrouwbaarheid ({reliabilityPct}%):
          </span>{" "}
          {reliabilityPct >= 40
            ? "Meerdere partijposities zijn afgeleid uit verkiezingsbeloften. De voorspelling is redelijk onderbouwd."
            : "Weinig directe beloftekoppelingen gevonden. De voorspelling is gebaseerd op een beperkt aantal partijposities."}
        </p>
      </div>

      <div className="mt-2 text-[11px] text-text-tertiary">
        Algoritme: {algorithm} · Gebaseerd op {prediction.partyPredictions.reduce((s, p) => s + p.matchCount, 0)} beloftekoppeling{prediction.partyPredictions.reduce((s, p) => s + p.matchCount, 0) !== 1 ? "en" : ""}
      </div>
    </div>
  );
}
