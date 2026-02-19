import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getParliament,
  getScopedParties,
  getScopedPromiseStats,
  getScopedScorecard,
  getAllScorecards,
} from "../../../../../../lib/api";
import type { PartyScorecard } from "../../../../../../lib/types";
import { getPartyColor, themeLabel } from "../../../../../../lib/utils";
import PartyAvatar from "../../../../../../components/PartyAvatar";
import ConfidenceBadge from "../../../../../../components/ConfidenceBadge";
import MethodologyLink from "../../../../../../components/MethodologyLink";
import Term from "../../../../../../components/Term";
import { gemeente } from "../../../../../../lib/routes";
import { getScoreConfidence } from "../../../../../../lib/scoring";

interface Props {
  params: Promise<{ city: string; id: string }>;
}

export const revalidate = 3600;

/* ── Abbreviation alias map for TK cross-reference ────────── */
const MUNICIPAL_TO_TK: Record<string, string> = {
  "GroenLinks": "GroenLinks-PvdA",
  "Partij voor de Dieren": "PvdD",
  "VOLT": "Volt",
  // ChristenUnie-SGP is a combined local fraction — map to CU in TK
  "ChristenUnie-SGP": "ChristenUnie",
};

function findTkMatch(
  localAbbreviation: string,
  tkScorecards: Omit<PartyScorecard, "promises">[],
): Omit<PartyScorecard, "promises"> | null {
  // 1. Direct abbreviation match (case-insensitive)
  const direct = tkScorecards.find(
    (s) => s.abbreviation.toLowerCase() === localAbbreviation.toLowerCase(),
  );
  if (direct) return direct;

  // 2. Alias map
  const alias = MUNICIPAL_TO_TK[localAbbreviation];
  if (alias) {
    const aliased = tkScorecards.find(
      (s) => s.abbreviation.toLowerCase() === alias.toLowerCase(),
    );
    if (aliased) return aliased;
  }

  return null;
}

export async function generateMetadata({ params }: Props) {
  const { city, id } = await params;
  try {
    const [parliament, parties] = await Promise.all([
      getParliament(city),
      getScopedParties(city),
    ]);
    const party = parties.find(
      (p) =>
        p.id === id ||
        p.abbreviation.toLowerCase() === id.toLowerCase(),
    );
    if (party) {
      return {
        title: `${party.abbreviation} — ${parliament.shortName} — CivicStat`,
        description: `${party.name} in de gemeenteraad van ${parliament.shortName}.`,
      };
    }
    return { title: "Partij — CivicStat" };
  } catch {
    return { title: "Partij — CivicStat" };
  }
}

