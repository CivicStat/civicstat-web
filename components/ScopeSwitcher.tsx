"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { routes, gemeente } from "../lib/routes";

/* ── Types ─────────────────────────────────────────────────── */

interface MunicipalityEntry {
  slug: string;
  name: string;
  motions: number;
  active: boolean; // has data
}

/* ── localStorage helpers for recently visited ─────────────── */

const RECENT_KEY = "civicstat-recent-gemeenten";
const MAX_RECENT = 5;

function getRecentGemeenten(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentGemeente(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getRecentGemeenten().filter((s) => s !== slug);
    list.unshift(slug);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

/* ── Slug → display name ───────────────────────────────────── */

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ── Scope parser ──────────────────────────────────────────── */

const GEMEENTE_PREFIX = "/nl/gemeenten/";

function parseScope(pathname: string): {
  type: "home" | "tk" | "gemeente" | "gemeenten-list" | "other";
  gemeenteSlug?: string;
} {
  if (pathname.startsWith("/nl/tweede-kamer")) return { type: "tk" };
  if (pathname.startsWith(GEMEENTE_PREFIX)) {
    const rest = pathname.slice(GEMEENTE_PREFIX.length);
    const slug = rest.split("/")[0];
    if (slug) return { type: "gemeente", gemeenteSlug: slug };
    return { type: "gemeenten-list" };
  }
  if (pathname === "/nl/gemeenten") return { type: "gemeenten-list" };
  if (pathname === "/") return { type: "home" };
  return { type: "other" };
}

/* ── Icons ─────────────────────────────────────────────────── */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={12}
      height={12}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      viewBox="0 0 24 24"
      className="text-text-tertiary"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

/* ── Main component ────────────────────────────────────────── */

interface ScopeSwitcherProps {
  /** Pre-fetched municipality list (from server or cache) */
  municipalities?: MunicipalityEntry[];
}

export default function ScopeSwitcher({ municipalities = [] }: ScopeSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const scope = useMemo(() => parseScope(pathname), [pathname]);

  // Track recent visits
  useEffect(() => {
    if (scope.type === "gemeente" && scope.gemeenteSlug) {
      addRecentGemeente(scope.gemeenteSlug);
    }
  }, [scope]);

  // Load recent on mount
  useEffect(() => {
    setRecentSlugs(getRecentGemeenten());
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  // Filter municipalities
  const filtered = useMemo(() => {
    if (!search.trim()) return municipalities;
    const q = search.toLowerCase();
    return municipalities.filter((m) => m.name.toLowerCase().includes(q));
  }, [search, municipalities]);

  // Recent entries (only those that exist in municipalities list)
  const recentEntries = useMemo(() => {
    return recentSlugs
      .map((slug) => municipalities.find((m) => m.slug === slug))
      .filter(Boolean) as MunicipalityEntry[];
  }, [recentSlugs, municipalities]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  // Current scope label
  const scopeLabel = useMemo(() => {
    switch (scope.type) {
      case "tk":
        return "Tweede Kamer";
      case "gemeente":
        return slugToName(scope.gemeenteSlug!);
      case "gemeenten-list":
        return "Gemeenteraden";
      default:
        return "Nederland";
    }
  }, [scope]);

  const scopeIcon = useMemo(() => {
    switch (scope.type) {
      case "tk":
        return "NL";
      case "gemeente":
      case "gemeenten-list":
        return "GR";
      default:
        return null;
    }
  }, [scope]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-[7px] px-2.5 py-1.5 text-[13px] transition-colors ${
          open
            ? "bg-surface-sub text-ink"
            : "text-text-secondary hover:bg-surface-sub/60 hover:text-ink"
        }`}
      >
        {scopeIcon && (
          <span className="text-[10px] font-semibold tracking-wide text-text-tertiary" aria-hidden>
            {scopeIcon}
          </span>
        )}
        <span className="font-medium max-w-[160px] truncate">{scopeLabel}</span>
        <ChevronIcon open={open} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 top-full mt-1.5 z-[60] w-[280px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface shadow-lg shadow-black/8 overflow-hidden"
        >
          {/* Main items */}
          <div className="p-1.5">
            <button
              onClick={() => navigate(routes.tk.root)}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
                scope.type === "tk"
                  ? "bg-surface-sub text-ink"
                  : "text-text-secondary hover:bg-surface-sub/60 hover:text-ink"
              }`}
            >
              <span className="text-[10px] font-semibold tracking-wide text-text-tertiary" aria-hidden>
                NL
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium">Tweede Kamer</div>
                <div className="text-[11px] text-text-tertiary">
                  150 zetels &middot; Nationaal
                </div>
              </div>
              {scope.type === "tk" && (
                <div className="w-1.5 h-1.5 rounded-full bg-moss flex-shrink-0" />
              )}
            </button>
          </div>

          <div className="border-t border-border-subtle" />

          {/* Gemeenteraden section */}
          <div className="p-1.5">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary">
                Gemeenteraden
              </span>
              <Link
                href={routes.gemeenten.root}
                onClick={() => setOpen(false)}
                className="text-[10px] font-medium text-moss hover:underline"
              >
                Alles &rarr;
              </Link>
            </div>

            {/* Search */}
            <div className="relative mx-1.5 mb-1.5">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder="Zoek gemeente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-sub pl-8 pr-3 py-2 text-[13px] text-ink placeholder:text-text-tertiary outline-none focus:border-moss/40 transition-colors"
              />
            </div>

            {/* Recent visited (only when no search) */}
            {!search.trim() && recentEntries.length > 0 && (
              <div className="mb-1">
                <div className="px-3 py-1 text-[10px] text-text-tertiary">
                  Recent bezocht
                </div>
                {recentEntries.map((m) => (
                  <button
                    key={m.slug}
                    onClick={() => navigate(gemeente(m.slug).root)}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                      scope.type === "gemeente" && scope.gemeenteSlug === m.slug
                        ? "bg-surface-sub text-ink"
                        : "text-text-secondary hover:bg-surface-sub/60 hover:text-ink"
                    }`}
                  >
                    <span className="text-[10px] font-semibold tracking-wide text-text-tertiary" aria-hidden>
                      GR
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium">{m.name}</div>
                    </div>
                    {scope.type === "gemeente" &&
                      scope.gemeenteSlug === m.slug && (
                        <div className="w-1.5 h-1.5 rounded-full bg-moss flex-shrink-0" />
                      )}
                  </button>
                ))}
                <div className="border-t border-border-subtle mx-1.5 my-1" />
              </div>
            )}

            {/* Filtered list */}
            <div className="max-h-[240px] overflow-y-auto">
              {search.trim() && filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-[12px] text-text-tertiary">
                  Geen gemeente gevonden
                </div>
              ) : (
                <>
                  {!search.trim() && (
                    <div className="px-3 py-1 text-[10px] text-text-tertiary">
                      Beschikbaar
                    </div>
                  )}
                  {filtered.map((m) => (
                    <button
                      key={m.slug}
                      onClick={() => navigate(gemeente(m.slug).root)}
                      className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                        scope.type === "gemeente" &&
                        scope.gemeenteSlug === m.slug
                          ? "bg-surface-sub text-ink"
                          : "text-text-secondary hover:bg-surface-sub/60 hover:text-ink"
                      }`}
                    >
                      <span className="text-[10px] font-semibold tracking-wide text-text-tertiary" aria-hidden>
                        GR
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium">{m.name}</div>
                        <div className="text-[10px] text-text-tertiary">
                          {m.active
                            ? `${m.motions.toLocaleString("nl-NL")} moties`
                            : "Binnenkort"}
                        </div>
                      </div>
                      {m.active && (
                        <div className="w-1.5 h-1.5 rounded-full bg-moss/40 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="border-t border-border-subtle" />

          {/* Other parliaments */}
          <div className="p-1.5">
            <Link
              href="/nl/eerste-kamer"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-surface-sub/60 transition-colors"
              onClick={() => setOpen(false)}
            >
              <span className="text-[10px] font-semibold tracking-wide text-text-tertiary" aria-hidden>
                EK
              </span>
              <span className="text-[12px] text-ink font-medium">
                Eerste Kamer
              </span>
            </Link>
            <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 opacity-50">
              <span className="text-[10px] font-semibold tracking-wide text-text-tertiary" aria-hidden>
                EU
              </span>
              <span className="text-[12px] text-text-tertiary">
                Europees Parlement
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-sub text-text-tertiary">
                binnenkort
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { parseScope, slugToName };
export type { MunicipalityEntry };
