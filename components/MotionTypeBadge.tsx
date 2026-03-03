/**
 * Badge for motion type (Motie, Amendement, etc.)
 * Displayed alongside motions to distinguish between types.
 */

interface MotionTypeBadgeProps {
  type: string;
  size?: "sm" | "md";
}

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  Motie: {
    label: "Motie",
    className: "bg-moss/8 text-moss border-moss/20",
  },
  Amendement: {
    label: "Amendement",
    className: "bg-amber-500/8 text-amber-700 border-amber-500/20 dark:text-amber-400",
  },
  Wetsvoorstel: {
    label: "Wetsvoorstel",
    className: "bg-ink/8 text-ink/70 border-ink/15",
  },
};

export default function MotionTypeBadge({ type, size = "sm" }: MotionTypeBadgeProps) {
  const config = TYPE_CONFIG[type] ?? {
    label: type,
    className: "bg-surface-sub text-text-tertiary border-border-subtle",
  };

  const sizeClasses =
    size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border whitespace-nowrap ${sizeClasses} ${config.className}`}
    >
      {config.label}
    </span>
  );
}
