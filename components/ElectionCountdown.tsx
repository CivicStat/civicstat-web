/**
 * Election countdown banner — shows days remaining until election day.
 * Server component (date is fixed, no client-side state needed).
 */

interface Props {
  /** ISO date string, e.g. "2026-03-18" */
  electionDate: string;
  /** Optional label, e.g. "gemeenteraadsverkiezingen" */
  label?: string;
}

export default function ElectionCountdown({
  electionDate,
  label = "gemeenteraadsverkiezingen",
}: Props) {
  const election = new Date(electionDate + "T00:00:00");
  const now = new Date();
  // Reset to start of day for accurate day count
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const electionDay = new Date(
    election.getFullYear(),
    election.getMonth(),
    election.getDate(),
  );
  const diffMs = electionDay.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Don't show if election is more than 60 days away or more than 7 days past
  if (diffDays > 60 || diffDays < -7) return null;

  let message: string;
  let accent = false;
  let postElection = false;

  if (diffDays > 1) {
    message = `Nog ${diffDays} dagen tot de ${label}`;
  } else if (diffDays === 1) {
    message = `Morgen: ${label}`;
    accent = true;
  } else if (diffDays === 0) {
    message = `Vandaag: ${label}`;
    accent = true;
  } else {
    // Post-election: show results mode
    postElection = true;
    message = `De ${label} hebben plaatsgevonden`;
  }

  return (
    <div
      className={`rounded-lg border px-5 py-3.5 mb-6 ${
        accent
          ? "border-moss/40 bg-moss/5"
          : postElection
            ? "border-border-subtle bg-surface-sub/20"
            : "border-border bg-surface-sub/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <svg
          width={18}
          height={18}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          className={accent ? "text-moss" : "text-text-tertiary"}
        >
          {postElection ? (
            <>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </>
          ) : (
            <>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </>
          )}
        </svg>
        <div>
          <div
            className={`text-sm font-medium ${accent ? "text-moss" : postElection ? "text-text-secondary" : "text-ink"}`}
          >
            {message}
          </div>
          {diffDays > 0 && (
            <div className="text-[11px] text-text-tertiary mt-0.5">
              {new Date(electionDate).toLocaleDateString("nl-NL", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}
          {postElection && (
            <div className="text-[11px] text-text-tertiary mt-0.5">
              {new Date(electionDate).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
