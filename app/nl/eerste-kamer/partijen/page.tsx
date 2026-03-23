import Link from "next/link";
import {
  getScopedParties,
  getScopedScorecards,
} from "../../../../lib/api";
import type { PartyScorecard } from "../../../../lib/types";
import { getPartyColor } from "../../../../lib/utils";
import { getScoreConfidence } from "../../../../lib/scoring";
import PartyAvatar from "../../../../components/PartyAvatar";
import { routes } from "../../../../lib/routes";

const SLUG = "eerste-kamer";
const TOTAL_SEATS = 75;

export const revalidate = 3600;

export const metadata = {
  title: "Fracties — Eerste Kamer",
  description:
    "Senaatsfracties van de Eerste Kamer met zetelverdeling en consistentiescores.",
};

export default async function EKPartijenPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;

  let parties;
  try {
    parties = await getScopedParties(SLUG);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-[26px] text-ink mb-2">Fracties</h1>
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API.
        </div>
      </div>
    );
  }

  const [scorecardsResult] = await Promise.allSettled([
    getScopedScorecards(SLUG),
  ]);

  const scorecardsMap = new Map<string, Omit<PartyScorecard, "promises">>();
  if (scorecardsResult.status === "fulfilled") {
    for (const sc of scorecardsResult.value) {
      scorecardsMap.set(sc.partyId, sc);
    }
  }

  const hasScores = scorecardsMap.size > 0;
  const activeParties = parties.filter((p) => p.seats > 0);

  const sortedParties = [...parties].sort((a, b) => {
    if (sort === "mcs") {
      const sa = scorecardsMap.get(a.id)?.mandateConsistencyScore ?? -1;
      const sb = scorecardsMap.get(b.id)?.mandateConsistencyScore ?? -1;
      if (sb !== sa) return sb - sa;
      return b.seats - a.seats;
    }
    if (sort === "alfa") {
      return a.abbreviation.localeCompare(b.abbreviation, "nl");
    }
    return b.seats - a.seats;
  });

  const sortOptions = [
    { key: "zetels", label: "Zetels" },
    ...(hasScores ? [{ key: "mcs", label: "MCS" }] : []),
    { key: "alfa", label: "Alfabetisch" },
  ];
  const activeSort = sort || "zetels";

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-text-tertiary mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-moss transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={routes.ek.root}
          className="hover:text-moss transition-colors"
        >
          Eerste Kamer
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Fracties</span>
      </nav>

      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Fracties
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">
        Fracties in de Eerste Kamer der Staten-Generaal
        {hasScores ? " met consistentiescores." : " met zetelverdeling."}
      </p>

      {/* Seat distribution bar */}
      {activeParties.length > 0 && (
        <div className="card p-[18px] mb-6">
          <div className="section-label">
            Zetelverdeling ({TOTAL_SEATS} zetels)
          </div>
          <div className="flex h-7 rounded-md overflow-hidden gap-px">
            {activeParties
              .sort((a, b) => b.seats - a.seats)
              .map((p) => {
                const color = getPartyColor(p.abbreviation, p.colorNeutral);
                return (
                  <Link
                    key={p.id}
                    href={routes.ek.partij(p.id)}
                    title={`${p.abbreviation}: ${p.seats} ${p.seats === 1 ? "zetel" : "zetels"}`}
                    className="block transition-opacity hover:opacity-100"
                    style={{
                      width: `${(p.seats / TOTAL_SEATS) * 100}%`,
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
                  href={routes.ek.partij(p.id)}
                  className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-ink transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{
                      backgroundColor: getPartyColor(
                        p.abbreviation,
                        p.colorNeutral,
                      ),
                      opacity: 0.8,
                    }}
                  />
                  {p.abbreviation} ({p.seats})
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Sort controls */}
      {hasScores && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider">
            Sorteer:
          </span>
          <div className="flex gap-1.5">
            {sortOptions.map((opt) => (
              <Link
                key={opt.key}
                href={`${routes.ek.partijen}${opt.key === "zetels" ? "" : `?sort=${opt.key}`}`}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  activeSort === opt.key
                    ? "bg-ink text-white dark:bg-white dark:text-ink shadow-sm"
                    : "text-text-tertiary hover:text-ink hover:bg-surface-sub"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Party table */}
      <div className="card overflow-hidden">
        {/* Desktop header */}
        <div
          className={`hidden sm:grid gap-2 px-5 py-2.5 border-b border-border bg-surface-sub/30 text-[10px] font-medium text-text-tertiary uppercase tracking-wider ${
            hasScores
              ? "sm:grid-cols-[1fr_60px_90px_70px]"
              : "sm:grid-cols-[1fr_70px_80px]"
          }`}
        >
          <span>Fractie</span>
          <span className="text-right">Zetels</span>
          {hasScores && <span className="text-right">MCS</span>}
          <span className="text-right">Senatoren</span>
        </div>

        {sortedParties.map((p, idx) => {
          const color = getPartyColor(p.abbreviation, p.colorNeutral);
          const sc = scorecardsMap.get(p.id);
          const hasSc = sc && sc.scoredPromises > 0;

          return (
            <Link
              key={p.id}
              href={routes.ek.partij(p.id)}
              className={`block hover:bg-surface-sub/40 transition-colors ${
                idx < sortedParties.length - 1
                  ? "border-b border-border-subtle"
                  : ""
              }`}
            >
              {/* Desktop row */}
              <div
                className={`hidden sm:grid gap-2 items-center px-5 py-3 ${
                  hasScores
                    ? "sm:grid-cols-[1fr_60px_90px_70px]"
                    : "sm:grid-cols-[1fr_70px_80px]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PartyAvatar
                    abbreviation={p.abbreviation}
                    color={color}
                    size="sm"
                  />
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
                {hasScores && (
                  <div className="text-right">
                    {hasSc ? (
                      <div
                        className="cursor-help"
                        title={`MCS: ${sc.mandateConsistencyScore}/100. Gebaseerd op ${sc.scoredPromises} van ${sc.totalPromises} beloften. ${getScoreConfidence(sc.scoredPromises, sc.totalPromises).label}.`}
                      >
                        <span
                          className={`text-[16px] font-serif ${
                            getScoreConfidence(
                              sc.scoredPromises,
                              sc.totalPromises,
                            ).level === "onvoldoende"
                              ? "text-text-tertiary"
                              : "text-ink"
                          }`}
                        >
                          {sc.mandateConsistencyScore}
                        </span>
                        <div className="text-[10px] text-text-tertiary">
                          {sc.scoredPromises}/{sc.totalPromises}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[13px] text-text-tertiary">
                        &mdash;
                      </span>
                    )}
                  </div>
                )}
                <div className="text-right text-[13px] text-text-secondary">
                  {p._count.mps}
                </div>
              </div>

              {/* Mobile card */}
              <div className="sm:hidden px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PartyAvatar
                      abbreviation={p.abbreviation}
                      color={color}
                      size="sm"
                    />
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
                {hasSc && (
                  <div className="flex gap-4 mt-2 pt-2 border-t border-border-subtle">
                    <div className="text-[11px]">
                      <span className="text-text-tertiary">MCS: </span>
                      <span className="font-serif text-[14px] text-ink">
                        {sc.mandateConsistencyScore}
                      </span>
                      <span className="text-text-tertiary ml-1">
                        ({sc.scoredPromises}/{sc.totalPromises})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Score legend */}
      {hasScores && (
        <div className="mt-4 text-[11px] text-text-tertiary leading-relaxed">
          <strong className="text-text-secondary">MCS</strong> =
          Mandaatconsistentiescore (0-100). Meet hoe consistent een fractie
          stemt in lijn met haar verkiezingsbeloften. Achter de score:
          beoordeelde/totaal beloften.
        </div>
      )}
    </div>
  );
}
