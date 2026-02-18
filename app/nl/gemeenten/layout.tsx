import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Gemeenteraad · CivicStat",
    default: "Gemeenteraden — CivicStat",
  },
};

export default function GemeentenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
