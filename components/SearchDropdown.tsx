"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { routes, gemeente } from "../lib/routes";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://civicstat-api.fly.dev";

interface SearchResultItem {
  id: string;
  type: "party" | "member" | "promise" | "motion";
  title: string;
  subtitle?: string;
  snippet?: string;
  meta?: Record<string, unknown>;
}

interface SearchResponse {
  query: string;
  total: number;
  results: {
    parties: SearchResultItem[];
    members: SearchResultItem[];
    promises: SearchResultItem[];
    motions: SearchResultItem[];
  };
}

const LABELS: Record<string, string> = {
  parties: "Partijen",
  members: "Kamerleden",
  promises: "Beloften",
  motions: "Moties",
};

const RECENT_KEY = "civicstat-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(q: string) {
  const recent = getRecentSearches().filter((s) => s !== q);
  recent.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function resultHref(item: SearchResultItem): string {
  const slug = item.meta?.parliamentSlug as string | undefined;
  const isGemeente = slug && slug !== "tweede-kamer" && slug !== "eerste-kamer";

  switch (item.type) {
    case "party":
      if (isGemeente) return `${gemeente(slug!).partij(item.id)}`;
      return routes.tk.partij(item.id);
    case "member":
      if (isGemeente) return `${gemeente(slug!).raadslid(item.id)}`;
      return routes.tk.kamerlid(item.id);
    case "promise":
      if (isGemeente) return `${gemeente(slug!).belofte(item.id)}`;
      return routes.tk.belofte(item.id);
    case "motion":
      if (isGemeente) return `${gemeente(slug!).motie(item.id)}`;
      return routes.tk.motie(item.id);
  }
}

export default function SearchDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten results for keyboard navigation
  const flatItems: SearchResultItem[] = data
    ? [
        ...data.results.parties,
        ...data.results.members,
        ...data.results.promises,
        ...data.results.motions,
      ]
    : [];

  // Debounced fetch
  useEffect(() => {
    if (q.trim().length < 2) {
      setData(null);
      setActiveIdx(-1);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/search?q=${encodeURIComponent(q.trim())}&limit=5`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const json: SearchResponse = await res.json();
          setData(json);
          setActiveIdx(-1);
        }
      } catch {
        // aborted or network error
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape, navigate on Enter, arrow keys
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (activeIdx >= 0 && activeIdx < flatItems.length) {
          const item = flatItems[activeIdx];
          saveRecentSearch(q.trim());
          setOpen(false);
          router.push(resultHref(item));
        } else if (q.trim().length >= 2) {
          saveRecentSearch(q.trim());
          setOpen(false);
          router.push(`${routes.tk.zoeken}?q=${encodeURIComponent(q.trim())}`);
        }
      }
    },
    [activeIdx, flatItems, q, router]
  );

  const recentSearches = getRecentSearches();
  const showDropdown = open && (q.trim().length >= 2 || recentSearches.length > 0);

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="flex items-center gap-1.5 rounded-[7px] bg-surface-sub border border-border px-2.5 py-1.5 transition-colors focus-within:border-moss/50">
        <svg
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          viewBox="0 0 24 24"
          className="flex-shrink-0 text-text-tertiary"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Zoeken..."
          className="w-[140px] lg:w-[180px] border-none outline-none bg-transparent text-[13px] text-ink placeholder:text-text-tertiary"
        />
        {loading && (
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-moss" />
        )}
      </div>

      {/* Dropdown results */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-1.5 w-[360px] max-h-[420px] overflow-y-auto rounded-xl border border-border bg-surface shadow-lg z-[60]">
          {/* Recent searches (when no query) */}
          {q.trim().length < 2 && recentSearches.length > 0 && (
            <div className="p-3">
              <p className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
                Recente zoekopdrachten
              </p>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQ(term);
                    inputRef.current?.focus();
                  }}
                  className="block w-full text-left rounded-md px-2 py-1.5 text-[13px] text-text-secondary hover:bg-surface-sub transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {q.trim().length >= 2 && data && (
            <>
              {data.total === 0 && !loading && (
                <div className="p-4 text-center text-[13px] text-text-tertiary">
                  Geen resultaten voor &ldquo;{q}&rdquo;
                </div>
              )}

              {(["parties", "members", "promises", "motions"] as const).map(
                (group) => {
                  const items = data.results[group];
                  if (items.length === 0) return null;

                  return (
                    <div key={group} className="px-1.5 py-1.5">
                      <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
                        {LABELS[group]}
                      </p>
                      {items.map((item) => {
                        const globalIdx = flatItems.indexOf(item);
                        return (
                          <button
                            key={item.id}
                            onMouseEnter={() => setActiveIdx(globalIdx)}
                            onClick={() => {
                              saveRecentSearch(q.trim());
                              setOpen(false);
                              router.push(resultHref(item));
                            }}
                            className={`flex w-full flex-col rounded-lg px-2 py-1.5 text-left transition-colors ${
                              globalIdx === activeIdx
                                ? "bg-surface-sub"
                                : "hover:bg-surface-sub/60"
                            }`}
                          >
                            <span className="text-[13px] font-medium text-ink line-clamp-1">
                              {item.title}
                            </span>
                            {item.subtitle && (
                              <span className="text-[11px] text-text-tertiary">
                                {item.subtitle}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                }
              )}

              {data.total > 0 && (
                <div className="border-t border-border-subtle px-3 py-2">
                  <button
                    onClick={() => {
                      saveRecentSearch(q.trim());
                      setOpen(false);
                      router.push(
                        `${routes.tk.zoeken}?q=${encodeURIComponent(q.trim())}`
                      );
                    }}
                    className="text-[12px] text-moss hover:underline"
                  >
                    Alle {data.total} resultaten bekijken
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
