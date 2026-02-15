"use client";

import { getScoreConfidence } from "../lib/scoring";

interface ConfidenceBadgeProps {
  scored: number;
  total: number;
  compact?: boolean;
}

/**
 * Shows how well-founded an MCS score is.
 *
 * Full mode (default): ratio + label + fill bar + hover tooltip
 * Compact mode: just scored/total in muted text
 */
export default function ConfidenceBadge({
  scored,
  total,
  compact = false,
}: ConfidenceBadgeProps) {
  const conf = getScoreConfidence(scored, total);

  if (compact) {
    return (
      <span
        className={`text-[11px] tabular-nums ${
          conf.level === "onvoldoende"
            ? "text-text-tertiary"
            : "text-text-secondary"
        }`}
        title={conf.description}
      >
        {scored}/{total}
      </span>
    );
  }

  const levelStyles = {
    hoog: "text-ink border-ink/15 bg-ink/5",
    gemiddeld: "text-text-secondary border-border bg-surface-sub/60",
    laag: "text-text-tertiary border-border bg-surface-sub/40",
    onvoldoende: "text-text-tertiary border-border-subtle bg-transparent",
  };

  const barFillStyles = {
    hoog: "bg-ink/25",
    gemiddeld: "bg-ink/15",
    laag: "bg-ink/8",
    onvoldoende: "bg-ink/4",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 ${levelStyles[conf.level]}`}
      title={conf.description}
    >
      {/* Fill bar */}
      <div className="w-[36px] h-1.5 rounded-full bg-ink/4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barFillStyles[conf.level]}`}
          style={{ width: `${Math.min(conf.ratio * 100, 100)}%` }}
        />
      </div>

      {/* Ratio */}
      <span className="text-[11px] tabular-nums font-medium">
        {scored}/{total}
      </span>

      {/* Label */}
      <span className="text-[10px]">{conf.label}</span>
    </div>
  );
}
