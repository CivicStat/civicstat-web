import Link from "next/link";
import { getParliaments, getFormation } from "../../../lib/api";
import { routes } from "../../../lib/routes";
import type { FormationResponse } from "../../../lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Formatie — Coalitievorming per gemeente — CivicStat",
  description:
    "Live overzicht van de coalitievorming na de gemeenteraadsverkiezingen van 18 maart 2026. Verkenning, informatie en formatie per gemeente.",
};

const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  VERKENNING: { label: "Verkenning", color: "bg-amber-100 text-amber-800" },
  INFORMATIE: { label: "Informatie", color: "bg-blue-100 text-blue-800" },
  FORMATIE: { label: "Formatie", color: "bg-emerald-100 text-emerald-800" },
  AFGEROND: { label: "Afgerond", color: "bg-zinc-100 text-zinc-600" },
};

export default async function FormatiePage() {
  const parliaments = await getParliaments();

  // Fetch formation data for all parliaments in parallel
  const formationResults = await Promise.allSettled(
    parliaments.map((p) => getFormation(p.slug)),
  );

  const items: {
    slug: string;
    name: string;
    shortName: string;
    seats: number;
    level: string;
    formation: FormationResponse["formation"];
  }[] = [];

  parliaments.forEach((p, i) => {
    const result = formationResults[i];
    const data = result.status === "fulfilled" ? result.value : null;
    if (data?.formation) {
      items.push({
        slug: p.slug,
        name: p.name,
        shortName: p.shortName,
        seats: p.seats,
        level: p.level,
        formation: data.formation,
      });
    }
  });

  // Sort: municipalities first (by name), then national
  items.sort((a, b) => {
    if (a.level !== b.level) return a.level === "MUNICIPAL" ? -1 : 1;
    return a.shortName.localeCompare(b.shortName, "nl");
  });

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-20">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-text-tertiary mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-moss transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Formatie</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
          Coalitievorming 2026
        </p>
        <h1 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink leading-[1.2] tracking-tight">
          Formatie
        </h1>
        <p className="text-[15px] text-text-secondary mt-2 max-w-[600px] leading-relaxed">
          Na de gemeenteraadsverkiezingen van 18 maart 2026 wordt in elke gemeente
          een nieuwe coalitie gevormd. Hier volgen we het formatieproces per
          gemeente — met deelnemende partijen, stemovereenkomst en coalitiekansen.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-[15px] text-text-secondary">
            Er zijn momenteel geen actieve formatieprocessen.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const phase = item.formation
              ? PHASE_LABELS[item.formation.phase] ?? {
                  label: item.formation.phase,
                  color: "bg-zinc-100 text-zinc-600",
                }
              : null;
            const participants = item.formation?.participants ?? [];
            const totalParticipantSeats = participants.reduce(
              (s, p) => s + (p.party.seats ?? 0),
              0,
            );
            const majorityThreshold = Math.floor(item.seats / 2) + 1;

            return (
              <Link
                key={item.slug}
                href={routes.formatie.detail(item.slug)}
                className="card p-5 hover:border-moss/40 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-[16px] font-semibold text-ink group-hover:text-moss transition-colors">
                      {item.shortName}
                    </h2>
                    <p className="text-[11px] text-text-tertiary">
                      {item.seats} zetels
                    </p>
                  </div>
                  {phase && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${phase.color}`}
                    >
                      {phase.label}
                    </span>
                  )}
                </div>

                {item.formation?.currentLeader && (
                  <p className="text-[12px] text-text-secondary mb-3">
                    <span className="text-text-tertiary capitalize">
                      {item.formation.leaderRole}:
                    </span>{" "}
                    {item.formation.currentLeader}
                  </p>
                )}

                {participants.length > 0 ? (
                  <div className="mb-3">
                    <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1.5">
                      Deelnemende partijen
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {participants.map((p) => (
                        <span
                          key={p.party.id}
                          className="text-[11px] font-medium text-ink bg-surface-sub px-2 py-0.5 rounded"
                        >
                          {p.party.abbreviation}{" "}
                          <span className="text-text-tertiary">
                            ({p.party.seats})
                          </span>
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-text-tertiary mt-1.5">
                      {totalParticipantSeats} / {majorityThreshold} zetels nodig
                      voor meerderheid
                    </p>
                  </div>
                ) : (
                  <p className="text-[12px] text-text-tertiary mb-3">
                    Nog geen deelnemende partijen bekend.
                  </p>
                )}

                <div className="text-[11px] text-text-tertiary">
                  Gestart{" "}
                  {new Date(item.formation!.startedAt).toLocaleDateString(
                    "nl-NL",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Explanation */}
      <div className="mt-10 card px-5 py-4">
        <h3 className="text-[13px] font-semibold text-ink mb-1">
          Hoe werkt de formatie?
        </h3>
        <p className="text-[12px] text-text-secondary leading-relaxed">
          Na de verkiezingen begint de verkenningsfase, waarin wordt onderzocht welke
          coalities mogelijk zijn. Daarna volgen informatie (inhoudelijke
          onderhandelingen) en formatie (afronding coalitieakkoord). CivicStat toont
          per fase welke partijen deelnemen en hoe goed zij in het verleden op
          dezelfde lijn stemden.
        </p>
      </div>
    </div>
  );
}
