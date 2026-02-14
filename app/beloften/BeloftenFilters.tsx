"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TK_SEATS } from "../../lib/seats";

const THEMES = [
  { value: "", label: "Alle thema\u2019s" },
  { value: "BESTUUR", label: "Bestuur" },
  { value: "BUITENLAND", label: "Buitenland" },
  { value: "DEFENSIE", label: "Defensie" },
  { value: "ECONOMIE", label: "Economie" },
  { value: "KLIMAAT", label: "Klimaat" },
  { value: "LANDBOUW", label: "Landbouw" },
  { value: "MIGRATIE", label: "Migratie" },
  { value: "ONDERWIJS", label: "Onderwijs" },
  { value: "SOCIAAL", label: "Sociaal" },
  { value: "VEILIGHEID", label: "Veiligheid" },
  { value: "WONEN", label: "Wonen" },
  { value: "ZORG", label: "Zorg" },
];

const SORT_OPTIONS = [
  { value: "", label: "Standaard" },
  { value: "partij", label: "Partij" },
  { value: "thema", label: "Thema" },
];

interface Props {
  currentParty?: string;
  currentTheme?: string;
  currentSort?: string;
  parties: { abbreviation: string; id: string }[];
}

export default function BeloftenFilters({ currentParty, currentTheme, currentSort, parties }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) {
      sp.set(key, value);
    } else {
      sp.delete(key);
    }
    sp.delete("page"); // reset pagination on filter change
    router.push(`/beloften?${sp.toString()}`);
  }

  // Split parties into active (with seats) and other
  const activeParties = parties.filter((p) => TK_SEATS[p.abbreviation]);
  const otherParties = parties.filter((p) => !TK_SEATS[p.abbreviation]);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {/* Party filter */}
      <select
        value={currentParty || ""}
        onChange={(e) => navigate("partij", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-moss"
      >
        <option value="">Alle partijen</option>
        {activeParties.length > 0 && (
          <optgroup label="Huidige fracties">
            {activeParties.map((p) => (
              <option key={p.id} value={p.abbreviation}>
                {p.abbreviation}
              </option>
            ))}
          </optgroup>
        )}
        {otherParties.length > 0 && (
          <optgroup label="Overige">
            {otherParties.map((p) => (
              <option key={p.id} value={p.abbreviation}>
                {p.abbreviation}
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {/* Theme filter */}
      <select
        value={currentTheme || ""}
        onChange={(e) => navigate("thema", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-moss"
      >
        {THEMES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={currentSort || ""}
        onChange={(e) => navigate("sort", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-moss"
      >
        {SORT_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
