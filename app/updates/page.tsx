import type { Metadata } from "next";
import Link from "next/link";
import { getPlatformUpdates, type PlatformUpdateItem } from "../../lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Wat is er nieuw? — CivicStat",
  description:
    "Overzicht van alle nieuwe functies, analyses en data op CivicStat.",
};

const categoryConfig: Record<
  string,
  { label: string; cls: string }
> = {
  NIEUWE_DATA: {
    label: "Nieuwe data",
    cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  NIEUWE_ANALYSE: {
    label: "Nieuwe analyse",
    cls: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  },
  VERBETERING: {
    label: "Verbetering",
    cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  BUGFIX: {
    label: "Bugfix",
    cls: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
};

export default async function UpdatesPage() {
  const updates = await getPlatformUpdates();

  const fmtDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Group updates by month-year
  const grouped: { key: string; label: string; items: PlatformUpdateItem[] }[] = [];
  for (const update of updates) {
    const date = new Date(update.publishedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
    const label = date.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
    let group = grouped.find((g) => g.key === key);
    if (!group) {
      group = { key, label, items: [] };
      grouped.push(group);
    }
    group.items.push(update);
  }

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink mb-2">
          Wat is er nieuw?
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-[68ch]">
          Alle updates, nieuwe functies en data-uitbreidingen op CivicStat.
          Van nieuwe analyses tot verbeterde functionaliteit — alles op een
          rij.
        </p>
      </div>

      {updates.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          Nog geen updates beschikbaar.
        </p>
      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.key}>
              <h2 className="font-serif text-[18px] text-text-secondary mb-4 capitalize">
                {group.label}
              </h2>
              <div className="space-y-4">
                {group.items.map((update) => (
                  <article
                    key={update.id}
                    className="card p-5 group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <time
                          dateTime={update.publishedAt}
                          className="text-[12px] font-medium text-text-tertiary tabular-nums"
                        >
                          {fmtDate(update.publishedAt)}
                        </time>
                        {update.category && categoryConfig[update.category] && (
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${categoryConfig[update.category].cls}`}
                          >
                            {categoryConfig[update.category].label}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-[15px] font-semibold text-ink leading-snug mb-1.5">
                      {update.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {update.body}
                    </p>
                    {update.linkUrl && (
                      <Link
                        href={update.linkUrl}
                        className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-medium text-moss hover:text-moss/80 transition-colors"
                      >
                        {update.linkLabel || "Bekijk"}
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
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
