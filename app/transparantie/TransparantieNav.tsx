"use client";

import { useState, useEffect } from "react";

const SECTIONS = [
  { id: "datapipeline", label: "Pipeline" },
  { id: "huidige-data", label: "Data" },
  { id: "databronnen", label: "Bronnen" },
  { id: "scores", label: "Scores" },
  { id: "periodes", label: "Periodes" },
  { id: "matching", label: "Matching" },
  { id: "specificiteit", label: "Specificiteit" },
  { id: "neutraliteit", label: "Neutraliteit" },
  { id: "beperkingen", label: "Beperkingen" },
  { id: "begrippenlijst", label: "Begrippen" },
];

export default function TransparantieNav() {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = SECTIONS.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav className="sticky top-14 z-40 -mx-5 px-5 py-2 border-b border-border bg-surface/95 backdrop-blur-sm mb-5 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1 min-w-max">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`rounded-lg px-2.5 py-1 text-[12px] font-medium whitespace-nowrap transition-colors ${
              activeId === id
                ? "bg-moss/10 text-moss"
                : "text-text-tertiary hover:text-text-secondary hover:bg-surface-sub"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
