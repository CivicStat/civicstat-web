"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "../lib/routes";
import type { PromiseScore } from "../lib/types";

const THEME_MAP: Record<string, string> = {
  BESTUUR: "Bestuur", BUITENLAND: "Buitenland", DEFENSIE: "Defensie",
  ECONOMIE: "Economie", KLIMAAT: "Klimaat", LANDBOUW: "Landbouw",
  MIGRATIE: "Migratie", ONDERWIJS: "Onderwijs", SOCIAAL: "Sociaal",
  VEILIGHEID: "Veiligheid", WONEN: "Wonen", ZORG: "Zorg",
};

function themeLabel(theme: string): string {
  return THEME_MAP[theme] || theme;
}

function statusIcon(status: PromiseScore["status"]): string {
  switch (status) {
    case "consistent": return "●";
    case "mixed": return "◐";
    case "inconsistent": return "○";
    default: return "·";
  }
}

function statusLabel(status: PromiseScore["status"]): string {
  switch (status) {
    case "consistent": return "Consistent";
    case "mixed": return "Wisselend";
    case "inconsistent": return "Afwijkend";
    default: return "Onvoldoende data";
  }
}

function statusBadgeClass(status: PromiseScore["status"]): string {
  switch (status) {
    case "consistent": return "text-ink border-ink/20 bg-ink/5";
    case "mixed": return "text-text-secondary border-border bg-surface-sub";
    case "inconsistent": return "text-text-tertiary border-border bg-surface-sub/50";
    default: return "text-text-tertiary border-border-subtle bg-transparent";
  }
}

interface Props {
  promises: PromiseScore[];
}

export default function PromiseSearchList({ promises }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const filtered = promises.filter((ps) => {
    const matchesQuery = !query ||
      ps.summary.toLowerCase().includes(query.toLowerCase()) ||
      ps.promiseCode.toLowerCase().includes(query.toLowerCase()) ||
      themeLabel(ps.theme).toLowerCase().includes(query.toLowerCase());
    const matchesStatus = !statusFilter || ps.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="section-label">Individuele beloften</div>
        <span className="text-[11px] text-text-tertiary">({filtered.length})</span>
      </div>

      {/* Search + filter row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            width={14}
            height={14}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            viewBox="0 0 24 24"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek belofte..."
            className="w-full rounded-lg border border-border bg-surface pl-8 pr-3 py-1.5 text-[13px] text-ink placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-moss"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-moss"
        >
          <option value="">Alle statussen</option>
          <option value="consistent">Consistent</option>
          <option value="mixed">Wisselend</option>
          <option value="inconsistent">Afwijkend</option>
          <option value="insufficient_data">Onvoldoende data</option>
        </select>
      </div>

      {/* Promise list */}
      <div className="space-y-1">
        {filtered.length === 0 && (
          <p className="text-[13px] text-text-tertiary py-4 text-center">
            Geen beloften gevonden{query ? ` voor "${query}"` : ""}.
          </p>
        )}
        {filtered.map((ps) => (
          <Link
            key={ps.promiseId}
            href={routes.tk.belofte(ps.promiseCode)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-sub/60 transition-colors"
          >
            <span className="text-sm shrink-0">{statusIcon(ps.status)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-ink truncate">{ps.summary}</div>
              <div className="flex items-center gap-2 text-[11px] text-text-tertiary mt-0.5">
                <span className="font-mono">{ps.promiseCode}</span>
                <span>·</span>
                <span>{themeLabel(ps.theme)}</span>
              </div>
            </div>
            {ps.totalMotionsWithVotes > 0 && (
              <span className="text-[11px] text-text-tertiary shrink-0">
                {ps.alignedVotes}/{ps.totalMotionsWithVotes}
              </span>
            )}
            <span className={`text-[10px] rounded-full px-2 py-0.5 border shrink-0 ${statusBadgeClass(ps.status)}`}>
              {statusLabel(ps.status)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
