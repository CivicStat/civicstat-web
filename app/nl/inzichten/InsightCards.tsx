"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  InsightsResponse,
  BedgenotenPair,
  CoalitieScheur,
  StijgerDaler,
  StilleConsensusMotion,
  Beloftehouder,
  Themakloof,
  Rebel,
  Verwatering,
  Paradox,
} from "../../../lib/types";
import { formatDate } from "../../../lib/utils";
import PartyBadge from "../../../components/PartyBadge";
import { routes } from "../../../lib/routes";

interface InsightType {
  id: string;
  label: string;
  subtitle: string;
  headline: (data: InsightsResponse) => string;
  count: (data: InsightsResponse) => number;
}

const INSIGHT_TYPES: InsightType[] = [
  {
    id: "beloftehouders",
    label: "Beloftehouders",
    subtitle: "Wie houdt zich aan de beloften?",
    headline: (d) => {
      const top = d.beloftehouders?.[0];
      return top ? `${top.abbreviation}: ${top.mcs}% MCS — meest betrouwbaar` : "Geen data";
    },
    count: (d) => d.beloftehouders?.length ?? 0,
  },
  {
    id: "paradox",
    label: "Stemparadoxen",
    subtitle: "Stemmen tegen eigen beloften",
    headline: (d) => {
      const top = d.paradox?.[0];
      return top ? `${top.abbreviation} stemt tegen eigen ${top.theme.toLowerCase()}-beloften` : "Geen data";
    },
    count: (d) => d.paradox?.length ?? 0,
  },
  {
    id: "themakloof",
    label: "Themakloof",
    subtitle: "Coalitie-zwaktes per thema",
    headline: (d) => {
      const top = d.themakloof?.[0];
      return top ? `${top.theme}: slechts ${top.avgMcs}% coalitiescore` : "Geen data";
    },
    count: (d) => d.themakloof?.length ?? 0,
  },
  {
    id: "verwatering",
    label: "Coalitieverwatering",
    subtitle: "Beloften ingeleverd bij formatie",
    headline: (d) => {
      const top = d.verwatering?.[0];
      return top ? `${top.abbreviation}: ${top.dilutionRate}% van beloften ingeleverd` : "Geen data";
    },
    count: (d) => d.verwatering?.length ?? 0,
  },
  {
    id: "rebellen",
    label: "Rebellen",
    subtitle: "Kamerleden die tegen eigen fractie stemmen",
    headline: (d) => {
      const top = d.rebellen?.[0];
      return top ? `${top.surname} (${top.abbreviation}): ${top.deviations}x afwijkend` : "Geen data";
    },
    count: (d) => d.rebellen?.length ?? 0,
  },
  {
    id: "scheuren",
    label: "Coalitiescheuren",
    subtitle: "Coalitie niet op een lijn",
    headline: (d) => {
      const top = d.scheuren?.[0];
      return top
        ? `${top.dissenters.map((p) => p.abbreviation).join(", ")} week af bij ${top.coalitionName}`
        : "Geen data";
    },
    count: (d) => d.scheuren?.length ?? 0,
  },
  {
    id: "bedgenoten",
    label: "Onverwachte bondgenoten",
    subtitle: "Partijen die verrassend vaak hetzelfde stemmen",
    headline: (d) => {
      const top = d.bedgenoten?.[0];
      return top ? `${top.partyA} & ${top.partyB}: ${top.agreementPct}% overeenstemming` : "Geen data";
    },
    count: (d) => d.bedgenoten?.length ?? 0,
  },
  {
    id: "beweging",
    label: "Stijgers & dalers",
    subtitle: "MCS-verandering over verkiezingsjaren",
    headline: (d) => {
      const top = d.beweging?.filter((i) => i.delta !== 0)?.[0];
      return top
        ? `${top.abbreviation}: ${top.delta > 0 ? "+" : ""}${top.delta} punten`
        : "Geen data";
    },
    count: (d) => d.beweging?.length ?? 0,
  },
  {
    id: "consensus",
    label: "Stille consensus",
    subtitle: "Moties waar bijna iedereen het eens was",
    headline: (d) => {
      const top = d.consensus?.[0];
      return top ? `${top.unanimousPct}% eens over: ${top.title.slice(0, 40)}...` : "Geen data";
    },
    count: (d) => d.consensus?.length ?? 0,
  },
];

type InsightId = string;

