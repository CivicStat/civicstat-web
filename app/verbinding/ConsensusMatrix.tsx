"use client";

import { useState } from "react";

interface Props {
  parties: string[];
  matrix: Record<string, Record<string, number>>;
}

function cellColor(pct: number, isDiagonal: boolean): string {
  if (isDiagonal) return "bg-surface-sub";
  if (pct >= 80) return "bg-moss/30 dark:bg-moss/25";
  if (pct >= 65) return "bg-moss/18 dark:bg-moss/15";
  if (pct >= 50) return "bg-moss/10 dark:bg-moss/8";
  if (pct >= 35) return "bg-surface-sub/80";
  return "bg-ink/5 dark:bg-ink/8";
}

export default function ConsensusMatrix({ parties, matrix }: Props) {
  const [hovered, setHovered] = useState<{ row: string; col: string } | null>(null);

  // Show max 12 parties for readability
  const shown = parties.slice(0, 12);

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

                return (
                  <td
                    key={col}
                    className={`relative p-0.5`}
                    onMouseEnter={() => setHovered({ row, col })}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div
                      className={`flex items-center justify-center rounded-[4px] h-[32px] min-w-[32px] text-[10px] font-mono transition-all ${cellColor(
                        pct,
                        isDiag
                      )} ${
                        isHovered && !isDiag
                          ? "ring-2 ring-moss/40 scale-110 z-10"
                          : ""
                      } ${isDiag ? "text-text-tertiary" : "text-ink"}`}
                    >
                      {isDiag ? "—" : `${pct}`}
                    </div>

                    {/* Tooltip */}
                    {isHovered && !isDiag && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-surface border border-border shadow-md z-50 whitespace-nowrap pointer-events-none">
                        <div className="text-[11px] font-semibold text-ink">
                          {row} &amp; {col}
                        </div>
                        <div className="text-[10px] text-text-secondary">
                          {pct}% stemoverlap
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
    </div>
  );
}
