"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

// Initialize PostHog outside of React lifecycle to avoid race conditions
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: "/ingest",
    ui_host: "https://eu.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: false, // Manual capture for Next.js route changes
    capture_pageleave: true,
    loaded: () => {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log("[PostHog] Initialized successfully");
      }
    },
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