export default function InsightCards({ data }: { data: InsightsResponse }) {
  const [expanded, setExpanded] = useState<InsightId | null>(null);

  return (
    <div>
      {/* Card grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {INSIGHT_TYPES.map((type) => {
          const count = type.count(data);
          const isActive = expanded === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setExpanded(isActive ? null : type.id)}
              className={`card px-5 py-4 text-left transition-all ${
                isActive
                  ? "ring-2 ring-moss border-moss"
                  : "hover:border-moss/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-[14px] font-semibold text-ink">
                  {type.label}
                </h2>
                <span className="flex-shrink-0 text-[11px] text-text-tertiary bg-surface-sub rounded-full px-2 py-0.5">
                  {count}
                </span>
              </div>
              <p className="text-[12px] text-text-tertiary mb-2">
                {type.subtitle}
              </p>
              <p className="text-[13px] text-text-secondary leading-snug line-clamp-2">
                {type.headline(data)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-serif text-ink">
              {INSIGHT_TYPES.find((t) => t.id === expanded)?.label}
            </h2>
            <button
              onClick={() => setExpanded(null)}
              className="text-[12px] text-text-tertiary hover:text-ink transition-colors"
            >
              Sluiten
            </button>
          </div>
          {expanded === "beloftehouders" && <BeloftehoudersPanel items={data.beloftehouders ?? []} />}
          {expanded === "paradox" && <ParadoxPanel items={data.paradox ?? []} />}
          {expanded === "themakloof" && <ThemakloofPanel items={data.themakloof ?? []} />}
          {expanded === "verwatering" && <VerwateringPanel items={data.verwatering ?? []} />}
          {expanded === "rebellen" && <RebellenPanel items={data.rebellen ?? []} />}
          {expanded === "scheuren" && <ScheurenPanel items={data.scheuren ?? []} />}
          {expanded === "bedgenoten" && <BedgenotenPanel items={data.bedgenoten ?? []} />}
          {expanded === "beweging" && <BewegingPanel items={data.beweging ?? []} />}
          {expanded === "consensus" && <ConsensusPanel items={data.consensus ?? []} />}
        </div>
      )}
    </div>
  );
}

// ─── 1. Beloftehouders ─────────────────────────────────────

function BeloftehoudersPanel({ items }: { items: Beloftehouder[] }) {
  if (items.length === 0) return <Empty />;
  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Partijen gerangschikt op belofteconsistentie (MCS). Hogere score =
        vaker stemmen in lijn met verkiezingsbeloften.
      </p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <Link
            key={item.partyId}
            href={routes.tk.partij(item.abbreviation)}
            className="card flex items-center gap-3 px-4 py-3 hover:border-moss/40 transition-colors"
          >
            <span className="text-[12px] text-text-tertiary w-6 text-right tabular-nums">
              #{item.rank}
            </span>
            <PartyBadge abbreviation={item.abbreviation} size="sm" />
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-semibold text-ink">
                {item.abbreviation}
              </span>
              <span className="text-[11px] text-text-tertiary ml-2">
                {item.scoredPromises} beloften
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 rounded-full bg-ink/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-ink/25"
                  style={{ width: `${item.mcs}%` }}
                />
              </div>
              <span className="text-[15px] font-serif text-ink tabular-nums w-10 text-right">
                {item.mcs}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── 2. Paradox ────────────────────────────────────────────

function ParadoxPanel({ items }: { items: Paradox[] }) {
  if (items.length === 0) return <Empty />;
  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Partijen die op specifieke thema&apos;s stelselmatig tegen hun eigen
        verkiezingsbeloften stemmen.
      </p>
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <article key={`${item.partyId}-${item.theme}-${idx}`} className="card px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <PartyBadge abbreviation={item.abbreviation} size="sm" />
              <div className="flex-1">
                <span className="text-[14px] font-medium text-ink">
                  {item.abbreviation}
                </span>
                <span className="ml-2 text-[11px] text-text-tertiary uppercase tracking-wider">
                  {item.theme}
                </span>
              </div>
              <span className="text-[22px] font-serif text-ink tabular-nums">
                {item.mcs}%
              </span>
            </div>
            <p className="text-[12px] text-text-secondary">{item.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Themakloof ─────────────────────────────────────────

function ThemakloofPanel({ items }: { items: Themakloof[] }) {
  if (items.length === 0) return <Empty />;
  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Thema&apos;s waar de coalitie het slechtst scoort op belofteconsistentie.
      </p>
      <div className="space-y-2.5">
        {items.map((item) => (
          <article key={item.theme} className="card px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[14px] font-medium text-ink capitalize">
                  {item.theme.toLowerCase()}
                </h3>
                <span className="text-[11px] text-text-tertiary">
                  {item.coalitionName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-serif text-ink tabular-nums">
                  {item.avgMcs}%
                </span>
                <div className="text-[10px] text-text-tertiary">gemiddeld</div>
              </div>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-ink/5 mb-3">
              <div
                className="bg-ink/25 rounded-full"
                style={{ width: `${item.avgMcs}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {item.parties.map((p) => (
                <span
                  key={p.abbreviation}
                  className="inline-flex items-center gap-1 rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] text-text-secondary"
                >
                  {p.abbreviation}
                  <span className="text-text-tertiary tabular-nums">{p.mcs}%</span>
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── 4. Verwatering ────────────────────────────────────────

function VerwateringPanel({ items }: { items: Verwatering[] }) {
  if (items.length === 0) return <Empty />;
  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Hoeveel procent van de verkiezingsbeloften is ingeleverd bij
        coalitievorming.
      </p>
      <div className="space-y-2.5">
        {items.map((item) => (
          <article key={item.partyId} className="card px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <PartyBadge abbreviation={item.abbreviation} size="sm" />
              <div className="flex-1">
                <span className="text-[14px] font-medium text-ink">
                  {item.abbreviation}
                </span>
                <span className="ml-2 text-[11px] text-text-tertiary">
                  {item.coalitionName}
                </span>
              </div>
              <span className="text-[22px] font-serif text-ink tabular-nums">
                {item.dilutionRate}%
              </span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-ink/5 mb-2">
              <div
                className="bg-ink/25 rounded-full"
                style={{ width: `${item.dilutionRate}%` }}
              />
            </div>
            <p className="text-[12px] text-text-secondary">
              {item.survivedCount} van {item.totalPromises} beloften overleefden
              het regeerakkoord.
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── 5. Rebellen ───────────────────────────────────────────

function RebellenPanel({ items }: { items: Rebel[] }) {
  if (items.length === 0) return <Empty />;
  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Kamerleden die het vaakst anders stemden dan hun eigen fractie.
      </p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <article key={item.mpId} className="card flex items-center gap-3 px-4 py-3">
            <PartyBadge abbreviation={item.abbreviation} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-semibold text-ink">
                  {item.surname}
                </span>
                <span className="text-[11px] text-text-tertiary">
                  {item.abbreviation}
                </span>
              </div>
              <span className="text-[11px] text-text-tertiary">
                {item.deviations}x afwijkend van {item.totalVotes} stemmingen
              </span>
            </div>
            <span className="text-[15px] font-serif text-ink tabular-nums">
              {item.deviationPct}%
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── 6. Scheuren (reused from TK) ─────────────────────────

function ScheurenPanel({ items }: { items: CoalitieScheur[] }) {
  if (items.length === 0) return <Empty />;
  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Moties waarbij coalitiepartijen niet op een lijn stemden.
      </p>
      <div className="space-y-2.5">
        {items.map((scheur, idx) => (
          <article key={`${scheur.motionId}-${idx}`} className="card px-5 py-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <Link
                  href={routes.tk.motie(scheur.motionId)}
                  className="text-[14px] font-medium text-ink hover:text-moss transition-colors line-clamp-2"
                >
                  {scheur.motionTitle}
                </Link>
                <div className="mt-1 text-[11px] text-text-tertiary">
                  {formatDate(scheur.date)} · {scheur.coalitionName}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <div>
                <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1">
                  Meerderheid
                </div>
                <div className="flex flex-wrap gap-1">
                  {scheur.loyalists.map((p) => (
                    <span
                      key={p.abbreviation}
                      className="inline-flex items-center gap-1 rounded-full bg-surface-sub border border-border px-2 py-0.5 text-[11px] text-text-secondary"
                    >
                      {p.abbreviation}
                      <span className="text-[9px] text-text-tertiary">
                        {p.vote === "FOR" ? "voor" : "tegen"}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1">
                  Afwijkend
                </div>
                <div className="flex flex-wrap gap-1">
                  {scheur.dissenters.map((p) => (
                    <span
                      key={p.abbreviation}
                      className="inline-flex items-center gap-1 rounded-full bg-ink/5 border border-ink/10 px-2 py-0.5 text-[11px] font-medium text-ink"
                    >
                      {p.abbreviation}
                      <span className="text-[9px] text-text-tertiary">
                        {p.vote === "FOR" ? "voor" : "tegen"}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-2 text-[12px] text-text-secondary">{scheur.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── 7. Bedgenoten (reused from TK) ───────────────────────

function BedgenotenPanel({ items }: { items: BedgenotenPair[] }) {
  if (items.length === 0) return <Empty />;
  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Partijen die ideologisch ver uit elkaar staan, maar verrassend vaak
        hetzelfde stemmen.
      </p>
      <div className="space-y-2.5">
        {items.map((pair) => (
          <article key={`${pair.partyA}-${pair.partyB}`} className="card px-5 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5">
                <PartyBadge abbreviation={pair.partyA} size="sm" />
                <span className="text-[11px] text-text-tertiary">&amp;</span>
                <PartyBadge abbreviation={pair.partyB} size="sm" />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[22px] font-serif text-ink leading-none">
                  {pair.agreementPct}%
                </span>
                <span className="text-[10px] text-text-tertiary">
                  overeenstemming
                </span>
              </div>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-ink/5 mb-2">
              <div
                className="bg-ink/25 rounded-full"
                style={{ width: `${pair.agreementPct}%` }}
              />
            </div>
            <p className="text-[12px] text-text-secondary">{pair.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── 8. Beweging (reused from TK) ─────────────────────────

function BewegingPanel({ items }: { items: StijgerDaler[] }) {
  if (items.length === 0) return <Empty />;
  const stijgers = items.filter((i) => i.delta > 0);
  const dalers = items.filter((i) => i.delta < 0);

  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Verandering in belofteconsistentie (MCS) tussen verkiezingsjaren.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {stijgers.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">
              Stijgers
            </h3>
            <div className="space-y-1.5">
              {stijgers.map((item) => (
                <Link
                  key={item.partyId}
                  href={routes.tk.partij(item.abbreviation)}
                  className="card flex items-center gap-3 px-4 py-3 hover:border-moss/40 transition-colors"
                >
                  <PartyBadge abbreviation={item.abbreviation} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-semibold text-ink">
                        {item.abbreviation}
                      </span>
                      <span className="text-[11px] text-text-tertiary tabular-nums">
                        {item.mcs2023} &rarr; {item.mcs2025}
                      </span>
                    </div>
                  </div>
                  <span className="text-[15px] font-serif text-ink tabular-nums">
                    +{item.delta}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {dalers.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">
              Dalers
            </h3>
            <div className="space-y-1.5">
              {dalers.map((item) => (
                <Link
                  key={item.partyId}
                  href={routes.tk.partij(item.abbreviation)}
                  className="card flex items-center gap-3 px-4 py-3 hover:border-moss/40 transition-colors"
                >
                  <PartyBadge abbreviation={item.abbreviation} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-semibold text-ink">
                        {item.abbreviation}
                      </span>
                      <span className="text-[11px] text-text-tertiary tabular-nums">
                        {item.mcs2023} &rarr; {item.mcs2025}
                      </span>
                    </div>
                  </div>
                  <span className="text-[15px] font-serif text-text-tertiary tabular-nums">
                    {item.delta}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 9. Consensus (reused from TK) ────────────────────────

function ConsensusPanel({ items }: { items: StilleConsensusMotion[] }) {
  if (items.length === 0) return <Empty />;
  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Moties waar bijna alle partijen hetzelfde stemden.
      </p>
      <div className="space-y-2.5">
        {items.map((item) => (
          <article key={item.motionId} className="card px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={routes.tk.motie(item.motionId)}
                  className="text-[14px] font-medium text-ink hover:text-moss transition-colors line-clamp-2"
                >
                  {item.title}
                </Link>
                <div className="mt-1 text-[11px] text-text-tertiary">
                  {formatDate(item.date)} ·{" "}
                  {item.result === "Aangenomen" ? "Aangenomen" : "Verworpen"}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-[22px] font-serif text-ink leading-none">
                  {item.unanimousPct}%
                </div>
                <div className="text-[10px] text-text-tertiary mt-0.5">
                  van {item.totalParties} partijen
                </div>
              </div>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden bg-ink/5 mt-3 mb-1.5">
              <div
                className="bg-ink/20 rounded-full"
                style={{ width: `${item.unanimousPct}%` }}
              />
            </div>
            <p className="text-[12px] text-text-secondary">{item.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── Shared ────────────────────────────────────────────────

function Empty() {
  return (
    <div className="card px-6 py-10 text-center">
      <p className="text-[13px] text-text-tertiary">
        Geen data beschikbaar voor dit inzichttype.
      </p>
    </div>
  );
}
