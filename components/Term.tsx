"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  children: React.ReactNode;
  definition: string;
}

export default function Term({ children, definition }: Props) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!show) return;
    function handleClick(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [show]);

  return (
    <span className="relative inline" ref={ref}>
      <span
        className="border-b border-dashed border-text-tertiary cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShow((s) => !s);
        }}
      >
        {children}
      </span>
      {show && (
        <div
          ref={tooltipRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[280px] max-w-[90vw] rounded-lg bg-surface border border-border shadow-card-md px-3 py-2.5 z-50"
        >
          <div className="text-[12px] font-semibold text-ink mb-0.5">
            {children}
          </div>
          <p className="text-[12px] text-text-secondary leading-relaxed">
            {definition}
          </p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-surface border-r border-b border-border -mt-1" />
        </div>
      )}
    </span>
  );
}
