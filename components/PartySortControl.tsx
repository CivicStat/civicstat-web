"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "seats", label: "Zetels" },
  { value: "mcs2023", label: "MCS 2023" },
  { value: "mcs2025", label: "MCS 2025" },
  { value: "delta", label: "\u0394" },
  { value: "name", label: "Naam" },
] as const;

export default function PartySortControl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || "seats";

  function handleSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border p-0.5 bg-surface-sub/40">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleSort(opt.value)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
            current === opt.value
              ? "bg-white dark:bg-ink/80 text-ink dark:text-white shadow-sm"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
