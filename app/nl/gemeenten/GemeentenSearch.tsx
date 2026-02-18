"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Municipality {
  id: string;
  slug: string;
  name: string;
  seats: number;
  motions: number;
  parties: number;
  mps: number;
  active: boolean;
  href: string;
}

interface Props {
  municipalities: Municipality[];
}

export default function GemeentenSearch({ municipalities }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return municipalities;
    const q = query.toLowerCase();
    return municipalities.filter((m) =>
      m.name.toLowerCase().includes(q),
    );
  }, [query, municipalities]);

  const activeCount = municipalities.filter((m) => m.active).length;

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-6 max-w-md">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary">
          <svg
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Zoek gemeente..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-sub pl-10 pr-4 py-3 text-[14px] text-ink placeholder:text-text-tertiary outline-none focus:border-moss/40 transition-colors"
        />
      </div>

      {/* Stats summary */}
      <div className="flex items-center gap-3 mb-6 text-[12px] text-text-tertiary">
        <span>{municipalities.length} gemeenten</span>
        <span>&middot;</span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-moss" />
          {activeCount} actief
        </span>
        {municipalities.length > activeCount && (
          <>
            <span>&middot;</span>
            <span>{municipalities.length - activeCount} binnenkort</span>
          </>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-secondary">
            Geen gemeente gevonden voor &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className={`card p-5 group transition-colors ${
                m.active
                  ? "hover:border-moss/40"
                  : "opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-serif text-lg text-ink group-hover:text-moss transition-colors">
                  {m.name}
                </h2>
                {m.active ? (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-moss flex-shrink-0" />
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-sub text-text-tertiary flex-shrink-0">
                    binnenkort
                  </span>
                )}
              </div>
              <p className="text-[13px] text-text-secondary mb-3">
                {m.seats} zetels
              </p>
              <div className="flex gap-4 text-[12px] text-text-tertiary">
                <span>
                  {m.motions.toLocaleString("nl-NL")} moties
                </span>
                <span>{m.parties} partijen</span>
                <span>{m.mps} raadsleden</span>
              </div>
              <span className="inline-block mt-3 text-[13px] font-medium text-moss opacity-0 group-hover:opacity-100 transition-opacity">
                Bekijk dashboard &rarr;
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