export default async function GemeentePartyDetailPage({ params }: Props) {
  const { city, id } = await params;

  let parliament;
  try {
    parliament = await getParliament(city);
  } catch {
    notFound();
  }

  const r = gemeente(city);

  let parties;
  try {
    parties = await getScopedParties(city);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API.
        </div>
      </div>
    );
  }

  const party = parties.find(
    (p) =>
      p.id === id ||
      p.abbreviation.toLowerCase() === id.toLowerCase(),
  );

  if (!party) {
    notFound();
  }

  // Fetch promise stats, local scorecard, and TK scorecards in parallel
  let promiseStats: {
    totalPromises: number;
    totalMatches: number;
    byParty: { abbreviation: string; name: string; count: number }[];
    byTheme: { theme: string; count: number }[];
  } | null = null;
  let localScorecard: PartyScorecard | null = null;
  let tkScorecards: Omit<PartyScorecard, "promises">[] = [];

  const [promiseStatsResult, localScorecardResult, tkScorecardsResult] =
    await Promise.allSettled([
      getScopedPromiseStats(city),
      getScopedScorecard(city, party.id, { year: 2022 }),
      getAllScorecards({ year: 2023 }),
    ]);

  if (promiseStatsResult.status === "fulfilled")
    promiseStats = promiseStatsResult.value;
  if (localScorecardResult.status === "fulfilled")
    localScorecard = localScorecardResult.value;
  if (tkScorecardsResult.status === "fulfilled")
    tkScorecards = tkScorecardsResult.value;

  const partyPromiseCount =
    promiseStats?.byParty?.find(
      (p) =>
        p.abbreviation.toLowerCase() === party.abbreviation.toLowerCase(),
    )?.count ?? 0;

  // TK cross-reference
  const tkScorecard = findTkMatch(party.abbreviation, tkScorecards);

  const color = getPartyColor(party.abbreviation, party.colorNeutral);
  const seats = party.seats ?? 0;
  const totalSeats = parliament.seats;

  // Prev/next navigation
  const sortedParties = [...parties]
    .filter((p) => p.seats > 0)
    .sort((a, b) => b.seats - a.seats);
  const currentIdx = sortedParties.findIndex((p) => p.id === party.id);
  const prevParty =
    currentIdx > 0 ? sortedParties[currentIdx - 1] : null;
  const nextParty =
    currentIdx >= 0 && currentIdx < sortedParties.length - 1
      ? sortedParties[currentIdx + 1]
      : null;

  const hasLocalScore =
    localScorecard && localScorecard.scoredPromises > 0;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Breadcrumbs + prev/next */}
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[11px] text-text-tertiary flex items-center gap-1.5">
          <Link
            href="/"
            className="hover:text-moss transition-colors"
          >
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
          <Link
            href={r.root}
            className="hover:text-moss transition-colors"
          >
            {parliament.shortName}
          </Link>
          <span>/</span>
          <Link
            href={r.partijen}
            className="hover:text-moss transition-colors"
          >
            Partijen
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">
            {party.abbreviation}
          </span>
        </nav>
        <div className="flex items-center gap-2">
          {prevParty ? (
            <Link
              href={r.partij(prevParty.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
            >
              <svg
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {prevParty.abbreviation}
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[12px] text-text-tertiary opacity-40">
              <svg
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
          )}
          {nextParty ? (
            <Link
              href={r.partij(nextParty.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
            >
              {nextParty.abbreviation}
              <svg
                width={14}
                height={14}
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
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[12px] text-text-tertiary opacity-40">
              <svg
                width={14}
                height={14}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <PartyAvatar
          abbreviation={party.abbreviation}
          color={color}
          size="md"
          showColor
        />
        <div>
          <h1 className="font-serif text-[clamp(26px,4vw,34px)] text-ink leading-tight">
            {party.abbreviation}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {party.name}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {seats > 0 && (
          <div className="card p-4">
            <div className="section-label">Zetels</div>
            <div className="text-2xl font-serif text-ink">{seats}</div>
            {totalSeats > 0 && (
              <div className="text-[11px] text-text-tertiary mt-0.5">
                van {totalSeats}
              </div>
            )}
          </div>
        )}
        <div className="card p-4">
          <div className="section-label">Raadsleden</div>
          <div className="text-2xl font-serif text-ink">
            {party._count.mps}
          </div>
        </div>
        {partyPromiseCount > 0 && (
          <div className="card p-4">
            <div className="section-label">Beloften</div>
            <div className="text-2xl font-serif text-ink">
              {partyPromiseCount}
            </div>
          </div>
        )}
        {hasLocalScore && (
          <div className="card p-4">
            <div className="section-label">
              <Term definition="De Mandate Consistency Score (MCS) meet hoe consistent een partij stemt in lijn met haar verkiezingsbeloften. 100 = volledig consistent.">
                MCS
              </Term>
            </div>
            <div className="text-2xl font-serif text-ink">
              {localScorecard!.mandateConsistencyScore}
            </div>
            <div className="text-[11px] text-text-tertiary mt-0.5">
              van 100
            </div>
          </div>
        )}
      </div>

      {/* Seat proportion bar */}
      {seats > 0 && totalSeats > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">
            Zetelverdeling
          </h2>
          <div className="card p-5">
            <div className="flex h-7 rounded-md overflow-hidden gap-px">
              {sortedParties.map((p) => {
                const pColor = getPartyColor(
                  p.abbreviation,
                  p.colorNeutral,
                );
                const isThis = p.id === party.id;
                return (
                  <div
                    key={p.id}
                    title={`${p.abbreviation}: ${p.seats} ${p.seats === 1 ? "zetel" : "zetels"}`}
                    className="block transition-opacity"
                    style={{
                      width: `${(p.seats / totalSeats) * 100}%`,
                      backgroundColor: pColor,
                      opacity: isThis ? 1 : 0.25,
                      minWidth: p.seats > 1 ? 4 : 2,
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-3 text-[12px] text-text-secondary">
              <span className="font-semibold text-ink">
                {party.abbreviation}
              </span>{" "}
              heeft {seats} van {totalSeats} zetels (
              {Math.round((seats / totalSeats) * 100)}%)
            </div>
          </div>
        </section>
      )}

      {/* Beloften link */}
      {partyPromiseCount > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">
            Beloften
          </h2>
          <Link
            href={`${r.beloften}?partij=${encodeURIComponent(party.abbreviation)}`}
            className="card p-5 block hover:bg-surface-sub/40 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink group-hover:text-moss transition-colors">
                  {partyPromiseCount} verkiezingsbeloften
                </div>
                <div className="text-[12px] text-text-tertiary mt-0.5">
                  Uit het verkiezingsprogramma van{" "}
                  {party.abbreviation} voor de
                  gemeenteraadsverkiezingen
                </div>
              </div>
              <svg
                width={20}
                height={20}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                className="text-text-tertiary group-hover:text-moss transition-colors"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        </section>
      )}

      {/* ── Local Belofteconsistentie ─────────────────────────── */}
      {hasLocalScore && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">
            Belofteconsistentie
          </h2>
          <div className="text-[12px] text-text-tertiary mb-3">
            Gemeenteraad {parliament.shortName} — Verkiezingsbeloften 2022
          </div>

          <div className="card p-5 mb-4">
            {/* Big score + summary */}
            <div className="flex items-start gap-6 mb-5">
              <div className="text-center shrink-0">
                <div className="text-[42px] font-serif text-ink leading-none">
                  {localScorecard!.mandateConsistencyScore}
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">
                  van 100
                </div>
                <div
                  className={`text-[10px] mt-1.5 font-medium ${
                    localScorecard!.mandateConsistencyScore >= 70
                      ? "text-ink"
                      : localScorecard!.mandateConsistencyScore >= 40
                        ? "text-text-secondary"
                        : "text-text-tertiary"
                  }`}
                >
                  {localScorecard!.mandateConsistencyScore >= 70
                    ? "Hoog"
                    : localScorecard!.mandateConsistencyScore >= 40
                      ? "Gemiddeld"
                      : "Laag"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <ConfidenceBadge
                    scored={localScorecard!.scoredPromises}
                    total={localScorecard!.totalPromises}
                  />
                </div>
                <div className="text-sm text-text-secondary mb-3">
                  Score gebaseerd op{" "}
                  {localScorecard!.scoredPromises} van{" "}
                  {localScorecard!.totalPromises} beloften met
                  voldoende stemdata
                  {(localScorecard!.insufficientDataPromises ?? 0) >
                    0 && (
                    <span className="text-text-tertiary">
                      {" "}
                      ({localScorecard!.insufficientDataPromises}{" "}
                      beloften: onvoldoende data)
                    </span>
                  )}
                </div>
                {/* Consistency bar */}
                <div className="flex h-3 rounded-md overflow-hidden gap-px">
                  {localScorecard!.consistentCount > 0 && (
                    <div
                      className="bg-ink/30 dark:bg-white/30"
                      style={{
                        flex: localScorecard!.consistentCount,
                      }}
                      title={`Consistent: ${localScorecard!.consistentCount}`}
                    />
                  )}
                  {localScorecard!.mixedCount > 0 && (
                    <div
                      className="bg-ink/12 dark:bg-white/12"
                      style={{ flex: localScorecard!.mixedCount }}
                      title={`Wisselend: ${localScorecard!.mixedCount}`}
                    />
                  )}
                  {localScorecard!.inconsistentCount > 0 && (
                    <div
                      className="bg-ink/4 dark:bg-white/4 border border-border/50"
                      style={{
                        flex: localScorecard!.inconsistentCount,
                      }}
                      title={`Afwijkend: ${localScorecard!.inconsistentCount}`}
                    />
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/30 dark:bg-white/30" />
                    <Term definition="Het stemgedrag komt in ≥70% van de gerelateerde moties overeen met de belofte.">
                      Consistent
                    </Term>{" "}
                    ({localScorecard!.consistentCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/12 dark:bg-white/12" />
                    <Term definition="Het stemgedrag komt in 40-70% van de gerelateerde moties overeen met de belofte.">
                      Wisselend
                    </Term>{" "}
                    ({localScorecard!.mixedCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-ink/4 dark:bg-white/4 border border-border/50" />
                    <Term definition="Het stemgedrag wijkt in >60% van de gerelateerde moties af van de belofte.">
                      Afwijkend
                    </Term>{" "}
                    ({localScorecard!.inconsistentCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Theme breakdown */}
            {localScorecard!.byTheme &&
              Object.keys(localScorecard!.byTheme).length > 0 && (
                <div className="border-t border-border pt-4 mb-4">
                  <div className="section-label mb-3">Per thema</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Object.entries(localScorecard!.byTheme)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .map(([theme, data]) => (
                        <div
                          key={theme}
                          className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-surface-sub/40"
                        >
                          <span className="text-[12px] text-ink truncate">
                            {themeLabel(theme)}
                          </span>
                          <span className="text-[11px] text-text-tertiary whitespace-nowrap">
                            {data.consistent}/{data.total}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Methodology */}
            <div className="border-t border-border pt-3 mt-4">
              <details className="text-xs text-text-tertiary">
                <summary className="cursor-pointer hover:text-text-secondary underline underline-offset-2">
                  Methodologie
                </summary>
                <p className="mt-2 max-w-lg leading-relaxed">
                  De consistentiescore is gebaseerd op de gewogen
                  verhouding tussen stemgedrag en
                  verkiezingsbeloften. Per belofte wordt gekeken of
                  de partij in de verwachte richting stemde bij
                  gerelateerde moties. Score: consistent (≥70%),
                  wisselend (30-70%), afwijkend (≤30%). Beloften met
                  minder dan 3 gerelateerde moties krijgen geen
                  score.
                </p>
              </details>
              <MethodologyLink />
            </div>
          </div>
        </section>
      )}

      {/* ── No local scorecard placeholder ────────────────────── */}
      {!hasLocalScore && partyPromiseCount > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">
            Belofteconsistentie
          </h2>
          <div className="card px-5 py-6 text-center">
            <p className="text-sm text-text-secondary">
              Voor {party.abbreviation} worden de beloften momenteel
              gekoppeld aan moties in de gemeenteraad van{" "}
              {parliament.shortName}.
            </p>
            <p className="text-xs text-text-tertiary mt-2">
              Zodra voldoende koppelingen zijn gemaakt, verschijnt
              hier de consistentiescore.
            </p>
          </div>
        </section>
      )}

      {/* ── Landelijk stemgedrag (TK cross-reference) ─────────── */}
      {tkScorecard && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-4">
            Landelijk stemgedrag
          </h2>
          <div className="text-[12px] text-text-tertiary mb-3">
            Tweede Kamer — Hoe stemt {tkScorecard.abbreviation}{" "}
            landelijk?
          </div>

          <div className="card p-5 border-dashed">
            <div className="flex items-start gap-6 mb-4">
              <div className="text-center shrink-0">
                <div className="text-[36px] font-serif text-ink/70 leading-none">
                  {tkScorecard.mandateConsistencyScore}
                </div>
                <div className="text-[11px] text-text-tertiary mt-1">
                  van 100
                </div>
                <div className="text-[10px] mt-1.5 font-medium text-text-tertiary">
                  TK {tkScorecard.electionYear}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <ConfidenceBadge
                    scored={tkScorecard.scoredPromises}
                    total={tkScorecard.totalPromises}
                    compact
                  />
                </div>
                <p className="text-sm text-text-secondary mb-3">
                  Dit is het landelijke stemgedrag van{" "}
                  {tkScorecard.abbreviation} in de Tweede Kamer.
                  Dit kan een indicatie geven van hoe deze partij
                  zich positioneert op nationale thema{"\u2019"}s.
                </p>
                {/* Consistency bar (muted) */}
                <div className="flex h-2.5 rounded-md overflow-hidden gap-px opacity-60">
                  {tkScorecard.consistentCount > 0 && (
                    <div
                      className="bg-ink/30"
                      style={{
                        flex: tkScorecard.consistentCount,
                      }}
                    />
                  )}
                  {tkScorecard.mixedCount > 0 && (
                    <div
                      className="bg-ink/12"
                      style={{ flex: tkScorecard.mixedCount }}
                    />
                  )}
                  {tkScorecard.inconsistentCount > 0 && (
                    <div
                      className="bg-ink/4 border border-border/50"
                      style={{
                        flex: tkScorecard.inconsistentCount,
                      }}
                    />
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-[11px] text-text-tertiary">
                  <span>
                    Consistent ({tkScorecard.consistentCount})
                  </span>
                  <span>
                    Wisselend ({tkScorecard.mixedCount})
                  </span>
                  <span>
                    Afwijkend ({tkScorecard.inconsistentCount})
                  </span>
                </div>
              </div>
            </div>

            {/* Theme breakdown (compact) */}
            {tkScorecard.byTheme &&
              Object.keys(tkScorecard.byTheme).length > 0 && (
                <div className="border-t border-border pt-3 mb-3">
                  <div className="section-label mb-2">
                    Landelijke thema{"\u2019"}s
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
                    {Object.entries(tkScorecard.byTheme)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .slice(0, 8)
                      .map(([theme, data]) => (
                        <div
                          key={theme}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-surface-sub/30"
                        >
                          <span className="text-[11px] text-text-secondary truncate">
                            {themeLabel(theme)}
                          </span>
                          <span className="text-[10px] text-text-tertiary whitespace-nowrap">
                            {data.consistent}/{data.total}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Link to full TK profile */}
            <div className="border-t border-border pt-3">
              <Link
                href={`/nl/tweede-kamer/partijen/${encodeURIComponent(tkScorecard.abbreviation)}`}
                className="inline-flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-moss transition-colors"
              >
                Bekijk volledig landelijk profiel
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
          </div>
        </section>
      )}
    </div>
  );
}
