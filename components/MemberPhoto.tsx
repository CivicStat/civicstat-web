"use client";
import { useState } from "react";
import { getInitials } from "../lib/utils";

interface MemberPhotoProps {
  tkId: string;
  name: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: { px: 44, tkSize: "thumbnail" },
  md: { px: 64, tkSize: "small" },
  lg: { px: 80, tkSize: "medium" },
} as const;

const FILTERS = {
  sm: "grayscale(90%) contrast(1.0) brightness(1.02)",
  md: "grayscale(85%) contrast(1.05) brightness(1.02)",
  lg: "grayscale(75%) contrast(1.08) brightness(1.0)",
} as const;

const HOVER_FILTER = "grayscale(20%) contrast(1.05) brightness(1.0)";

export default function MemberPhoto({
  tkId,
  name,
  size = "sm",
  color = "#8B95A8",
  className = "",
}: MemberPhotoProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { px, tkSize } = SIZE_MAP[size];
  const url = `https://www.tweedekamer.nl/sites/default/files/styles/${tkSize}/public/tk_external_data_ggm_sync/photos/${tkId}.jpg`;

  if (error || !tkId) {
    return (
      <div
        className={`flex items-center justify-center rounded-full font-semibold text-ink shrink-0 ${className}`}
        style={{
          width: px,
          height: px,
          fontSize: px * 0.35,
          background: `linear-gradient(135deg, ${color}18, ${color}38)`,
          border: `2px solid ${color}33`,
        }}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: px, height: px }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!loaded && (
        <div className="absolute inset-0 rounded-full border-2 border-border bg-surface-sub animate-pulse" />
      )}
      <img
        src={url}
        alt={name}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        className="rounded-full object-cover border-2 border-border"
        style={{
          width: px,
          height: px,
          opacity: loaded ? 1 : 0,
          filter: hovered ? HOVER_FILTER : FILTERS[size],
          transition: "filter 0.3s ease, opacity 0.4s ease",
        }}
      />
    </div>
  );
}
