import Link from "next/link";
import { getCoalitionComparison } from "../../../../lib/api";
import type { CoalitionComparisonItem } from "../../../../lib/types";
import { getPartyColor } from "../../../../lib/utils";
import { routes } from "../../../../lib/routes";

export const revalidate = 3600;

export const metadata = {
  title: "Coalities vergelijken",
  description: "Vergelijk de coalitiediscipline en stemgedrag van Nederlandse kabinetten.",
};

export default async function CoalitiesPage() {
  let coalitions: CoalitionComparisonItem[];
  try {
    coalitions = await getCoalitionComparison();
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-[26px] text-ink mb-2">Coalities vergelijken</h1>
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
          Coalities vergelijken
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-[600px]">
          Hoe gedisciplineerd stemmen coalitiepartijen? De Coalition Alignment Index (CAI)
          meet het percentage stemmingen waarin een partij met de coalitiemeerderheid meestemt.
        </p>
      </div>

      {coalitions.length === 0 ? (
        <div className="card p-6 text-sm text-text-secondary">
          Geen coalitiedata beschikbaar.
        </div>
      ) : (
        <div className="space-y-8">
          {coalitions.map((item) => (
            <CoalitionCard key={item.coalition.slug} data={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function CoalitionCard({ data }: { data: CoalitionComparisonItem }) {
  const { coalition, classification, alignment } = data;

  const memberParties = alignment.parties.filter((p) => p.isCoalitionMember);
  const oppositionParties = alignment.parties
    .filter((p) => !p.isCoalitionMember)
    .sort((a, b) => b.cai - a.cai)
    .slice(0, 8);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle bg-surface-sub/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <Link href={routes.tk.coalitie(coalition.slug)} className="hover:underline">
              <h2 className="font-serif text-xl text-ink">{coalition.name}</h2>
            </Link>
            <p className="text-[12px] text-text-tertiary mt-0.5">
              {coalition.parties.join(", ")}
              {coalition.active ? (
                <span className="ml-2 text-[10px] px-1.5 py-px rounded-full border border-border text-text-tertiary">actief</span>
              ) : (
                <span className="ml-2 text-[10px] px-1.5 py-px rounded-full border border-border text-text-tertiary">afgelopen</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-serif text-ink tabular-nums">
              {Math.round(alignment.avgMemberCAI)}
            </div>
            <div className="text-[10px] text-text-tertiary uppercase tracking-wider">
              Gem. CAI
            </div>
          </div>
        </div>
      </div>

      {/* Vote classification overview */}
      <div className="px-6 py-4 border-b border-border-subtle">
        <div className="section-label mb-2">Stemgedrag classificatie</div>
        <div className="flex h-5 rounded-md overflow-hidden gap-px mb-2">
          {classification.coalitionPct > 0 && (
            <div
              className="bg-ink/20"
              style={{ width: `${classification.coalitionPct}%` }}
              title={`Coalitiestemming: ${classification.coalitionPct.toFixed(1)}%`}
            />
          )}
          {classification.freePct > 0 && (
            <div
              className="bg-ink/8"
              style={{ width: `${classification.freePct}%` }}
              title={`Vrije stemming: ${classification.freePct.toFixed(1)}%`}
            />
          )}
        </div>
        <div className="flex gap-4 text-[11px] text-text-secondary">
          <span>
            <span className="inline-block w-2 h-2 rounded-sm bg-ink/20 mr-1 align-middle" />
            Coalitie: {classification.coalitionPct.toFixed(0)}% ({classification.coalitionVotes})
          </span>
          <span>
            <span className="inline-block w-2 h-2 rounded-sm bg-ink/8 mr-1 align-middle" />
            Vrij: {classification.freePct.toFixed(0)}% ({classification.freeVotes})
          </span>
          <span className="text-text-tertiary">
            Totaal: {classification.totalVotes} stemmingen
          </span>
        </div>
      </div>

      {/* CAI per party */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
        {/* Coalition parties */}
        <div className="p-6">
          <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3">
            Coalitiepartijen
          </h3>
          <div className="space-y-2">
            {memberParties.map((p) => (
              <PartyCAIRow key={p.abbreviation} party={p} />
            ))}
          </div>
        </div>

        {/* Top opposition */}
        <div className="p-6">
          <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3">
            Oppositie (top 8 CAI)
          </h3>
          <div className="space-y-2">
            {oppositionParties.map((p) => (
              <PartyCAIRow key={p.abbreviation} party={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PartyCAIRow({
  party,
}: {
  party: { abbreviation: string; cai: number; totalVotesAnalyzed: number };
}) {
  const color = getPartyColor(party.abbreviation);
  return (
    <Link
      href={routes.tk.partij(party.abbreviation)}
      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-surface-sub/60 transition-colors group"
    >
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
          style={{ backgroundColor: color, opacity: 0.8 }}
        />
        <span className="text-sm font-medium text-ink group-hover:text-moss transition-colors">
          {party.abbreviation}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-[80px]">
          <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-sub">
            <div
              className="bg-ink/25 rounded-full"
              style={{ width: `${party.cai}%` }}
            />
          </div>
        </div>
        <span className="text-[15px] font-serif tabular-nums text-ink w-[32px] text-right">
          {Math.round(party.cai)}
        </span>
        <span className="text-[10px] text-text-tertiary tabular-nums w-[50px] text-right">
          {party.totalVotesAnalyzed} st.
        </span>
      </div>
    </Link>
  );
}
