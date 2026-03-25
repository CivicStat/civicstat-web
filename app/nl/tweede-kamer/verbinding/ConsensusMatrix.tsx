"use client";

import { useState } from "react";

interface Props {
  parties: string[];
  matrix: Record<string, Record<string, number>>;
}

function cellColor(pct: number, isDiagonal: boolean): string {
  if (isDiagonal) return "bg-surface-sub";
  if (pct < 0) return "bg-surface-sub/40";
  if (pct >= 80) return "bg-moss/30 dark:bg-moss/25";
  if (pct >= 65) return "bg-moss/18 dark:bg-moss/15";
  if (pct >= 50) return "bg-moss/10 dark:bg-moss/8";
  if (pct >= 35) return "bg-surface-sub/80";
  return "bg-ink/5 dark:bg-ink/8";
}

export default function ConsensusMatrix({ parties, matrix }: Props) {
  const [hovered, setHovered] = useState<{ row: string; col: string } | null>(null);
  const [selected, setSelected] = useState<{ row: string; col: string } | null>(null);

  // Show all parties
  const shown = parties;

  function handleCellClick(row: string, col: string) {
    if (row === col) return;
    const val = matrix[row]?.[col] ?? 0;
    if (val < 0) return; // insufficient data — not clickable
    // Toggle selection
    if (selected?.row === row && selected?.col === col) {
      setSelected(null);
    } else {
      setSelected({ row, col });
    }
  }

  const selectedPct = selected ? (matrix[selected.row]?.[selected.col] ?? 0) : 0;
  const disagreePct = selected ? Math.max(0, 100 - selectedPct) : 0;

  return (
    <div className="relative">
      {/* Scroll hint gradient — right edge (mobile only) */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent pointer-events-none z-10 sm:hidden" />
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-[600px]">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-[80px]" />
            {shown.map((p) => (
              <th
                key={p}
                className="text-[10px] font-semibold text-text-tertiary pb-2 px-0.5"
                style={{ writingMode: "vertical-rl", height: 70 }}
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row) => (
            <tr key={row}>
              <td className="text-[11px] font-medium text-ink pr-2 py-0 text-right whitespace-nowrap">
                {row}
              </td>
              {shown.map((col) => {
                const pct = matrix[row]?.[col] ?? 0;
                const isDiag = row === col;
                const isHovered =
                  hovered?.row === row && hovered?.col === col;
                const isSelected =
                  selected?.row === row && selected?.col === col;

                return (
                  <td
                    key={col}
                    className={`relative p-0.5`}
                    onMouseEnter={() => setHovered({ row, col })}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleCellClick(row, col)}
                  >
                    <div
                      className={`flex items-center justify-center rounded-[4px] h-[32px] min-w-[32px] text-[10px] font-mono transition-all ${cellColor(
                        pct,
                        isDiag
                      )} ${
                        isSelected
                          ? "ring-2 ring-moss scale-110 z-20"
                          : isHovered && !isDiag
                            ? "ring-2 ring-moss/40 scale-110 z-10"
                            : ""
                      } ${isDiag ? "text-text-tertiary" : pct < 0 ? "text-text-tertiary" : "text-ink cursor-pointer"}`}
                    >
                      {isDiag ? "—" : pct < 0 ? "–" : `${pct}`}
                    </div>

                    {/* Tooltip */}
                    {isHovered && !isDiag && !isSelected && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-surface border border-border shadow-md z-50 whitespace-nowrap pointer-events-none">
                        <div className="text-[11px] font-semibold text-ink">
                          {row} &amp; {col}
                        </div>
                        <div className="text-[10px] text-text-secondary">
                          {pct < 0 ? "onvoldoende data" : `${pct}% stemoverlap`}
                        </div>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      </div>
      <p className="text-[11px] text-text-tertiary mt-2 text-center sm:hidden">
        ← Scroll voor alle partijen →
      </p>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 justify-center flex-wrap">
        <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">Stemoverlap:</span>
        {[
          { label: "80%+", cls: "bg-moss/30" },
          { label: "65-80%", cls: "bg-moss/18" },
          { label: "50-65%", cls: "bg-moss/10" },
          { label: "35-50%", cls: "bg-surface-sub/80" },
          { label: "<35%", cls: "bg-ink/5" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-[3px] ${l.cls}`} />
            <span className="text-[10px] text-text-tertiary">{l.label}</span>
          </div>
        ))}
      </div>

      {/* ─── Selected cell detail panel ────────────────────────── */}
      {selected && (
        <div className="mt-5 p-5 rounded-xl border border-moss/30 bg-surface">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-[15px] font-serif text-ink">{selected.row}</span>
              <span className="text-text-tertiary text-[13px]">&amp;</span>
              <span className="text-[15px] font-serif text-ink">{selected.col}</span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-text-tertiary hover:text-ink transition-colors p-1"
              aria-label="Sluiten"
            >
              <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[11px] text-text-tertiary mb-1">Stemmen hetzelfde</div>
              <div className="text-[28px] font-serif text-ink leading-none">{selectedPct}%</div>
            </div>
            <div>
              <div className="text-[11px] text-text-tertiary mb-1">Stemmen anders</div>
              <div className="text-[28px] font-serif text-text-secondary leading-none">{disagreePct}%</div>
            </div>
          </div>

          {/* Visual bar */}
          <div className="flex h-3 rounded-full overflow-hidden gap-px">
            <div
              className="bg-moss/30 dark:bg-moss/25 transition-all"
              style={{ width: `${selectedPct}%` }}
            />
            <div
              className="bg-ink/10 dark:bg-ink/15 transition-all"
              style={{ width: `${disagreePct}%` }}
            />
          </div>

          <p className="text-[12px] text-text-tertiary mt-3">
            Van alle stemmingen waar zowel {selected.row} als {selected.col} deelnam,
            stemden zij in {selectedPct}% van de gevallen hetzelfde (beiden voor of beiden tegen).
          </p>
        </div>
      )}
    </div>
  );
}
