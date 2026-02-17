import Link from "next/link";
import { searchAll } from "../../../../lib/api";
import { routes } from "../../../../lib/routes";
import type { MotionListItem, PromiseListItem, MemberListItem } from "../../../../lib/types";
import { themeLabel } from "../../../../lib/utils";
import PartyBadge from "../../../../components/PartyBadge";
import SearchForm from "./SearchForm";

interface Props {
  searchParams: { q?: string };
}

export const metadata = {
  title: "Zoeken — CivicStat",
  description: "Doorzoek moties, verkiezingsbeloften en Kamerleden.",
};

// ─── Helpers ──────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Section Components ──────────────────────────────────────

function MotionResults({
  items,
  total,
  q,
}: {
  items: MotionListItem[];
  total: number;
  q: string;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[15px] font-semibold text-ink">
          Moties
          <span className="ml-2 text-[12px] font-normal text-text-tertiary">
            {total} resultaten
          </span>
        </h2>
        {total > 10 && (
          <Link
            href={`${routes.tk.moties}?q=${encodeURIComponent(q)}`}
            className="text-[12px] font-medium text-moss hover:underline"
          >
            Bekijk alle {total} &rarr;
          </Link>
        )}
      </div>
      <div className="space-y-2">
        {items.map((motion) => {
          const vote = motion.vote || motion.votes?.[0];
          return (
            <Link
              key={motion.id}
              href={routes.tk.motie(motion.id)}
              className="card block px-4 py-3 hover:bg-surface-sub/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-medium text-ink leading-snug line-clamp-2">
                    {motion.title || motion.text?.slice(0, 120)}
                  </h3>
                  {motion.text && motion.title && (
                    <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-1 mt-0.5">
                      {motion.text.slice(0, 150)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-text-tertiary">
                    {motion.tkNumber && (
                      <span className="font-mono">{motion.tkNumber}</span>
                    )}
                    <span>{formatDate(motion.dateIntroduced)}</span>
                    {motion.sponsors?.[0]?.mp && (
                      <span>
                        {motion.sponsors[0].mp.name}
                      </span>
                    )}
                  </div>
                </div>
                {vote && (
                  <span
                    className={`shrink-0 mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      vote.result === "Aangenomen"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {vote.result === "Aangenomen" ? "Aangenomen" : "Verworpen"}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function PromiseResults({
  items,
  total,
  q,
}: {
  items: PromiseListItem[];
  total: number;
  q: string;
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[15px] font-semibold text-ink">
          Beloften
          <span className="ml-2 text-[12px] font-normal text-text-tertiary">
            {total} resultaten
          </span>
        </h2>
        {total > 10 && (
          <Link
            href={`${routes.tk.beloften}?q=${encodeURIComponent(q)}`}
            className="text-[12px] font-medium text-moss hover:underline"
          >
            Bekijk alle {total} &rarr;
          </Link>
        )}
      </div>
      <div className="space-y-2">
        {items.map((promise) => (
          <Link
            key={promise.id}
            href={routes.tk.belofte(promise.id)}
            className="card block px-4 py-3 hover:bg-surface-sub/40 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  <PartyBadge
                    abbreviation={promise.program.party.abbreviation}
                    colorNeutral={promise.program.party.colorNeutral}
                    size="sm"
                  />
                  <span className="inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                    {themeLabel(promise.theme)}
                  </span>
                  <span className="text-[10px] text-text-tertiary font-mono">
                    {promise.promiseCode}
                  </span>
                </div>
                <h3 className="text-[13px] font-medium text-ink leading-snug line-clamp-2">
                  {promise.summary}
                </h3>
                <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-1 mt-0.5">
                  {promise.text}
                </p>
              </div>
              {promise.motionMatches.length > 0 && (
                <span className="shrink-0 mt-0.5 inline-flex items-center rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                  {promise.motionMatches.length} moties
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MemberResults({
  members,
  q,
}: {
  members: MemberListItem[];
  q: string;
}) {
  if (members.length === 0) return null;

  // Only show first 10 for search results
  const shown = members.slice(0, 10);
  const total = members.length;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[15px] font-semibold text-ink">
          Kamerleden
          <span className="ml-2 text-[12px] font-normal text-text-tertiary">
            {total} resultaten
          </span>
        </h2>
        {total > 10 && (
          <Link
            href={`${routes.tk.kamerleden}?q=${encodeURIComponent(q)}`}
            className="text-[12px] font-medium text-moss hover:underline"
          >
            Bekijk alle {total} &rarr;
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {shown.map((member) => (
          <Link
            key={member.id}
            href={routes.tk.kamerlid(member.id)}
            className="card flex items-center gap-3 px-4 py-3 hover:bg-surface-sub/40 transition-colors"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-sub text-[13px] font-semibold text-text-secondary">
              {member.name.charAt(0)}
              {member.surname.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-medium text-ink leading-snug truncate" title={member.name}>
                {member.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <PartyBadge
                  abbreviation={member.party.abbreviation}
                  colorNeutral={member.party.colorNeutral}
                  size="sm"
                />
                <span className="text-[11px] text-text-tertiary">
                  {member._count.sponsors} moties &middot; {member._count.voteRecords} stemmen
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default async function ZoekenPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() || "";

  // If no query, show just the search bar
  if (!q) {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
          Zoeken
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-5">
          Doorzoek moties, verkiezingsbeloften en Kamerleden.
        </p>
        <SearchForm initialQuery="" />
        <div className="card px-5 py-10 text-center">
          <p className="text-sm text-text-tertiary mb-4">
            Typ een zoekterm om te beginnen.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["defensie", "klimaat", "VVD", "Wilders", "zorg", "wonen"].map((term) => (
              <a
                key={term}
                href={`${routes.tk.zoeken}?q=${encodeURIComponent(term)}`}
                className="rounded-lg border border-border px-3 py-1.5 text-[13px] text-text-secondary hover:bg-surface-sub hover:text-ink transition-colors"
              >
                {term}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fetch all results in parallel
  let results;
  try {
    results = await searchAll(q);
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
          Zoeken
        </h1>
        <SearchForm initialQuery={q} />
        <div className="card p-6 text-text-secondary text-sm">
          Kon geen verbinding maken met de API. Probeer het later opnieuw.
        </div>
      </div>
    );
  }

  const totalResults =
    results.motions.total + results.promises.total + results.members.length;

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Zoeken
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">
        {totalResults} resultaten voor &ldquo;{q}&rdquo;
      </p>

      <SearchForm initialQuery={q} />

      {totalResults === 0 ? (
        <div className="card px-5 py-10 text-center text-sm text-text-tertiary">
          Geen resultaten gevonden voor &ldquo;{q}&rdquo;. Probeer een andere
          zoekterm.
        </div>
      ) : (
        <div className="space-y-8">
          <MemberResults members={results.members} q={q} />
          <PromiseResults
            items={results.promises.items}
            total={results.promises.total}
            q={q}
          />
          <MotionResults
            items={results.motions.items}
            total={results.motions.total}
            q={q}
          />
        </div>
      )}
    </div>
  );
}
