/**
 * Centralized route definitions for CivicStat.
 *
 * Every internal `href` should use these helpers so a single change here
 * propagates everywhere. Currently scoped to NL / Tweede Kamer; the
 * prefix constants make it trivial to add other scopes later.
 */

const TK = "/nl/tweede-kamer";

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
    zoeken: `${TK}/zoeken`,
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
