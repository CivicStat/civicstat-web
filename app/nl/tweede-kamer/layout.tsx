import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Tweede Kamer · CivicStat",
    default: "Tweede Kamer — CivicStat",
  },
};

export default function TweedeKamerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
