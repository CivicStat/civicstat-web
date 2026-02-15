"use client";

import { useRouter } from "next/navigation";
import { routes } from "../../../../lib/routes";
import { useState, useEffect, useRef } from "react";

export default function SearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced navigation
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = q.trim();

    // Don't auto-search for very short queries
    if (trimmed.length > 0 && trimmed.length < 2) return;

    debounceRef.current = setTimeout(() => {
      if (trimmed) {
        router.push(`${routes.tk.zoeken}?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(routes.tk.zoeken);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Cancel debounce and navigate immediately
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = q.trim();
    if (trimmed) {
      router.push(`${routes.tk.zoeken}?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="card flex items-center gap-2 px-3 py-1">
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          viewBox="0 0 24 24"
          className="flex-shrink-0 text-text-tertiary"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Zoek moties, beloften of Kamerleden..."
          className="flex-1 border-none outline-none bg-transparent text-sm text-ink py-2.5 placeholder:text-text-tertiary"
          autoFocus
        />
        {q.trim() && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="p-1 text-text-tertiary hover:text-text-secondary transition-colors"
            aria-label="Wissen"
          >
            <svg
              width={14}
              height={14}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
