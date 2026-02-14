"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import MethodologyPanel from "./MethodologyPanel";

const navItems = [
  { href: "/beloften", label: "Beloften" },
  { href: "/moties", label: "Moties" },
  { href: "/kamerleden", label: "Kamerleden" },
  { href: "/partijen", label: "Partijen" },
];

const desktopOnlyItems = [
  { href: "/verbinding", label: "Verbinding" },
  { href: "/transparantie", label: "Transparantie" },
  { href: "/status", label: "Status" },
];

const mobileNavItems = [
  { href: "/beloften", label: "Beloften" },
  { href: "/moties", label: "Moties" },
  { href: "/kamerleden", label: "Kamerleden" },
  { href: "/partijen", label: "Partijen" },
  { href: "/verbinding", label: "Verbinding" },
];

function ShieldIcon() {
  return (
    <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const mobileIcons: Record<string, (props: { active: boolean }) => JSX.Element> = {
  "/beloften": ({ active }) => (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  "/moties": ({ active }) => (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  "/kamerleden": ({ active }) => (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "/partijen": ({ active }) => (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" />
    </svg>
  ),
  "/verbinding": ({ active }) => (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  "/transparantie": ({ active }) => (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

export default function Nav() {
  const pathname = usePathname();
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop top nav */}
      <header className="sticky top-0 z-50 h-14 border-b border-border" style={{ background: "var(--nav-bg)", backdropFilter: "blur(18px) saturate(180%)", WebkitBackdropFilter: "blur(18px) saturate(180%)" }}>
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-moss">
              <span className="text-white dark:text-[#0E1623]"><ShieldIcon /></span>
            </div>
            <span className="text-[17px] font-serif text-ink tracking-tight">CivicStat</span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {[...navItems, ...desktopOnlyItems].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[7px] px-3.5 py-1.5 text-[13.5px] transition-colors ${
                  isActive(item.href)
                    ? "bg-surface-sub font-semibold text-ink"
                    : "text-text-secondary hover:bg-surface-sub/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Begrippen + Search + theme toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMethodologyOpen(true)}
              className="hidden md:flex items-center gap-1.5 rounded-[7px] bg-surface-sub border border-border px-3 py-1.5 text-[13px] text-text-secondary hover:text-ink transition-colors"
            >
              <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>Begrippen</span>
            </button>
            <Link
              href="/zoeken"
              className={`rounded-[7px] p-2 transition-colors ${
                isActive("/zoeken")
                  ? "bg-surface-sub text-ink"
                  : "text-text-tertiary hover:bg-surface-sub/60 hover:text-text-secondary"
              }`}
              aria-label="Zoeken"
            >
              <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom,0px)] md:hidden">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = mobileIcons[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                active ? "text-moss" : "text-text-tertiary"
              }`}
            >
              {Icon && <Icon active={active} />}
              <span className={`text-[10.5px] ${active ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <MethodologyPanel open={methodologyOpen} onClose={() => setMethodologyOpen(false)} />
    </>
  );
}
