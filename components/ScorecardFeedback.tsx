"use client";

import { useState } from "react";

interface Props {
  partyId: string;
  partyAbbreviation: string;
  electionYear: number;
}

type Step = "idle" | "form" | "submitted";

export default function ScorecardFeedback({ partyId, partyAbbreviation, electionYear }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleOpen() {
    // Try to use the global Usersnap widget first
    const usersnap = (window as any).Usersnap;
    if (usersnap) {
      try {
        usersnap.open({
          custom: {
            party: partyAbbreviation,
            partyId,
            electionYear,
          },
        });
        return;
      } catch {
        // fall through to inline form
      }
    }
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/scorecard-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, partyAbbreviation, electionYear, message }),
      });
    } finally {
      setSubmitting(false);
      setStep("submitted");
    }
  }

  if (step === "submitted") {
    return (
      <p className="text-[11px] text-text-tertiary">
        Bedankt voor je feedback.
      </p>
    );
  }

  if (step === "form") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="text-[11px] text-text-tertiary">
          Wat klopt er niet?
        </label>
        <textarea
          className="w-full text-[12px] text-ink bg-surface-sub border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ink/20"
          rows={3}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Beschrijf kort het probleem..."
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="text-[11px] px-3 py-1.5 rounded-md bg-ink/8 hover:bg-ink/12 text-ink disabled:opacity-40 transition-colors"
          >
            {submitting ? "Versturen..." : "Verstuur"}
          </button>
          <button
            type="button"
            onClick={() => setStep("idle")}
            className="text-[11px] px-3 py-1.5 rounded-md hover:bg-surface-sub text-text-tertiary transition-colors"
          >
            Annuleer
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="text-[11px] text-text-tertiary hover:text-text-secondary underline underline-offset-2 transition-colors"
    >
      Klopt dit niet? Geef feedback
    </button>
  );
}
