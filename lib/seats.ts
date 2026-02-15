/**
 * Seat-count helpers.
 *
 * Seat data now comes from the API (synced from TK OData via ETL).
 * Party objects include `seats: number` directly.
 *
 * This module provides backward-compatible helpers for components
 * that need to check whether a party is "active" (has seats).
 */

/** Check whether a party has seats in the current Tweede Kamer. */
export function hasSeats(party: { seats?: number }): boolean {
  return (party.seats ?? 0) > 0;
}

/** Get seat count from a party object (returns 0 if missing). */
export function getSeats(party: { seats?: number }): number {
  return party.seats ?? 0;
}
