"use client";
import { useState } from "react";
import PartyLogo from "./PartyLogo";

interface PartyAvatarProps {
  abbreviation: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const DIMS = { sm: 36, md: 56, lg: 72 } as const;
const TEXT_SIZE = { sm: "text-[11px]", md: "text-base", lg: "text-lg" } as const;
const ROUNDED = { sm: "rounded-lg", md: "rounded-xl", lg: "rounded-xl" } as const;

export default function PartyAvatar({ abbreviation, color, size = "sm" }: PartyAvatarProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const dims = DIMS[size];
  const textSize = TEXT_SIZE[size];
  const rounded = ROUNDED[size];

  if (logoFailed) {
    return (
      <div
        className={`flex items-center justify-center ${rounded} ${textSize} font-extrabold shrink-0`}
        style={{
          width: dims,
          height: dims,
          backgroundColor: `${color}18`,
          border: `2px solid ${color}40`,
          color,
        }}
      >
        {abbreviation.slice(0, 3)}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${rounded} shrink-0 overflow-hidden`}
      style={{
        width: dims,
        height: dims,
        backgroundColor: `${color}08`,
        border: `1px solid ${color}15`,
      }}
    >
      <PartyLogo
        abbreviation={abbreviation}
        size={dims - 8}
        onError={() => setLogoFailed(true)}
      />
    </div>
  );
}
