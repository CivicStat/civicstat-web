"use client";
import Image from "next/image";
import { useState } from "react";

interface PartyLogoProps {
  abbreviation: string;
  size?: number;
  className?: string;
  showColor?: boolean;
  onError?: () => void;
}

export default function PartyLogo({
  abbreviation,
  size = 36,
  className = "",
  showColor = false,
  onError,
}: PartyLogoProps) {
  const [error, setError] = useState(false);
  const src = `/logos/${abbreviation}.svg`;

  if (error) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={`Logo ${abbreviation}`}
      width={size}
      height={size}
      className={`object-contain transition-all duration-300 ${
        showColor
          ? ""
          : "grayscale brightness-[0.4] opacity-70 hover:grayscale-0 hover:brightness-100 hover:opacity-100 dark:brightness-[0.8] dark:opacity-80"
      } dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.3)] ${className}`}
      onError={() => {
        setError(true);
        onError?.();
      }}
      unoptimized
    />
  );
}
