"use client";

import { useState } from "react";

interface Props {
  passage: string;
  promiseText: string;
  maxLength?: number;
}

export default function ExpandablePassage({
  passage,
  promiseText,
  maxLength = 300,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = passage.length > maxLength;
  const displayText = expanded || !needsTruncation
    ? passage
    : passage.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";

  // Try to highlight the promise text within the passage
  const idx = passage
    .toLowerCase()
    .indexOf(promiseText.toLowerCase().slice(0, 60));

  function renderText(text: string) {
    if (idx === -1 || !expanded) {
      return <>{text}</>;
    }

    // Only highlight in full view
    const before = passage.slice(0, idx);
    const highlighted = passage.slice(idx, idx + promiseText.length);
    const after = passage.slice(idx + promiseText.length);

    return (
      <>
        {before}
        <mark className="bg-accent-subtle/60 text-ink rounded-sm px-0.5">
          {highlighted}
        </mark>
        {after}
      </>
    );
  }

  return (
    <div>
      <p className="text-[13px] text-text-secondary leading-relaxed max-w-[68ch]">
        {expanded ? renderText(passage) : displayText}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1.5 text-[12px] font-medium text-moss hover:text-ink transition-colors"
        >
          {expanded ? "Minder tonen" : "Meer context tonen"}
        </button>
      )}
    </div>
  );
}
