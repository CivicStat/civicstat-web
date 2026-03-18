"use client";

import { useState } from "react";
import type { McsSnapshot } from "../lib/api";

interface Props {
  snapshots: McsSnapshot[];
  abbreviation: string;
  coalitionEntryDate?: string; // ISO date for vertical marker
}

const MONTHS_NL = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

function formatMonth(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`;
}

export default function McsTrendChart({ snapshots, abbreviation, coalitionEntryDate }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!snapshots || snapshots.length === 0) return null;

  // Sort snapshots by month
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
  );

  // Group by election year for separate lines
  const years = [...new Set(sorted.map((s) => s.electionYear))].sort();
  const byYear = years.map((y) => sorted.filter((s) => s.electionYear === y));

  // Chart dimensions
  const W = 600;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 30, left: 40 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // X: time range across all snapshots
  const allTimes = sorted.map((s) => new Date(s.month).getTime());
  const minT = Math.min(...allTimes);
  const maxT = Math.max(...allTimes);
  const tRange = maxT - minT || 1;

  // Y: MCS 0-100
  const xOf = (t: number) => PAD.left + ((t - minT) / tRange) * plotW;
  const yOf = (mcs: number) => PAD.top + plotH - (mcs / 100) * plotH;

  // Grid lines at 25, 50, 75
  const gridY = [25, 50, 75];

  // Coalition entry marker
  let coalitionX: number | null = null;
  if (coalitionEntryDate) {
    const ct = new Date(coalitionEntryDate).getTime();
    if (ct >= minT && ct <= maxT) {
      coalitionX = xOf(ct);
    }
  }

  // Colors for different election years (monochrome per design)
  const lineOpacity = (i: number) => (i === years.length - 1 ? 0.8 : 0.3);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`MCS-trend voor ${abbreviation}`}
      >
        {/* Grid lines */}
        {gridY.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={yOf(v)}
              x2={W - PAD.right}
              y2={yOf(v)}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeDasharray="3,3"
            />
            <text
              x={PAD.left - 6}
              y={yOf(v) + 3}
              textAnchor="end"
              className="fill-current opacity-30"
              fontSize={10}
            >
              {v}
            </text>
          </g>
        ))}

        {/* Y-axis labels */}
        <text
          x={PAD.left - 6}
          y={yOf(0) + 3}
          textAnchor="end"
          className="fill-current opacity-30"
          fontSize={10}
        >
          0
        </text>
        <text
          x={PAD.left - 6}
          y={yOf(100) + 3}
          textAnchor="end"
          className="fill-current opacity-30"
          fontSize={10}
        >
          100
        </text>

        {/* Coalition entry marker */}
        {coalitionX !== null && (
          <g>
            <line
              x1={coalitionX}
              y1={PAD.top}
              x2={coalitionX}
              y2={H - PAD.bottom}
              stroke="currentColor"
              strokeOpacity={0.15}
              strokeDasharray="4,4"
              strokeWidth={1}
            />
            <text
              x={coalitionX + 4}
              y={PAD.top + 10}
              className="fill-current opacity-30"
              fontSize={9}
            >
              Coalitie
            </text>
          </g>
        )}

        {/* Lines per election year */}
        {byYear.map((yearSnapshots, yi) => {
          if (yearSnapshots.length < 1) return null;
          const points = yearSnapshots.map((s) => ({
            x: xOf(new Date(s.month).getTime()),
            y: yOf(s.mcs),
            s,
          }));
          const pathD = points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
            .join(" ");

          return (
            <g key={years[yi]}>
              <path
                d={pathD}
                fill="none"
                stroke="currentColor"
                strokeOpacity={lineOpacity(yi)}
                strokeWidth={yi === years.length - 1 ? 2 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dots */}
              {points.map((p, pi) => {
                const globalIdx = sorted.indexOf(p.s);
                return (
                  <circle
                    key={pi}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIdx === globalIdx ? 5 : 3}
                    fill="currentColor"
                    fillOpacity={lineOpacity(yi)}
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(globalIdx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
              {/* Year label at the end of line */}
              {points.length > 0 && (
                <text
                  x={points[points.length - 1].x + 6}
                  y={points[points.length - 1].y + 4}
                  className="fill-current"
                  fillOpacity={lineOpacity(yi)}
                  fontSize={10}
                  fontWeight={500}
                >
                  TK{years[yi]}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis: first and last month labels */}
        {sorted.length >= 2 && (
          <>
            <text
              x={xOf(allTimes[0])}
              y={H - 6}
              textAnchor="start"
              className="fill-current opacity-30"
              fontSize={10}
            >
              {formatMonth(sorted[0].month)}
            </text>
            <text
              x={xOf(allTimes[allTimes.length - 1])}
              y={H - 6}
              textAnchor="end"
              className="fill-current opacity-30"
              fontSize={10}
            >
              {formatMonth(sorted[sorted.length - 1].month)}
            </text>
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && sorted[hoveredIdx] && (
        <div className="mt-2 text-center text-[12px] text-text-secondary">
          In {formatMonth(sorted[hoveredIdx].month)}: <span className="font-semibold text-ink">{sorted[hoveredIdx].mcs}%</span> — {sorted[hoveredIdx].scoredPromises} beloften gescoord
          <span className="text-text-tertiary"> (TK{sorted[hoveredIdx].electionYear})</span>
        </div>
      )}

      {/* Legend if multiple years */}
      {years.length > 1 && hoveredIdx === null && (
        <div className="flex justify-center gap-4 mt-2 text-[11px] text-text-tertiary">
          {years.map((y, i) => (
            <span key={y} className="flex items-center gap-1.5">
              <span
                className="w-3 h-0.5 rounded-full bg-current"
                style={{ opacity: lineOpacity(i) }}
              />
              TK{y}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
