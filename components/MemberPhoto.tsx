"use client";
import Image from "next/image";
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

export default function MemberPhoto({
  tkId,
  name,
  size = "sm",
  color = "#8B95A8",
  className = "",
}: MemberPhotoProps) {
  const [error, setError] = useState(false);
  const { px, tkSize } = SIZE_MAP[size];
  const url = `https://www.tweedekamer.nl/sites/default/files/styles/${tkSize}/public/tk_external_data_ggm_sync/photos/${tkId}.jpg`;

  if (error || !tkId) {
    return (
      <div
        className={`flex items-center justify-center rounded-full text-sm font-semibold text-ink shrink-0 ${className}`}
        style={{
          width: px,
          height: px,
          background: `linear-gradient(135deg, ${color}18, ${color}38)`,
          border: `2px solid ${color}33`,
        }}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={name}
      width={px}
      height={px}
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{
        width: px,
        height: px,
        filter: "grayscale(85%) contrast(1.05) brightness(1.02)",
      }}
      onError={() => setError(true)}
      unoptimized
    />
  );
}
