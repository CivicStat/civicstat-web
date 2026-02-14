"use client";

import { useState } from "react";
import Link from "next/link";
import VoteBar from "../../components/VoteBar";
import { formatDate } from "../../lib/utils";
import type { PromiseMotionMatch } from "../../lib/types";

function matchTypeLabel(t: string) {
  switch (t) {
    case "EXPLICIT_MATCH":
      return "direct";
    case "CONTRA_MATCH":
      return "contra";
    default:
      return "impliciet";
  }
}

function matchTypeBadgeClass(t: string) {
  switch (t) {
    case "EXPLICIT_MATCH":
      return "bg-accent-subtle text-moss";
    case "CONTRA_MATCH":
      return "bg-red-500/10 text-red-400";
    default:
      return "bg-surface-sub text-text-secondary";
  }
}

interface Props {
  matches: PromiseMotionMatch[];
  adopted: number;
  rejected: number;
  noVote: number;
}

const INITIAL_SHOW = 3;

export default function MotionMatchList({ matches, adopted, rejected, noVote }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? matches : matches.slice(0, INITIAL_SHOW);
  const remaining = matches.length - INITIAL_SHOW;

  const avgConfidence = matches.length > 0
    ? matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length
    : 0;
  const confidenceLabel = avgConfidence >= 0.6 ? "Hoog" : avgConfidence >= 0.3 ? "Gemiddeld" : "Laag";
  const confidencePct = Math.round(avgConfidence * 100);

  return (
    <div className="border-t border-border-subtle px-5 py-3 bg-surface-sub/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
          Gerelateerde moties ({matches.length})
        </span>
        <div className="flex items-center gap-3 text-[11px] text-text-secondary">
          {adopted > 0 && (
            <span className="flex items-center gap-1">
              <svg width={10} height={10} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              {adopted} aangenomen
            </span>
          )}
          {rejected > 0 && (
            <span className="flex items-center gap-1">
              <svg width={10} height={10} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              {rejected} verworpen
            </span>
          )}
          {noVote > 0 && (
            <span>{noVote} zonder stemming</span>
          )}
        </div>
      </div>

      {/* Confidence indicator */}
      {matches.length > 0 && (
        <div className="flex items-center gap-2 mb-2 text-[11px]">
          <span className="text-text-tertiary" title="Gebaseerd op woordovereenkomst, niet op inhoudelijke analyse">
            Woordovereenkomst:
          </span>
          <span className={`font-semibold ${
            avgConfidence >= 0.6 ? "text-moss" : avgConfidence >= 0.3 ? "text-text-secondary" : "text-text-tertiary"
          }`}>
            {confidenceLabel} ({confidencePct}%)
          </span>
          <div className="flex-1 flex h-1 rounded-full overflow-hidden bg-surface-sub2 max-w-[60px]">
            <div
              className={`h-full rounded-full ${
                avgConfidence >= 0.6 ? "bg-moss" : avgConfidence >= 0.3 ? "bg-text-secondary" : "bg-text-tertiary"
              }`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          {avgConfidence < 0.6 && (
            <span className="text-text-tertiary/70 italic" title="Lage woordovereenkomst — handmatige controle aanbevolen">
              ⚠
            </span>
          )}
        </div>
      )}

      {/* Motion rows */}
      <div className="space-y-1">
        {visible.map((match) => {
          const vote = match.motion.votes?.[0];
          return (
            <Link
              key={match.id}
              href={`/moties/${match.motion.id}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 -mx-1 transition-colors hover:bg-surface-sub group"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] text-ink truncate group-hover:text-moss transition-colors">
                  {match.motion.text || match.motion.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-tertiary">
                  {match.motion.tkNumber && (
                    <span className="font-mono">{match.motion.tkNumber}</span>
                  )}
                  <span>{formatDate(match.motion.dateIntroduced)}</span>
                  <span className={`rounded-full px-1.5 py-0 text-[10px] font-medium ${matchTypeBadgeClass(match.matchType)}`}>
                    {matchTypeLabel(match.matchType)}
                  </span>
                </div>
              </div>

              {/* Vote result */}
              {vote ? (
                <div className="flex-shrink-0 w-[80px] text-right">
                  <div className="w-[60px] ml-auto">
                    <VoteBar voor={vote.totalFor} tegen={vote.totalAgainst} height={5} />
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-tertiary">
                    {vote.totalFor}&ndash;{vote.totalAgainst}{" "}
                    <span className={vote.result === "Aangenomen" ? "font-semibold text-ink" : ""}>
                      {vote.result === "Aangenomen" ? "\u2713" : "\u2717"}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="flex-shrink-0 text-[11px] text-text-tertiary italic">
                  geen stemming
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Expand / collapse */}
      {remaining > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1.5 text-[11px] text-moss hover:text-ink transition-colors font-medium pl-2"
        >
          {expanded ? "Minder tonen" : `+ ${remaining} meer tonen`}
        </button>
      )}
    </div>
  );
}
