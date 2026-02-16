import { getMembers } from "../../lib/api";
import KamerledenFilters from "./KamerledenFilters";

export const revalidate = 3600; // ISR: re-generate at most every hour

export const metadata = { title: "Kamerleden — CivicStat" };

export default async function KamerledenPage() {
  let members;
  try {
    members = await getMembers();
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-[26px] text-ink mb-2">Kamerleden</h1>
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API.
        </div>
      </div>
    );
  }

  // Extract unique parties for the filter dropdown
  const parties = Array.from(
    new Map(members.map((m) => [m.party.abbreviation, { abbreviation: m.party.abbreviation, colorNeutral: m.party.colorNeutral ?? null }])).values()
  );

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Kamerleden
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">
        {members.length} actieve Tweede Kamerleden met partijlidmaatschap.
      </p>

      <KamerledenFilters members={members} parties={parties} />
    </div>
  );
}
