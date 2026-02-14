"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { MemberListItem } from "../../lib/types";
import { getPartyColor } from "../../lib/utils";
import PartyBadge from "../../components/PartyBadge";
import MemberPhoto from "../../components/MemberPhoto";

type SortOption = "name" | "party" | "motions" | "votes";

interface Props {
  members: MemberListItem[];
  parties: { abbreviation: string; colorNeutral: string | null }[];
}

export default function KamerledenFilters({ members, parties }: Props) {
  const [search, setSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [sort, setSort] = useState<SortOption>("name");

  const filtered = useMemo(() => {
    let result = members;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.surname.toLowerCase().includes(q)
      );
    }

    // Party filter
    if (partyFilter) {
      result = result.filter(
        (m) => m.party.abbreviation === partyFilter
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "party":
          return a.party.abbreviation.localeCompare(b.party.abbreviation);
        case "motions":
          return (b._count?.sponsors ?? 0) - (a._count?.sponsors ?? 0);
        case "votes":
          return (b._count?.voteRecords ?? 0) - (a._count?.voteRecords ?? 0);
        default: // name
          return a.surname.localeCompare(b.surname);
      }
    });

    return result;
  }, [members, search, partyFilter, sort]);

  // Unique parties for dropdown
  const uniqueParties = useMemo(() => {
    const seen = new Set<string>();
    return parties
      .filter((p) => {
        if (seen.has(p.abbreviation)) return false;
        seen.add(p.abbreviation);
        return true;
      })
      .sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));
  }, [parties]);

  return (
    <>
      {/* Filters */}
      <div className="mb-5 space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam..."
            className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-ink outline-none placeholder:text-text-tertiary focus:ring-2 focus:ring-moss/30 focus:border-moss w-full sm:w-64"
          />

          {/* Party filter */}
          <select
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
          >
            <option value="">Alle partijen</option>
            {uniqueParties.map((p) => (
              <option key={p.abbreviation} value={p.abbreviation}>
                {p.abbreviation}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-moss/30 focus:border-moss"
          >
            <option value="name">Naam A-Z</option>
            <option value="party">Partij</option>
            <option value="motions">Meeste moties</option>
            <option value="votes">Meeste stemmen</option>
          </select>
        </div>

        <p className="text-[12px] text-text-tertiary">
          {filtered.length} van {members.length} kamerleden
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => {
          const color = getPartyColor(m.party.abbreviation, m.party.colorNeutral);
          return (
            <Link
              key={m.id}
              href={`/kamerleden/${m.id}`}
              className="card p-[18px] hover:border-moss/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MemberPhoto
                  tkId={m.tkId}
                  name={m.surname}
                  size="sm"
                  color={color}
                />
                <div className="min-w-0">
                  <div
                    className="text-sm font-semibold text-ink truncate"
                    title={m.name}
                  >
                    {m.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <PartyBadge
                      abbreviation={m.party.abbreviation}
                      colorNeutral={m.party.colorNeutral}
                      size="sm"
                    />
                    {(m._count?.sponsors > 0 || m._count?.voteRecords > 0) && (
                      <span className="text-[11px] text-text-tertiary">
                        {m._count.sponsors > 0
                          ? `${m._count.sponsors} moties`
                          : ""}
                        {m._count.sponsors > 0 && m._count.voteRecords > 0
                          ? " · "
                          : ""}
                        {m._count.voteRecords > 0
                          ? `${m._count.voteRecords} stemmen`
                          : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card px-5 py-10 text-center text-sm text-text-tertiary mt-3">
          Geen kamerleden gevonden voor deze zoekopdracht.
        </div>
      )}
    </>
  );
}
