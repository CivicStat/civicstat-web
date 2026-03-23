"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  BedgenotenPair,
  CoalitieScheur,
  StijgerDaler,
  StilleConsensusMotion,
} from "../../../../lib/types";
import { formatDate } from "../../../../lib/utils";
import PartyBadge from "../../../../components/PartyBadge";
import { routes } from "../../../../lib/routes";

const TABS = [
  { id: "bedgenoten", label: "Onverwachte bondgenoten" },
  { id: "scheuren", label: "Coalitiescheuren" },
  { id: "beweging", label: "Stijgers & dalers" },
  { id: "consensus", label: "Stille consensus" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  bedgenoten: BedgenotenPair[];
  scheuren: CoalitieScheur[];
  beweging: StijgerDaler[];
  consensus: StilleConsensusMotion[];
}

export default function InsightTabs({
  bedgenoten,
  scheuren,
  beweging,
  consensus,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("bedgenoten");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 mb-6 -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-moss text-white"
                : "bg-surface border border-border text-text-secondary hover:bg-surface-sub"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === "bedgenoten" && (
        <BedgenotenPanel items={bedgenoten} />
      )}
      {activeTab === "scheuren" && (
        <ScheurenPanel items={scheuren} />
      )}
      {activeTab === "beweging" && (
        <BewegingPanel items={beweging} />
      )}
      {activeTab === "consensus" && (
        <ConsensusPanel items={consensus} />
      )}
    </div>
  );
}

// ─── 1. Onverwachte Bondgenoten ────────────────────────────

function BedgenotenPanel({ items }: { items: BedgenotenPair[] }) {
  if (items.length === 0)
    return <EmptyState text="Nog geen onverwachte bondgenoten gevonden." />;

  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Partijen die ideologisch ver uit elkaar staan, maar verrassend vaak
        hetzelfde stemmen. Gebaseerd op de 500 meest recente stemmingen.
      </p>
      <div className="space-y-2.5">
        {items.map((pair) => {
          const key = `${pair.partyA}-${pair.partyB}`;
          return (
            <article key={key} className="card px-5 py-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                  <PartyBadge abbreviation={pair.partyA} size="sm" />
                  <span className="text-[11px] text-text-tertiary">&</span>
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

              {/* Agreement bar */}
              <div className="flex h-1.5 rounded-full overflow-hidden bg-ink/5 mb-2">
                <div
                  className="bg-ink/25 rounded-full"
                  style={{ width: `${pair.agreementPct}%` }}
                />
              </div>

              <p className="text-[12px] text-text-secondary">
                {pair.note}
              </p>

              {pair.exampleMotion && (
                <Link
                  href={routes.tk.motie(pair.exampleMotion.id)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-moss hover:underline"
                >
                  Voorbeeld: {pair.exampleMotion.title.slice(0, 60)}
                  {pair.exampleMotion.title.length > 60 ? "…" : ""} →
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ─── 2. Coalitiescheuren ───────────────────────────────────

function ScheurenPanel({ items }: { items: CoalitieScheur[] }) {
  if (items.length === 0)
    return <EmptyState text="Geen coalitiescheuren gevonden in recente stemmingen." />;

  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Moties waarbij coalitiepartijen niet op één lijn stemden —
        een teken van interne onenigheid.
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

            {/* Voting breakdown */}
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

// ─── 3. Stijgers & Dalers ──────────────────────────────────

function BewegingPanel({ items }: { items: StijgerDaler[] }) {
  if (items.length === 0)
    return <EmptyState text="Geen scorewijzigingen gevonden." />;

  const stijgers = items.filter((i) => i.delta > 0);
  const dalers = items.filter((i) => i.delta < 0);
  const stabiel = items.filter((i) => i.delta === 0);

  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Verandering in belofteconsistentie (MCS) tussen TK2023 en TK2025.
        Hogere score = consistenter stemgedrag met verkiezingsbeloften.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Stijgers */}
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
                        {item.mcs2023} → {item.mcs2025}
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

        {/* Dalers */}
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
                        {item.mcs2023} → {item.mcs2025}
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

      {/* Stabiel */}
      {stabiel.length > 0 && (
        <div className="mt-4">
          <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Stabiel
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {stabiel.map((item) => (
              <Link
                key={item.partyId}
                href={routes.tk.partij(item.abbreviation)}
                className="inline-flex items-center gap-1 rounded-full bg-surface-sub border border-border px-2.5 py-1 text-[11px] text-text-secondary hover:border-moss/40 transition-colors"
              >
                {item.abbreviation}
                <span className="text-text-tertiary">({item.mcs2025})</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 4. Stille Consensus ───────────────────────────────────

function ConsensusPanel({ items }: { items: StilleConsensusMotion[] }) {
  if (items.length === 0)
    return <EmptyState text="Geen unanieme moties gevonden." />;

  return (
    <div>
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed max-w-[700px]">
        Moties waar bijna alle partijen hetzelfde stemden — onderwerpen
        waarover de Kamer het eens is, vaak buiten het publieke debat.
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
                  {formatDate(item.date)} · {item.result === "Aangenomen" ? "Aangenomen" : "Verworpen"}
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

            {/* Unanimity bar */}
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="card px-6 py-10 text-center">
      <p className="text-[13px] text-text-tertiary">{text}</p>
    </div>
  );
}
