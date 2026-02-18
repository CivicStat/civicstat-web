"use client";

import { useState, useEffect } from "react";
import ScopeSwitcher, { type MunicipalityEntry } from "./ScopeSwitcher";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://civicstat-api.fly.dev";

/**
 * Client-side loader that fetches municipality data for the ScopeSwitcher.
 * Caches in sessionStorage to avoid re-fetching on every page navigation.
 */
export default function ScopeSwitcherLoader() {
  const [municipalities, setMunicipalities] = useState<MunicipalityEntry[]>([]);

  useEffect(() => {
    const CACHE_KEY = "civicstat-municipalities-cache";
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Check cache
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setMunicipalities(data);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Fetch
    fetch(`${API_URL}/parliaments`)
      .then((r) => r.json())
      .then((parliaments: any[]) => {
        const entries: MunicipalityEntry[] = parliaments
          .filter((p) => p.level === "MUNICIPAL")
          .map((p) => ({
            slug: p.slug,
            name: p.shortName,
            motions: p._count?.motions ?? 0,
            active: (p._count?.motions ?? 0) > 0,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "nl"));

        setMunicipalities(entries);

        // Cache
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: entries, ts: Date.now() }),
          );
        } catch {
          // ignore
        }
      })
      .catch(() => {
        // Fail silently — switcher works without municipality data
      });
  }, []);

  return <ScopeSwitcher municipalities={municipalities} />;
}
