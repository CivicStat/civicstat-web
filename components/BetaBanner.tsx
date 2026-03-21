"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "civicstat-beta-dismissed";

export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div className="w-full bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-center gap-3">
        <span className="text-sm text-amber-800 dark:text-amber-200">
          Dit platform is momenteel nog in aanbouw en nog niet officieel gelanceerd.
        </span>
        <button
          onClick={() => {
            setDismissed(true);
            try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
          }}
          className="shrink-0 p-0.5 rounded text-amber-600 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
          aria-label="Sluiten"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
