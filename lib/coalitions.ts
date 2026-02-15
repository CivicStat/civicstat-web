export interface Coalition {
  name: string;
  subtitle: string;
  year: number;
  parties: readonly string[];
}

export const COALITIONS: Coalition[] = [
  {
    name: "Kabinet-Schoof",
    subtitle: "Hoop, lef en trots",
    year: 2024,
    parties: ["PVV", "VVD", "NSC", "BBB"],
  },
  {
    name: "Kabinet-Jetten",
    subtitle: "Aan de slag",
    year: 2026,
    parties: ["D66", "VVD", "CDA"],
  },
];

/** Given a party abbreviation, return its coalition(s) or empty array */
export function getCoalitionsForParty(abbreviation: string): Coalition[] {
  return COALITIONS.filter((c) => c.parties.includes(abbreviation));
}

export function isCoalitionParty(abbreviation: string): boolean {
  return COALITIONS.some((c) => c.parties.includes(abbreviation));
}
