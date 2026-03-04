/**
 * Vooruitblik (forward-looking) score card for 2026 election promises.
 * Shows how consistently a party already voted with their new 2026 promises.
 */

import Link from "next/link";
import type { PartyScorecard } from "../lib/types";
import { themeLabel } from "../lib/utils";
import ConfidenceBadge from "./ConfidenceBadge";
import MethodologyLink from "./MethodologyLink";
import Term from "./Term";

interface Props {
  scorecard: PartyScorecard;
  partyAbbreviation: string;
  /** Link to beloften page filtered by this party + year 2026 */
  beloftenHref: string;
  /** Parliament short name, e.g. "Amsterdam" */
  cityName: string;
}

export default function VooruitblikScore({
  scorecard,
  partyAbbreviation,
  beloftenHref,
  cityName,
}: Props) {
  const hasThemes =
    scorecard.byTheme && Object.keys(scorecard.byTheme).length > 0;

  return (
    <section className="mb-8">
      <h2 className="font-serif text-xl text-ink mb-1">
        Verkiezingsprogramma 2026
      </h2>
      <div className="text-[12px] text-text-tertiary mb-3">
        <Term definition="De Vooruitblik-score laat zien hoe consistent deze partij al stemde (2022-2026) met wat ze nu beloven in hun verkiezingsprogramma voor 2026. Het is geen voorspelling, maar een meting van bestaand stemgedrag.">
          Vooruitblik-score
        </Term>{" "}
        — Gemeenteraad {cityName}
      </div>

      <div className="card p-5 mb-4">
        {/* Big score + summary */}
        <div className="flex items-start gap-6 mb-5">
          <div className="text-center shrink-0">
            <div className="text-[42px] font-serif text-ink leading-none">
              {scorecard.mandateConsistencyScore}
            </div>
            <div className="text-[11px] text-text-tertiary mt-1">van 100</div>
            <div
              className={`text-[10px] mt-1.5 font-medium ${
                scorecard.mandateConsistencyScore >= 70
                  ? "text-ink"
                  : scorecard.mandateConsistencyScore >= 40
                    ? "text-text-secondary"
                    : "text-text-tertiary"
              }`}
            >
              {scorecard.mandateConsistencyScore >= 70
                ? "Hoog"
                : scorecard.mandateConsistencyScore >= 40
                  ? "Gemiddeld"
                  : "Laag"}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <ConfidenceBadge
                scored={scorecard.scoredPromises}
                total={scorecard.totalPromises}
              />
            </div>
            <div className="text-sm text-text-secondary mb-3">
              Op basis van stemgedrag 2022–2026 handelde{" "}
              {partyAbbreviation} al consistent met{" "}
              {scorecard.mandateConsistencyScore}% van hun nieuwe beloften
              {(scorecard.insufficientDataPromises ?? 0) > 0 && (
                <span className="text-text-tertiary">
                  {" "}
                  ({scorecard.insufficientDataPromises} beloften: onvoldoende
                  data)
                </span>
              )}
            </div>
            {/* Consistency bar */}
            <div className="flex h-3 rounded-md overflow-hidden gap-px">
              {scorecard.consistentCount > 0 && (
                <div
                  className="bg-ink/30 dark:bg-white/30"
                  style={{ flex: scorecard.consistentCount }}
                  title={`Consistent: ${scorecard.consistentCount}`}
                />
              )}
              {scorecard.mixedCount > 0 && (
                <div
                  className="bg-ink/12 dark:bg-white/12"
                  style={{ flex: scorecard.mixedCount }}
                  title={`Wisselend: ${scorecard.mixedCount}`}
                />
              )}
              {scorecard.inconsistentCount > 0 && (
                <div
                  className="bg-ink/4 dark:bg-white/4 border border-border/50"
                  style={{ flex: scorecard.inconsistentCount }}
                  title={`Afwijkend: ${scorecard.inconsistentCount}`}
                />
              )}
            </div>
            <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-ink/30 dark:bg-white/30" />
                Consistent ({scorecard.consistentCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-ink/12 dark:bg-white/12" />
                Wisselend ({scorecard.mixedCount})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-ink/4 dark:bg-white/4 border border-border/50" />
                Afwijkend ({scorecard.inconsistentCount})
              </span>
            </div>
          </div>
        </div>

        {/* Theme breakdown */}
        {hasThemes && (
          <div className="border-t border-border pt-4 mb-4">
            <div className="section-label mb-3">Per thema</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(scorecard.byTheme)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([theme, data]) => {
                  const total = data.total;
                  const scored =
                    data.consistent + data.mixed + data.inconsistent;
                  const themeMcs =
                    scored > 0
                      ? Math.round((data.consistent / scored) * 100)
                      : null;
                  return (
                    <div
                      key={theme}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-surface-sub/40"
                    >
                      <div className="min-w-0">
                        <span className="text-[12px] text-ink truncate block">
                          {themeLabel(theme)}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {total} belofte{total !== 1 ? "n" : ""}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        {themeMcs !== null ? (
                          <span className="text-[13px] font-serif text-ink">
                            {themeMcs}%
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-tertiary">
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Link to all promises */}
        <div className="border-t border-border pt-3 mb-3">
          <Link
            href={beloftenHref}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-moss hover:underline"
          >
            Bekijk alle {scorecard.totalPromises} beloften 2026
            <svg
              width={13}
              height={13}
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
        </div>

        {/* Methodology */}
        <div className="border-t border-border pt-3">
          <details className="text-xs text-text-tertiary">
            <summary className="cursor-pointer hover:text-text-secondary underline underline-offset-2">
              Hoe werkt de Vooruitblik-score?
            </summary>
            <p className="mt-2 max-w-lg leading-relaxed">
              De Vooruitblik-score meet hoe consistent een partij al stemde in de
              raadsperiode 2022–2026 met de beloften uit hun nieuwe
              verkiezingsprogramma voor 2026. Het is geen voorspelling, maar een
              feitelijke meting: als een partij nu belooft meer te investeren in
              fietspaden, hebben ze dan de afgelopen jaren al vaker v&oacute;&oacute;r
              fiets-gerelateerde moties gestemd? Score: consistent (&ge;70%),
              wisselend (30–70%), afwijkend (&le;30%).
            </p>
          </details>
          <MethodologyLink />
        </div>
      </div>
    </section>
  );
}
