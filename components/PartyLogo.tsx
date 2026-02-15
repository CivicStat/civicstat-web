"use client";
import { useState } from "react";

interface PartyLogoProps {
  abbreviation: string;
  size?: number;
  className?: string;
  showColor?: boolean;
  onError?: () => void;
}

const PARTY_COLORS: Record<string, string> = {
  VVD: "#FF6600", PVV: "#002F6C", NSC: "#005CA9", BBB: "#95C11F",
  "GL-PvdA": "#B71C1C", D66: "#00A651", SP: "#FF0000", CDA: "#007B5F",
  PvdD: "#006B2D", CU: "#00AEEF", ChristenUnie: "#00AEEF", FVD: "#8B0000",
  SGP: "#FF6700", DENK: "#00B4D8", Volt: "#502379", JA21: "#1B365D",
};

export default function PartyLogo({
  abbreviation,
  size = 36,
  className = "",
  showColor = false,
  onError,
}: PartyLogoProps) {
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const src = `/logos/${abbreviation}.svg`;

  if (error) {
    const color = PARTY_COLORS[abbreviation] ?? "#8B95A8";
    return (
      <div
        className={`flex-shrink-0 rounded-lg flex items-center justify-center font-bold text-white ${className}`}
        style={{
          width: size,
          height: size,
          background: color,
          fontSize: size * 0.35,
        }}
      >
        {abbreviation.slice(0, 2)}
      </div>
    );
  }

  const isColor = showColor || hovered;

  return (
    <div
      className={`flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={`Logo ${abbreviation}`}
        onError={() => {
          setError(true);
          onError?.();
        }}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          filter: isColor
            ? "grayscale(0%) brightness(1)"
            : "grayscale(100%) brightness(0.55) contrast(1.1)",
          opacity: isColor ? 1 : 0.75,
          transition: "filter 0.3s ease, opacity 0.3s ease",
        }}
      />
    </div>
  );
}
