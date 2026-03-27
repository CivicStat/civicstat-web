import type { Metadata } from "next";
import PartyBadge from "../../components/PartyBadge";
import ConsensusMatrix from "./ConsensusMatrix";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verbinding — CivicStat",
  description: "Welke partijen stemmen het vaakst hetzelfde? Ontdek consensus en verdeeldheid in de Tweede Kamer.",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://civicstat-api.fly.dev";

interface PartyPair {
  a: string;
  b: string;
  agree: number;
  total: number;
  pct: number;
}

async function fetchConsensus() {
  try {
    const res = await fetch(`${API_URL}/votes/consensus`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<{
      parties: string[];
      matrix: Record<string, Record<string, number>>;
      topAgreement: PartyPair[];
      topDisagreement: PartyPair[];
      totalVotes: number;
    }>;
  } catch {
    return null;
  }
}

export default async function VerbindingPage() {
  const data = await fetchConsensus();

  if (!data) {
    return (
      <main className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <div className="mb-8">
          <h1 className="font-serif text-[26px] font-normal text-ink mb-2">
            Verbinding &amp; consensus
          </h1>
          <p className="text-sm text-text-secondary">
            Consensusdata is momenteel niet beschikbaar. Probeer het later opnieuw.
          </p>
        </div>
      </main>
    );
  }

  const { parties, matrix, topAgreement, topDisagreement, totalVotes } = data;

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[26px] font-normal text-ink mb-2">
          Verbinding &amp; consensus
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-[68ch]">
          Hoe vaak stemmen partijen hetzelfde? Deze analyse vergelijkt het
          stemgedrag van alle fracties over {totalVotes.toLocaleString("nl-NL")} recente
          stemmingen in de Tweede Kamer.
        </p>
      </div>

      {/* ─── Consensus matrix ─────────────────────────────────── */}
      <section className="card p-5 mb-6">
        <h2 className="font-serif text-[20px] font-normal text-ink mb-1">
          Stemoverlap
        </h2>
        <p className="text-[12px] text-text-tertiary mb-4">
          Percentage stemmingen waarin twee partijen hetzelfde stemmen.
          Donkerder = vaker eens.
        </p>
        <ConsensusMatrix parties={parties} matrix={matrix} />
      </section>

      {/* ─── Top agreement & disagreement ─────────────────────── */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {/* Most aligned */}
        <section className="card p-5">
          <h2 className="font-serif text-[18px] font-normal text-ink mb-1">
            Meest eens
          </h2>
          <p className="text-[12px] text-text-tertiary mb-3">
            Partijparen die het vaakst hetzelfde stemmen.
          </p>
          <div className="space-y-2">
            {topAgreement.map((pair, i) => (
              <PairRow key={`${pair.a}-${pair.b}`} pair={pair} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* Most opposed */}
        <section className="card p-5">
          <h2 className="font-serif text-[18px] font-normal text-ink mb-1">
            Meest verdeeld
          </h2>
          <p className="text-[12px] text-text-tertiary mb-3">
            Partijparen die het vaakst tegenovergesteld stemmen.
          </p>
          <div className="space-y-2">
            {topDisagreement.map((pair, i) => (
              <PairRow key={`${pair.a}-${pair.b}`} pair={pair} rank={i + 1} invert />
            ))}
          </div>
        </section>
      </div>

      {/* ─── Methodology note ──────────────────────────────────── */}
      <div className="card px-5 py-4">
        <h3 className="text-[13px] font-semibold text-ink mb-1">
          Over deze analyse
        </h3>
        <p className="text-[12px] text-text-secondary leading-relaxed max-w-[68ch]">
          De stemoverlap wordt berekend op basis van de partijniveau-stemmingen
          zoals geregistreerd door de Tweede Kamer. Twee partijen zijn het
          &ldquo;eens&rdquo; als ze beiden &lsquo;voor&rsquo; of beiden &lsquo;tegen&rsquo;
          stemmen. Afwezigheid (&ldquo;niet deelgenomen&rdquo;) wordt als apart
          standpunt behandeld. Paren met minder dan 10 gemeenschappelijke
          stemmingen worden uitgesloten.
        </p>
      </div>
    </main>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function PairRow({
  pair,
  rank,
  invert = false,
}: {
  pair: PartyPair;
  rank: number;
  invert?: boolean;
}) {
  const displayPct = invert ? 100 - pair.pct : pair.pct;
  const barColor = invert
    ? "bg-ink/20 dark:bg-ink/15"
    : "bg-moss/20 dark:bg-moss/15";

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-[11px] text-text-tertiary w-4 text-right font-mono">
        {rank}
      </span>
      <div className="flex items-center gap-1.5 min-w-fit shrink-0">
        <PartyBadge abbreviation={pair.a} size="sm" />
        <span className="text-[10px] text-text-tertiary">&amp;</span>
        <PartyBadge abbreviation={pair.b} size="sm" />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-[6px] rounded-full bg-surface-sub overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${displayPct}%` }}
          />
        </div>
        <span className="text-[12px] font-semibold text-ink w-[36px] text-right">
          {displayPct}%
        </span>
      </div>
    </div>
  );
}
