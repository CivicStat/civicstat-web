import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getParliament,
  getScopedParties,
  getScopedPromiseStats,
  getScopedScorecard,
  getScopedPromises,
  getAllScorecards,
} from "../../../../../../lib/api";
import type { PromiseListItem } from "../../../../../../lib/types";
import type { PartyScorecard } from "../../../../../../lib/types";
import { getPartyColor, themeLabel } from "../../../../../../lib/utils";
import PartyAvatar from "../../../../../../components/PartyAvatar";
import ConfidenceBadge from "../../../../../../components/ConfidenceBadge";
import MethodologyLink from "../../../../../../components/MethodologyLink";
import Term from "../../../../../../components/Term";
import { gemeente } from "../../../../../../lib/routes";
import { getScoreConfidence } from "../../../../../../lib/scoring";
import VooruitblikScore from "../../../../../../components/VooruitblikScore";

interface Props {
  params: Promise<{ city: string; id: string }>;
}

export const revalidate = 3600;

/* ── Abbreviation alias map for TK cross-reference ────────── */
const MUNICIPAL_TO_TK: Record<string, string> = {
  "GroenLinks": "GroenLinks-PvdA",
  "PvdA": "GroenLinks-PvdA", // PvdA merged with GL in TK
  "Partij voor de Dieren": "PvdD",
  "VOLT": "Volt",
  "FVD": "FVD", // Casing normalization
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

  // Fetch promise stats, local scorecard, 2026 scorecard, and TK scorecards in parallel
  let promiseStats: {
    totalPromises: number;
    totalMatches: number;
    byParty: { abbreviation: string; name: string; count: number }[];
    byTheme: { theme: string; count: number }[];
  } | null = null;
  let localScorecard: PartyScorecard | null = null;
  let scorecard2026: PartyScorecard | null = null;
  let tkScorecards: Omit<PartyScorecard, "promises">[] = [];
  let promises2026: PromiseListItem[] = [];

  const [promiseStatsResult, localScorecardResult, scorecard2026Result, tkScorecardsResult, promises2026Result] =
    await Promise.allSettled([
      getScopedPromiseStats(city),
      getScopedScorecard(city, party.id, { year: 2022 }),
      getScopedScorecard(city, party.id, { year: 2026 }),
      getAllScorecards({ year: 2023 }),
      getScopedPromises(city, { party: party.abbreviation, year: 2026, limit: 500 }),
    ]);

  if (promiseStatsResult.status === "fulfilled")
    promiseStats = promiseStatsResult.value;
  if (localScorecardResult.status === "fulfilled")
    localScorecard = localScorecardResult.value;
  if (scorecard2026Result.status === "fulfilled")
    scorecard2026 = scorecard2026Result.value;
  if (tkScorecardsResult.status === "fulfilled")
    tkScorecards = tkScorecardsResult.value;
  if (promises2026Result.status === "fulfilled")
    promises2026 = promises2026Result.value.items ?? [];

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
  const has2026Score =
    scorecard2026 && scorecard2026.scoredPromises > 0;

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
              <Term definition="De Mandate Consistency Score (MCS) meet hoe consistent een partij stemt in lijn met haar verkiezingsbeloften uit 2022. 100 = volledig consistent.">
                MCS 2022
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
        {has2026Score && (
          <div className="card p-4">
            <div className="section-label">
              <Term definition="De Vooruitblik-score meet hoe consistent deze partij al stemde (2022-2026) met wat ze nu beloven voor 2026.">
                Vooruitblik 2026
              </Term>
            </div>
            <div className="text-2xl font-serif text-ink">
              {scorecard2026!.mandateConsistencyScore}
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

      {/* ── Local Belofteconsistentie (2022 track record) ────────── */}
      {hasLocalScore && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-1">
            Track record 2022–2026
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

            {/* Methodology disclaimer */}
            <div className="border-t border-border pt-3 mt-4">
              <p className="text-[11px] text-text-tertiary leading-relaxed mb-3 max-w-lg">
                Deze scores zijn gebaseerd op openbare gemeentelijke bronnen en geautomatiseerde tekstanalyse.
                Elke methodologische keuze (drempelwaarden, gewichten, matchcriteria) is een normatieve keuze.
                Scores van coalitie- en oppositiepartijen zijn niet direct vergelijkbaar.
              </p>
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

      {/* ── Verkiezingsprogramma 2026 (Vooruitblik) ────────────── */}
      {has2026Score && (
        <VooruitblikScore
          scorecard={scorecard2026!}
          partyAbbreviation={party.abbreviation}
          beloftenHref={`${r.beloften}?partij=${encodeURIComponent(party.abbreviation)}&jaar=2026`}
          cityName={parliament.shortName}
        />
      )}

      {/* ── Campagnebeloften 2026 ─────────────────────────────── */}
      {promises2026.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-xl text-ink mb-1">
            Campagnebeloften 2026
          </h2>
          <div className="text-[12px] text-text-tertiary mb-3">
            {promises2026.length} beloften uit het verkiezingsprogramma 2026
          </div>

          {/* Context banner */}
          <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 px-4 py-3 mb-4">
            <p className="text-[12px] text-amber-800 dark:text-amber-300/90">
              Dit zijn beloften uit het verkiezingsprogramma 2026 van {party.abbreviation}.
              Ze worden gematcht aan stemgedrag uit de huidige raadsperiode (2022–2026) om een vooruitblik te geven.
            </p>
          </div>

          {/* Promises grouped by theme */}
          <div className="space-y-4">
            {(() => {
              const byTheme = new Map<string, PromiseListItem[]>();
              for (const p of promises2026) {
                const theme = p.theme || "OVERIG";
                if (!byTheme.has(theme)) byTheme.set(theme, []);
                byTheme.get(theme)!.push(p);
              }
              return [...byTheme.entries()]
                .sort(([, a], [, b]) => b.length - a.length)
                .map(([theme, themePromises]) => (
                  <div key={theme} className="card overflow-hidden">
                    <div className="px-4 py-2.5 bg-surface-sub/40 border-b border-border-subtle flex items-center justify-between">
                      <span className="text-[12px] font-medium text-ink">
                        {themeLabel(theme)}
                      </span>
                      <span className="text-[11px] text-text-tertiary">
                        {themePromises.length} belofte{themePromises.length !== 1 ? "n" : ""}
                      </span>
                    </div>
                    <div className="divide-y divide-border-subtle">
                      {themePromises.slice(0, 10).map((p) => (
                        <Link
                          key={p.id}
                          href={`${r.beloften}/${p.id}`}
                          className="block px-4 py-3 hover:bg-surface-sub/30 transition-colors group"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-ink group-hover:text-moss transition-colors line-clamp-2">
                                {p.summary}
                              </p>
                            </div>
                            {p.specificity && (
                              <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                p.specificity === "CONCREET"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : p.specificity === "GEMIDDELD"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                              }`}>
                                {p.specificity === "CONCREET" ? "Concreet" : p.specificity === "GEMIDDELD" ? "Gemiddeld" : "Vaag"}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                      {themePromises.length > 10 && (
                        <div className="px-4 py-2 text-[11px] text-text-tertiary">
                          + {themePromises.length - 10} meer
                        </div>
                      )}
                    </div>
                  </div>
                ));
            })()}
          </div>

          {/* Link to all promises */}
          <Link
            href={`${r.beloften}?partij=${encodeURIComponent(party.abbreviation)}&jaar=2026`}
            className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-medium text-moss hover:underline"
          >
            Alle {promises2026.length} beloften bekijken
            <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
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
