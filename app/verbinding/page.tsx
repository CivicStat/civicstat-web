import type { Metadata } from "next";
import Link from "next/link";
import PartyBadge from "../../components/PartyBadge";
import ConsensusMatrix from "./ConsensusMatrix";

export const metadata: Metadata = {
  title: "Verbinding — CivicStat",
  description: "Welke partijen stemmen het vaakst hetzelfde? Ontdek consensus en verdeeldheid in de Tweede Kamer.",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://civicstat-api.fly.dev";

// The main parties we track (with seats for TK2023)
const TRACKED_PARTIES = [
  "PVV", "GL-PvdA", "VVD", "NSC", "BBB", "D66", "CDA", "SP", "PvdD", "CU",
  "SGP", "DENK", "Volt", "JA21", "FVD", "50PLUS",
];

// Abbreviation mapping from TK API names to our tracked names
const ABBR_MAP: Record<string, string> = {
  "GroenLinks-PvdA": "GL-PvdA",
  "ChristenUnie": "CU",
};

function normalizePartyName(name: string): string {
  return ABBR_MAP[name] || name;
}

interface RawVote {
  id: string;
  result: string;
  rawData: {
    Stemming?: Array<{
      ActorNaam: string;
      Soort: string;
    }>;
  };
}

interface PartyPair {
  a: string;
  b: string;
  agree: number;
  disagree: number;
  total: number;
  pct: number;
}

async function fetchVotesForConsensus(): Promise<RawVote[]> {
  // Fetch recent votes in batches
  const allVotes: RawVote[] = [];
  const batchSize = 100;

  for (let offset = 0; offset < 1000; offset += batchSize) {
    try {
      const res = await fetch(
        `${API_URL}/votes?limit=${batchSize}&offset=${offset}`,
        { next: { revalidate: 3600 } } // cache 1 hour
      );
      if (!res.ok) break;
      const data = await res.json();
      const items = data.items || [];
      allVotes.push(...items);
      if (items.length < batchSize) break;
    } catch {
      break;
    }
  }

  return allVotes;
}

function computeConsensusMatrix(votes: RawVote[]): {
  pairs: PartyPair[];
  parties: string[];
  matrix: Record<string, Record<string, number>>;
} {
  // Count agreement between every pair of parties
  const pairCounts: Record<string, { agree: number; total: number }> = {};

  const partySet = new Set<string>();

  for (const vote of votes) {
    const stemmingen = vote.rawData?.Stemming;
    if (!stemmingen || stemmingen.length === 0) continue;

    // Build a map: party -> vote direction
    const partyVotes: Record<string, string> = {};
    for (const s of stemmingen) {
      const name = normalizePartyName(s.ActorNaam);
      if (TRACKED_PARTIES.includes(name)) {
        partyVotes[name] = s.Soort; // "Voor", "Tegen", "Niet deelgenomen"
        partySet.add(name);
      }
    }

    // Compare every pair
    const votingParties = Object.keys(partyVotes);
    for (let i = 0; i < votingParties.length; i++) {
      for (let j = i + 1; j < votingParties.length; j++) {
        const a = votingParties[i];
        const b = votingParties[j];
        const key = [a, b].sort().join("|");

        if (!pairCounts[key]) pairCounts[key] = { agree: 0, total: 0 };
        pairCounts[key].total++;

        if (partyVotes[a] === partyVotes[b]) {
          pairCounts[key].agree++;
        }
      }
    }
  }

  // Sort parties by seat count (approximate)
  const seatOrder = TRACKED_PARTIES;
  const parties = seatOrder.filter((p) => partySet.has(p));

  // Build matrix
  const matrix: Record<string, Record<string, number>> = {};
  for (const a of parties) {
    matrix[a] = {};
    for (const b of parties) {
      if (a === b) {
        matrix[a][b] = 100;
      } else {
        const key = [a, b].sort().join("|");
        const pc = pairCounts[key];
        matrix[a][b] = pc && pc.total > 0 ? Math.round((pc.agree / pc.total) * 100) : 0;
      }
    }
  }

  // Build sorted pairs for ranking
  const pairs: PartyPair[] = [];
  for (const [key, val] of Object.entries(pairCounts)) {
    if (val.total < 10) continue; // Need minimum sample
    const [a, b] = key.split("|");
    pairs.push({
      a,
      b,
      agree: val.agree,
      disagree: val.total - val.agree,
      total: val.total,
      pct: Math.round((val.agree / val.total) * 100),
    });
  }

  pairs.sort((x, y) => y.pct - x.pct);

  return { pairs, parties, matrix };
}

export default async function VerbindingPage() {
  const votes = await fetchVotesForConsensus();
  const { pairs, parties, matrix } = computeConsensusMatrix(votes);

  const topAgreement = pairs.slice(0, 10);
  const topDisagreement = [...pairs].sort((a, b) => a.pct - b.pct).slice(0, 10);

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[26px] font-normal text-ink mb-2">
          Verbinding &amp; consensus
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-[68ch]">
          Hoe vaak stemmen partijen hetzelfde? Deze analyse vergelijkt het
          stemgedrag van alle fracties over {votes.length.toLocaleString("nl-NL")} recente
          stemmingen in de Tweede Kamer.
        </p>
      </div>

      {/* ─── Consensus matrix ─────────────────────────────────── */}
      <section className="card p-5 mb-6 overflow-x-auto">
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
      <div className="flex items-center gap-1.5 w-[120px] shrink-0">
        <span className="text-[12px] font-medium text-ink">{pair.a}</span>
        <span className="text-[10px] text-text-tertiary">&amp;</span>
        <span className="text-[12px] font-medium text-ink">{pair.b}</span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-[6px] rounded-full bg-surface-sub overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${pair.pct}%` }}
          />
        </div>
        <span className="text-[12px] font-semibold text-ink w-[36px] text-right">
          {pair.pct}%
        </span>
      </div>
    </div>
  );
}
