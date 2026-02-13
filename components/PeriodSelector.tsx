"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface PeriodSelectorProps {
  years: number[];
  activeYear: number;
}

export default function PeriodSelector({ years, activeYear }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(year: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("jaar", year.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border p-0.5 bg-surface-sub/40">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => handleSelect(year)}
          className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors ${
            year === activeYear
              ? "bg-white dark:bg-ink/80 text-ink dark:text-white shadow-sm"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          TK{year}
        </button>
      ))}
    </div>
  );
}
