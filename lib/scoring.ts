/**
 * Score confidence assessment
 * Determines how well-founded an MCS score is based on the ratio of
 * scored promises to total promises.
 */

export interface ScoreConfidence {
  level: "hoog" | "gemiddeld" | "laag" | "onvoldoende";
  label: string;
  description: string;
  ratio: number; // scored / total
}

export function getScoreConfidence(
  scored: number,
  total: number,
): ScoreConfidence {
  if (total === 0) {
    return {
      level: "onvoldoende",
      label: "Geen data",
      description: "Geen beloften gevonden",
      ratio: 0,
    };
  }

  const ratio = scored / total;

  if (ratio >= 0.5) {
    return {
      level: "hoog",
      label: "Goed onderbouwd",
      description: `${scored} van ${total} beloften gekoppeld aan moties`,
      ratio,
    };
  }

  if (ratio >= 0.25) {
    return {
      level: "gemiddeld",
      label: "Gedeeltelijk onderbouwd",
      description: `${scored} van ${total} beloften gekoppeld — score kan verschuiven`,
      ratio,
    };
  }

  if (ratio >= 0.1) {
    return {
      level: "laag",
      label: "Beperkt onderbouwd",
      description: `Slechts ${scored} van ${total} beloften gekoppeld — interpreteer met voorzichtigheid`,
      ratio,
    };
  }

  return {
    level: "onvoldoende",
    label: "Onvoldoende data",
    description: `Te weinig koppelingen (${scored}/${total}) voor een betrouwbare score`,
    ratio,
  };
}
