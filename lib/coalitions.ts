export const COALITIONS: Record<number, { name: string; parties: string[] }> = {
  2024: { name: "Kabinet-Schoof", parties: ["PVV", "VVD", "NSC", "BBB"] },
  2026: { name: "Kabinet-Jetten", parties: ["D66", "VVD", "CDA"] },
};

export function getCoalitionsForParty(abbreviation: string): { year: number; name: string }[] {
  return Object.entries(COALITIONS)
    .filter(([, c]) => c.parties.includes(abbreviation))
    .map(([year, c]) => ({ year: parseInt(year), name: c.name }));
}

export function isCoalitionParty(abbreviation: string): boolean {
  return Object.values(COALITIONS).some((c) => c.parties.includes(abbreviation));
}
