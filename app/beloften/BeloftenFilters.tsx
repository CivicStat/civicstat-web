"use client";

import { useRouter, useSearchParams } from "next/navigation";

const THEMES = [
  { value: "", label: "Alle thema's" },
  { value: "DEFENSIE", label: "Defensie" },
  { value: "MIGRATIE", label: "Migratie" },
  { value: "KLIMAAT", label: "Klimaat" },
  { value: "ZORG", label: "Zorg" },
  { value: "ONDERWIJS", label: "Onderwijs" },
  { value: "ECONOMIE", label: "Economie" },
  { value: "VEILIGHEID", label: "Veiligheid" },
  { value: "WONEN", label: "Wonen" },
  { value: "BESTUUR", label: "Bestuur" },
];

interface Props {
  currentParty?: string;
  currentTheme?: string;
  parties: { abbreviation: string; id: string }[];
}

export default function BeloftenFilters({ currentParty, currentTheme, parties }: Props) {
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
    </div>
  );
}
