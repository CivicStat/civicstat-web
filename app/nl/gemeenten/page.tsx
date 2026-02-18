import { getParliaments } from "../../../lib/api";
import { gemeente } from "../../../lib/routes";
import type { ParliamentListItem } from "../../../lib/types";
import GemeentenSearch from "./GemeentenSearch";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gemeenteraden — CivicStat",
  description: "Overzicht van alle beschikbare gemeenteraden op CivicStat.",
};

export default async function GemeentenPage() {
  let parliaments: ParliamentListItem[] = [];
  try {
    parliaments = await getParliaments();
  } catch {
    // API not yet deployed with /parliaments endpoint
  }
  const municipalities = parliaments
    .filter((p) => p.level === "MUNICIPAL")
    .sort((a, b) => a.shortName.localeCompare(b.shortName, "nl"));

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-20">
      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
          Nederland
        </p>
        <h1 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink leading-[1.2] tracking-tight">
          Gemeenteraden
        </h1>
        <p className="text-[15px] text-text-secondary mt-2 max-w-[540px] leading-relaxed">
          Moties, stemgedrag en raadsleden per gemeente — traceerbaar en zonder
          politieke duiding.
        </p>
      </div>

      {municipalities.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-secondary">
            Er zijn nog geen gemeenteraden beschikbaar. Binnenkort voegen we de
            eerste gemeenten toe.
          </p>
        </div>
      ) : (
        <GemeentenSearch
          municipalities={municipalities.map((m) => ({
            id: m.id,
            slug: m.slug,
            name: m.shortName,
            seats: m.seats,
            motions: m._count.motions,
            parties: m._count.parties,
            mps: m._count.mps,
            active: m._count.motions > 0,
            href: gemeente(m.slug).root,
          }))}
        />
      )}
    </div>
  );
}
