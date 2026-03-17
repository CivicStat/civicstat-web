import Link from "next/link";
import type { InsightsResponse } from "../../../lib/types";
import { INSIGHT_TYPES } from "./InsightPanels";

export default function InsightCards({ data }: { data: InsightsResponse }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {INSIGHT_TYPES.map((type) => {
        const count = type.count(data);
        return (
          <Link
            key={type.id}
            href={`/nl/inzichten/${type.id}`}
            className="card px-5 py-4 hover:border-moss/40 transition-all block"
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
          </Link>
        );
      })}
    </div>
  );
}
