/**
 * Centralized route definitions for CivicStat.
 *
 * Every internal `href` should use these helpers so a single change here
 * propagates everywhere. Scoped to NL / Tweede Kamer and NL / Gemeenten.
 */

const TK = "/nl/tweede-kamer";
const GEMEENTE_BASE = "/nl/gemeenten";

/**
 * Build routes for a specific gemeente (municipality).
 * Usage: gemeente("amsterdam").moties → "/nl/gemeenten/amsterdam/moties"
 */
export function gemeente(slug: string) {
  const base = `${GEMEENTE_BASE}/${slug}`;
  return {
    root: base,
    beloften: `${base}/beloften`,
    belofte: (id: string) => `${base}/beloften/${id}`,
    moties: `${base}/moties`,
    motie: (id: string) => `${base}/moties/${id}`,
    raadsleden: `${base}/raadsleden`,
    raadslid: (id: string) => `${base}/raadsleden/${id}`,
    partijen: `${base}/partijen`,
    partij: (id: string) => `${base}/partijen/${encodeURIComponent(id)}`,
  } as const;
}

// ── List pages ──────────────────────────────────────────────
export const routes = {
  home: "/",

  // Tweede Kamer scope
  tk: {
    root: TK,
    beloften: `${TK}/beloften`,
    belofte: (id: string) => `${TK}/beloften/${id}`,
    moties: `${TK}/moties`,
    motie: (id: string) => `${TK}/moties/${id}`,
    kamerleden: `${TK}/kamerleden`,
    kamerlid: (id: string) => `${TK}/kamerleden/${id}`,
    partijen: `${TK}/partijen`,
    partij: (id: string) => `${TK}/partijen/${encodeURIComponent(id)}`,
    verbinding: `${TK}/verbinding`,
    inzichten: `${TK}/inzichten`,
    zoeken: `${TK}/zoeken`,
    coalities: `${TK}/coalities`,
    coalitie: (slug: string) => `${TK}/coalities/${slug}`,
    vergelijk: `${TK}/vergelijk`,
  },

  // Gemeenten (municipalities) listing
  gemeenten: {
    root: GEMEENTE_BASE,
  },

  // Verkiezingen (elections)
  verkiezingen: {
    2026: "/nl/verkiezingen/2026",
  },

  // Global / non-scoped
  transparantie: "/transparantie",
  privacy: "/privacy",
  status: "/status",
} as const;

/** Build a query-string href, e.g. routes.tk.beloften + qs({ page: "2" }) */
export function qs(params: Record<string, string>): string {
  const sp = new URLSearchParams(params);
  const s = sp.toString();
  return s ? `?${s}` : "";
}
