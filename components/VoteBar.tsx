interface VoteBarProps {
  voor: number;
  tegen: number;
  afwezig?: number;
  height?: number;
  showLabels?: boolean;
  showCounts?: boolean;
}

export default function VoteBar({
  voor,
  tegen,
  afwezig = 0,
  height = 8,
  showLabels = false,
  showCounts = false,
}: VoteBarProps) {
  if (voor === 0 && tegen === 0 && (!afwezig || afwezig === 0)) {
    return <span className="text-text-tertiary text-sm">Geen stemregistratie</span>;
  }

  const total = voor + tegen + afwezig || 1;
  const pVoor = (voor / total) * 100;
  const pTegen = (tegen / total) * 100;

  return (
    <div className="w-full">
      <div
        className="flex overflow-hidden bg-bar-afwezig"
        style={{ height, borderRadius: height / 2 }}
      >
        <div
          className="bg-bar-voor transition-[width] duration-500 ease-out"
          style={{ width: `${pVoor}%` }}
          title={`Voor: ${voor}`}
        />
        <div
          className="bg-bar-tegen transition-[width] duration-500 ease-out"
          style={{ width: `${pTegen}%` }}
          title={`Tegen: ${tegen}`}
        />
      </div>
      {showLabels && (
        <div className="mt-1.5 flex justify-between text-xs text-text-secondary">
          <span className="font-semibold text-ink">Voor: {voor}</span>
          <span>
            Tegen: {tegen}
            {afwezig > 0 ? ` · Afwezig: ${afwezig}` : ""}
          </span>
        </div>
      )}
      {showCounts && (
        <div className="mt-0.5 flex justify-between text-[10px] text-text-tertiary tabular-nums">
          <span>{voor}</span>
          <span>{tegen}</span>
        </div>
      )}
    </div>
  );
}
