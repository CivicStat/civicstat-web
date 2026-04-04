import Link from "next/link";
import { getScopedMembers } from "../../../../lib/api";
import { getPartyColor, getInitials } from "../../../../lib/utils";
import { routes } from "../../../../lib/routes";

const SLUG = "eerste-kamer";

export const revalidate = 3600;

export const metadata = {
  title: "Senatoren — Eerste Kamer",
  description: "Alle leden van de Eerste Kamer der Staten-Generaal.",
};

export default async function EKSenatorenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; party?: string }>;
}) {
  const sp = await searchParams;

  let membersResponse;
  try {
    membersResponse = await getScopedMembers(SLUG, {
      q: sp.q,
      party: sp.party,
    });
  } catch {
    return (
      <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
        <h1 className="font-serif text-[26px] text-ink mb-2">Senatoren</h1>
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API.
        </div>
      </div>
    );
  }

  const members = membersResponse.members;

  // Extract unique parties for quick filters
  const parties = Array.from(
    new Map(
      members.map((m) => [
        m.party.abbreviation,
        {
          abbreviation: m.party.abbreviation,
          colorNeutral: m.party.colorNeutral ?? null,
        },
      ]),
    ).values(),
  ).sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-text-tertiary mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-moss transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={routes.ek.root}
          className="hover:text-moss transition-colors"
        >
          Eerste Kamer
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Senatoren</span>
      </nav>

      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Senatoren
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-5">
        {members.length} leden van de Eerste Kamer der Staten-Generaal.
      </p>

      {/* Search + party filter */}
      <form className="mb-5 flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Zoek senator..."
          className="flex-1 min-w-[200px] rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-ink placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-moss/30"
        />
        <select
          name="party"
          defaultValue={sp.party ?? ""}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/30"
        >
          <option value="">Alle fracties</option>
          {parties.map((p) => (
            <option key={p.abbreviation} value={p.abbreviation}>
              {p.abbreviation}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-moss px-4 py-2 text-sm font-medium text-white hover:bg-moss-hover transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Members grid */}
      {members.length === 0 ? (
        <div className="card p-8 text-center text-sm text-text-tertiary">
          Geen senatoren gevonden.
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => {
            const color = getPartyColor(
              m.party.abbreviation,
              m.party.colorNeutral,
            );
            return (
              <Link
                key={m.id}
                href={routes.ek.senator(m.id)}
                className="card px-4 py-3.5 flex items-center gap-3 hover:border-moss/40 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium text-white flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {getInitials(m.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-ink truncate">
                    {m.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span>{m.party.abbreviation}</span>
                    {m._count.voteRecords > 0 && (
                      <>
                        <span>&middot;</span>
                        <span>{m._count.voteRecords} stemmen</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
