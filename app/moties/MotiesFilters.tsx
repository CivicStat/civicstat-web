"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
  currentStatus?: string;
  currentQ?: string;
  currentSort?: string;
  currentHasVotes?: boolean;
  currentHasPredictions?: boolean;
}

export default function MotiesFilters({ currentStatus, currentQ, currentSort, currentHasVotes, currentHasPredictions }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(currentQ ?? "");
  const [isPending, startTransition] = useTransition();

  function navigate(params: { status?: string; q?: string; sort?: string; hasVotes?: boolean; hasPredictions?: boolean }) {
    const sp = new URLSearchParams();
    if (params.status) sp.set("status", params.status);
    if (params.q) sp.set("q", params.q);
    if (params.sort) sp.set("sort", params.sort);
    if (params.hasVotes === false) sp.set("hasVotes", "false");
    if (params.hasPredictions) sp.set("hasPredictions", "true");
    startTransition(() => {
      router.push(`/moties${sp.toString() ? `?${sp.toString()}` : ""}` as any);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ status: currentStatus, q: q || undefined, sort: currentSort, hasVotes: currentHasVotes, hasPredictions: currentHasPredictions });
  }

  return (
    <div className="mb-5 space-y-3">
      {/* Status filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { value: undefined, label: "Alle" },
          { value: "Aangenomen", label: "Aangenomen" },
          { value: "Verworpen", label: "Verworpen" },
        ].map((f) => {
          const active = currentStatus === f.value;
          return (
            <button
              key={f.label}
              onClick={() => navigate({ status: f.value, q: currentQ, sort: currentSort, hasVotes: currentHasVotes, hasPredictions: currentHasPredictions })}
              className={`rounded-lg px-3.5 py-1.5 text-[13px] font-medium border transition-colors ${
                active
                  ? "border-moss bg-accent-subtle text-moss"
                  : "border-border text-text-secondary hover:bg-surface-sub"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Zoek op titel of tekst..."
          className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-ink outline-none placeholder:text-text-tertiary focus:ring-2 focus:ring-moss/30 focus:border-moss"
        />
        <button
          type="submit"
          className="rounded-lg bg-moss px-4 py-2 text-sm font-medium text-white hover:bg-moss-hover transition-colors"
        >
          Zoek
        </button>
      </form>

      {/* Toggle filters */}
      <div className="flex gap-1.5">
        <button
          onClick={() =>
            navigate({
              status: currentStatus,
              q: currentQ,
              sort: currentSort,
              hasVotes: currentHasVotes ? false : undefined,
              hasPredictions: currentHasPredictions,
            })
          }
          className={`rounded-lg px-3 py-1.5 text-[13px] font-medium border transition-colors ${
            currentHasVotes
              ? "border-moss bg-accent-subtle text-moss"
              : "border-border text-text-secondary hover:bg-surface-sub"
          }`}
        >
          Met stemuitslag
        </button>
        <button
          onClick={() =>
            navigate({
              status: currentStatus,
              q: currentQ,
              sort: currentSort,
              hasVotes: currentHasVotes,
              hasPredictions: currentHasPredictions ? undefined : true,
            })
          }
          className={`rounded-lg px-3 py-1.5 text-[13px] font-medium border transition-colors ${
            currentHasPredictions
              ? "border-moss bg-accent-subtle text-moss"
              : "border-border text-text-secondary hover:bg-surface-sub"
          }`}
        >
          Met voorspelling
        </button>
      </div>

      {/* Sort toggle */}
      <div className="flex gap-1.5">
        {[
          { value: undefined as string | undefined, label: "Nieuwste" },
          { value: "votes" as string | undefined, label: "Meest gestemd" },
        ].map((s) => {
          const active = currentSort === s.value;
          return (
            <button
              key={s.label}
              onClick={() =>
                navigate({
                  status: currentStatus,
                  q: currentQ,
                  sort: s.value,
                  hasVotes: currentHasVotes,
                  hasPredictions: currentHasPredictions,
                })
              }
              className={`rounded-lg px-3 py-1.5 text-[13px] font-medium border transition-colors ${
                active
                  ? "border-moss bg-accent-subtle text-moss"
                  : "border-border text-text-secondary hover:bg-surface-sub"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {isPending && (
        <div className="text-xs text-text-tertiary animate-pulse">
          Laden...
        </div>
      )}
    </div>
  );
}
