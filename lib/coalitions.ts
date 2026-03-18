export interface Coalition {
  name: string;
  subtitle: string;
  year: number;
  parties: readonly string[];
  startDate?: string; // ISO date for trend chart marker
}

export const COALITIONS: Coalition[] = [
  {
    name: "Kabinet-Schoof",
    subtitle: "Hoop, lef en trots",
    year: 2024,
    parties: ["PVV", "VVD", "NSC", "BBB"],
    startDate: "2024-07-02",
  },
  {
    name: "Kabinet-Jetten",
    subtitle: "Aan de slag",
    year: 2026,
    parties: ["D66", "VVD", "CDA"],
    startDate: "2026-02-23",
  },
];

/** Given a party abbreviation, return its coalition(s) or empty array */
export function getCoalitionsForParty(abbreviation: string): Coalition[] {
  return COALITIONS.filter((c) => c.parties.includes(abbreviation));
}

export function isCoalitionParty(abbreviation: string): boolean {
  return COALITIONS.some((c) => c.parties.includes(abbreviation));
}
