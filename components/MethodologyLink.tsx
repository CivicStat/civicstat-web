"use client";

import { useState } from "react";
import MethodologyPanel from "./MethodologyPanel";

interface Props {
  label?: string;
}

export default function MethodologyLink({ label = "Methodologie & begrippen" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors mt-3"
      >
        <svg width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span className="underline underline-offset-2">{label}</span>
      </button>
      <MethodologyPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
