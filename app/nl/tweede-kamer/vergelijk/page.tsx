import Link from "next/link";
import { getParties, getPartyComparison } from "../../../../lib/api";
import type { PartyComparisonResponse } from "../../../../lib/types";
import { getPartyColor, themeLabel } from "../../../../lib/utils";
import { routes } from "../../../../lib/routes";

export const revalidate = 3600;

export const metadata = {
  title: "Partijen vergelijken",
  description: "Vergelijk stemgedrag en belofteconsistentie van Tweede Kamerfracties.",
};

export default async function VergelijkPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const partyIdsParam = typeof searchParams.partijen === "string" ? searchParams.partijen : "";
  const yearParam = typeof searchParams.jaar === "string" ? parseInt(searchParams.jaar, 10) : undefined;
  const selectedIds = partyIdsParam ? partyIdsParam.split(",").filter(Boolean) : [];

  let parties;
  try {
    parties = await getParties();
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-[26px] text-ink mb-2">Partijen vergelijken</h1>
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API.
        </div>
      </div>
    );
  }

  const activeParties = parties.filter((p) => p.seats > 0).sort((a, b) => b.seats - a.seats);

  let comparison: PartyComparisonResponse | null = null;
  if (selectedIds.length >= 2 && selectedIds.length <= 6) {
    try {
      comparison = await getPartyComparison("tweede-kamer", selectedIds, yearParam);
    } catch {
      // comparison stays null
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
          Partijen vergelijken
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-[600px]">
          Selecteer 2 tot 6 partijen om hun stemgedrag en belofteconsistentie naast elkaar te zien.
        </p>
      </div>

      {/* Party selector */}
      <div className="card p-4 mb-6">
        <div className="section-label mb-3">Selecteer partijen</div>
        <div className="flex flex-wrap gap-2">
          {activeParties.map((p) => {
            const isSelected = selectedIds.includes(p.abbreviation);
            const color = getPartyColor(p.abbreviation, p.colorNeutral);
            const newSelection = isSelected
              ? selectedIds.filter((id) => id !== p.abbreviation)
              : [...selectedIds, p.abbreviation];
            const href = newSelection.length > 0
              ? `${routes.tk.vergelijk}?partijen=${newSelection.join(",")}`
              : routes.tk.vergelijk;

            return (
              <Link
                key={p.id}
                href={href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                  isSelected
                    ? "border-ink/20 bg-ink/5 text-ink"
                    : "border-border hover:border-ink/20 text-text-secondary hover:text-ink"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color, opacity: isSelected ? 1 : 0.5 }}
                />
                {p.abbreviation}
              </Link>
            );
          })}
        </div>
        {selectedIds.length > 0 && selectedIds.length < 2 && (
          <p className="text-[11px] text-text-tertiary mt-2">Selecteer minimaal 2 partijen.</p>
        )}
        {selectedIds.length > 6 && (
          <p className="text-[11px] text-text-tertiary mt-2">Maximaal 6 partijen.</p>
        )}
      </div>

      {/* Comparison results */}
      {comparison && (
        <>
          {/* MCS overview */}
          <div className="card overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-border-subtle bg-surface-sub/30">
              <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                Mandate Consistency Score (MCS)
              </span>
            </div>
            <div className="grid gap-px bg-border-subtle" style={{ gridTemplateColumns: `repeat(${comparison.parties.length}, 1fr)` }}>
              {comparison.parties.map((p) => {
                const color = getPartyColor(p.abbreviation, p.colorNeutral);
                return (
                  <Link
                    key={p.partyId}
                    href={routes.tk.partij(p.abbreviation)}
                    className="bg-white dark:bg-surface p-5 text-center hover:bg-surface-sub/40 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[14px] font-semibold text-ink">{p.abbreviation}</span>
                    </div>
                    {p.mandateConsistencyScore !== null ? (
                      <>
                        <div className="text-3xl font-serif text-ink tabular-nums">{p.mandateConsistencyScore}</div>
                        <div className="text-[10px] text-text-tertiary mt-1">
                          {p.scoredPromises}/{p.totalPromises} beloften
                        </div>
                      </>
                    ) : (
                      <div className="text-[13px] text-text-tertiary py-2">{"\u2014"}</div>
                    )}
                    {p.seats !== null && (
                      <div className="text-[10px] text-text-tertiary mt-1">{p.seats} zetels</div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Theme breakdown */}
          {comparison.themes.length > 0 && (
            <div className="card overflow-hidden mb-6">
              <div className="px-5 py-3 border-b border-border-subtle bg-surface-sub/30">
                <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                  Per thema
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle text-[10px] text-text-tertiary uppercase tracking-wider">
                      <th className="text-left px-4 py-2 font-medium">Thema</th>
                      {comparison.parties.map((p) => (
                        <th key={p.partyId} className="text-center px-3 py-2 font-medium">
                          {p.abbreviation}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.themes.map((theme) => (
                      <tr key={theme} className="border-b border-border-subtle last:border-0">
                        <td className="px-4 py-2.5 text-text-secondary">{themeLabel(theme)}</td>
                        {comparison!.parties.map((p) => {
                          const themeData = p.byTheme?.[theme];
                          if (!themeData || themeData.total === 0) {
                            return <td key={p.partyId} className="text-center text-text-tertiary">{"\u2014"}</td>;
                          }
                          return (
                            <td key={p.partyId} className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-[11px] text-ink/60 tabular-nums">{themeData.consistent}</span>
                                <span className="text-[9px] text-text-tertiary">/</span>
                                <span className="text-[11px] text-ink/30 tabular-nums">{themeData.inconsistent}</span>
                                <span className="text-[9px] text-text-tertiary">/</span>
                                <span className="text-[11px] text-ink/15 tabular-nums">{themeData.mixed}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 text-[10px] text-text-tertiary border-t border-border-subtle">
                Legende: consistent / inconsistent / gemengd
              </div>
            </div>
          )}

          {/* Vote agreement */}
          {comparison.voteAgreement.pairs.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-border-subtle bg-surface-sub/30">
                <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                  Stemovereenkomst
                </span>
              </div>
              <div className="p-5">
                <div className="space-y-2">
                  {comparison.voteAgreement.pairs.map((pair) => (
                    <div key={`${pair.party1}-${pair.party2}`} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-[120px] shrink-0">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getPartyColor(pair.party1) }}
                        />
                        <span className="text-[12px] font-medium text-ink">{pair.party1}</span>
                        <span className="text-[10px] text-text-tertiary mx-0.5">&amp;</span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getPartyColor(pair.party2) }}
                        />
                        <span className="text-[12px] font-medium text-ink">{pair.party2}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-sub">
                          <div
                            className="bg-ink/20 rounded-full"
                            style={{ width: `${pair.agreementRate}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[14px] font-serif tabular-nums text-ink w-[40px] text-right">
                        {Math.round(pair.agreementRate)}%
                      </span>
                      <span className="text-[10px] text-text-tertiary tabular-nums w-[60px] text-right">
                        {pair.sharedVotes} st.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
