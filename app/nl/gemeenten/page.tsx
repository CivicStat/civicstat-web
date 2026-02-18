import Link from "next/link";
import { getParliaments } from "../../../lib/api";
import { gemeente } from "../../../lib/routes";
import type { ParliamentListItem } from "../../../lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gemeenteraden — CivicStat",
  description: "Overzicht van alle beschikbare gemeenteraden op CivicStat.",
};

export default async function GemeentenPage() {
  let parliaments: ParliamentListItem[] = [];
  try {
    parliaments = await getParliaments();
  } catch {
    // API not yet deployed with /parliaments endpoint
  }
  const municipalities = parliaments.filter((p) => p.level === "MUNICIPAL");

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-20">
      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
          Nederland
        </p>
        <h1 className="font-serif text-[clamp(26px,4vw,38px)] font-normal text-ink leading-[1.2] tracking-tight">
          Gemeenteraden
        </h1>
        <p className="text-[15px] text-text-secondary mt-2 max-w-[540px] leading-relaxed">
          Moties, stemgedrag en raadsleden per gemeente — traceerbaar en zonder
          politieke duiding.
        </p>
      </div>

      {municipalities.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-secondary">
            Er zijn nog geen gemeenteraden beschikbaar. Binnenkort voegen we de
            eerste gemeenten toe.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {municipalities.map((m) => {
            const r = gemeente(m.slug);
            return (
              <Link
                key={m.id}
                href={r.root}
                className="card p-5 group hover:border-moss/40 transition-colors"
              >
                <h2 className="font-serif text-lg text-ink group-hover:text-moss transition-colors mb-1">
                  {m.shortName}
                </h2>
                <p className="text-[13px] text-text-secondary mb-3">
                  {m.seats} zetels
                </p>
                <div className="flex gap-4 text-[12px] text-text-tertiary">
                  <span>{m._count.motions.toLocaleString("nl-NL")} moties</span>
                  <span>{m._count.parties} partijen</span>
                  <span>{m._count.mps} raadsleden</span>
                </div>
                <span className="inline-block mt-3 text-[13px] font-medium text-moss opacity-0 group-hover:opacity-100 transition-opacity">
                  Bekijk dashboard &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
