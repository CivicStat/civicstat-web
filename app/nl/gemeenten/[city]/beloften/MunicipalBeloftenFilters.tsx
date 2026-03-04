"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { gemeente } from "../../../../../lib/routes";

const THEMES = [
  { value: "", label: "Alle thema\u2019s" },
  // National themes (also used in some municipal programs)
  { value: "BESTUUR", label: "Bestuur" },
  { value: "ECONOMIE", label: "Economie" },
  { value: "KLIMAAT", label: "Klimaat" },
  { value: "ONDERWIJS", label: "Onderwijs" },
  { value: "SOCIAAL", label: "Sociaal" },
  { value: "VEILIGHEID", label: "Veiligheid" },
  { value: "WONEN", label: "Wonen" },
  { value: "ZORG", label: "Zorg" },
  // Municipal-specific themes
  { value: "VERKEER", label: "Verkeer & mobiliteit" },
  { value: "GROEN_KLIMAAT", label: "Groen & klimaat" },
  { value: "CULTUUR_SPORT", label: "Cultuur & sport" },
  { value: "JEUGD", label: "Jeugd" },
  { value: "OPENBARE_RUIMTE", label: "Openbare ruimte" },
  { value: "FINANCIEN", label: "Financi\u00ebn" },
  { value: "DIVERSITEIT", label: "Diversiteit & inclusie" },
];

interface Props {
  currentParty?: string;
  currentTheme?: string;
  currentYear?: string;
  parties: { abbreviation: string; id: string }[];
  citySlug: string;
}

const YEARS = [
  { value: "", label: "Alle jaren" },
  { value: "2026", label: "2026" },
  { value: "2022", label: "2022" },
];

export default function MunicipalBeloftenFilters({
  currentParty,
  currentTheme,
  currentYear,
  parties,
  citySlug,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routes = gemeente(citySlug);

  function navigate(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) {
      sp.set(key, value);
    } else {
      sp.delete(key);
    }
    sp.delete("page"); // reset pagination on filter change
    router.push(`${routes.beloften}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {/* Party filter */}
      <select
        value={currentParty || ""}
        onChange={(e) => navigate("partij", e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-moss"
      >
        <option value="">Alle partijen</option>
        {parties.map((p) => (
          <option key={p.id} value={p.abbreviation}>
            {p.abbreviation}
          </option>
        ))}
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

      {/* Year filter */}
      <div className="flex gap-1">
        {YEARS.map((y) => (
          <button
            key={y.value}
            onClick={() => navigate("jaar", y.value)}
            className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
              (currentYear || "") === y.value
                ? "bg-ink text-white dark:bg-white dark:text-ink shadow-sm"
                : "text-text-tertiary hover:text-ink hover:bg-surface-sub border border-border"
            }`}
          >
            {y.label}
          </button>
        ))}
      </div>

      {/* Active filter pills */}
      {(currentParty || currentTheme || currentYear) && (
        <button
          onClick={() => router.push(routes.beloften)}
          className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:bg-surface-sub transition-colors"
        >
          Filters wissen
        </button>
      )}
    </div>
  );
}
