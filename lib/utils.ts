// ─── Date formatting ────────────────────────────────────────

const MONTHS_NL = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

export function formatDate(d: string | Date): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return "–";
  return `${date.getDate()} ${MONTHS_NL[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateShort(d: string | Date): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return "–";
  return `${date.getDate()} ${MONTHS_NL[date.getMonth()]}`;
}

// ─── Initials ───────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((p) => p.length > 1 && p[0] === p[0].toUpperCase())
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

// ─── Party colors ───────────────────────────────────────────

// Fallback colors for parties when colorNeutral isn't in DB
const PARTY_COLORS: Record<string, string> = {
  VVD: "#FF6600",
  PVV: "#002F6C",
  NSC: "#005CA9",
  BBB: "#95C11F",
  "GL-PvdA": "#B71C1C",
  "GroenLinks-PvdA": "#B71C1C",
  D66: "#00A651",
  SP: "#FF0000",
  CDA: "#007B5F",
  PvdD: "#006B2D",
  CU: "#00AEEF",
  ChristenUnie: "#00AEEF",
  FVD: "#8B0000",
  SGP: "#FF6700",
  DENK: "#00B4D8",
  Volt: "#502379",
  JA21: "#1B365D",
};

export function getPartyColor(abbreviation: string, colorNeutral?: string | null): string {
  if (colorNeutral) return colorNeutral;
  return PARTY_COLORS[abbreviation] || "#64748B";
}

// ─── Vote helpers ───────────────────────────────────────────

export function voteBarPercents(
  voor: number,
  tegen: number,
  afwezig: number = 0
): { pVoor: number; pTegen: number; pAfwezig: number } {
  const total = voor + tegen + afwezig || 1;
  return {
    pVoor: (voor / total) * 100,
    pTegen: (tegen / total) * 100,
    pAfwezig: (afwezig / total) * 100,
  };
}

// ─── Display name ───────────────────────────────────────────

export function mpDisplayName(mp: { name: string; surname: string; prefix?: string | null }): string {
  // `name` already contains the full display name from the TK API
  return mp.name;
}

// ─── Specificity formatting ─────────────────────────────────

const SPECIFICITY_MAP: Record<string, { label: string; description: string }> = {
  CONCRETE: { label: "Concreet", description: "Meetbaar en specifiek — bevat een duidelijk doel of maatstaf" },
  HIGH: { label: "Concreet", description: "Meetbaar en specifiek" },
  DIRECTIONAL: { label: "Richtinggevend", description: "Duidelijke richting, maar geen exact doel" },
  MEDIUM: { label: "Richtinggevend", description: "Duidelijke richting, maar geen exact doel" },
  MODERATE: { label: "Richtinggevend", description: "Duidelijke richting, maar geen exact doel" },
  VAGUE: { label: "Algemeen", description: "Brede ambitie zonder concrete invulling" },
  LOW: { label: "Algemeen", description: "Brede ambitie zonder concrete invulling" },
};

export function formatSpecificity(value: string): { label: string; description: string } {
  return SPECIFICITY_MAP[value] || { label: value, description: "" };
}

// ─── Theme labels ───────────────────────────────────────────

const THEME_MAP: Record<string, string> = {
  // National themes
  BESTUUR: "Bestuur",
  BUITENLAND: "Buitenland",
  DEFENSIE: "Defensie",
  ECONOMIE: "Economie",
  KLIMAAT: "Klimaat",
  LANDBOUW: "Landbouw",
  MIGRATIE: "Migratie",
  ONDERWIJS: "Onderwijs",
  SOCIAAL: "Sociaal",
  VEILIGHEID: "Veiligheid",
  WONEN: "Wonen",
  ZORG: "Zorg",
  // Municipal themes
  VERKEER: "Verkeer & mobiliteit",
  GROEN_KLIMAAT: "Groen & klimaat",
  CULTUUR_SPORT: "Cultuur & sport",
  JEUGD: "Jeugd",
  OPENBARE_RUIMTE: "Openbare ruimte",
  FINANCIEN: "Financiën",
  DIVERSITEIT: "Diversiteit & inclusie",
};

export function themeLabel(theme: string): string {
  return THEME_MAP[theme] || theme;
}

// ─── Vote direction formatting ──────────────────────────────

export function directionLabel(d: string): string {
  return d === "VOOR" ? "Verwacht: voor" : d === "TEGEN" ? "Verwacht: tegen" : d;
}

// ─── Match type formatting ──────────────────────────────────

export function matchTypeLabel(t: string): string {
  switch (t) {
    case "EXPLICIT_MATCH": return "direct";
    case "CONTRA_MATCH": return "contra";
    default: return "impliciet";
  }
}

export function matchTypeBadgeClass(t: string): string {
  switch (t) {
    case "EXPLICIT_MATCH": return "bg-accent-subtle text-moss";
    case "CONTRA_MATCH": return "bg-red-500/10 text-red-400";
    default: return "bg-surface-sub text-text-secondary";
  }
}

// ─── clsx (tiny) ────────────────────────────────────────────

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
