/**
 * Canonical seat counts for the current Tweede Kamer (2023 election).
 * Single source of truth — import this everywhere instead of inline maps.
 */
export const TK_SEATS: Record<string, number> = {
  PVV: 37,
  "GroenLinks-PvdA": 25,
  "GL-PvdA": 25,
  VVD: 24,
  NSC: 20,
  D66: 9,
  BBB: 7,
  CDA: 5,
  SP: 5,
  PvdD: 3,
  ChristenUnie: 3,
  CU: 3,
  FVD: 3,
  SGP: 3,
  DENK: 3,
  Volt: 2,
  JA21: 1,
};

/** Look up seats for a party abbreviation (returns 0 if unknown). */
export function getSeats(abbreviation: string): number {
  return TK_SEATS[abbreviation] || 0;
}
