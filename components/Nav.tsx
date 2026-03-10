"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import MethodologyPanel from "./MethodologyPanel";
import ScopeSwitcherLoader from "./ScopeSwitcherLoader";
import { routes, gemeente } from "../lib/routes";

/* ── TK scope nav items ───────────────────────────────────── */
const tkNavItems = [
  { href: routes.tk.root, label: "Overzicht", exact: true },
  { href: routes.tk.beloften, label: "Beloften" },
  { href: routes.tk.moties, label: "Moties" },
  { href: routes.tk.kamerleden, label: "Kamerleden" },
  { href: routes.tk.partijen, label: "Partijen" },
  { href: routes.tk.verbinding, label: "Verbinding" },
  { href: routes.tk.inzichten, label: "Inzichten" },
];

const globalItems = [
  { href: routes.transparantie, label: "Transparantie" },
];

/* Mobile bottom bar items (TK scope) */
const mobileNavItemsTK = [
  { href: routes.tk.root, label: "TK", exact: true },
  { href: routes.tk.beloften, label: "Beloften" },
  { href: routes.tk.moties, label: "Moties" },
  { href: routes.tk.partijen, label: "Partijen" },
  { href: routes.tk.verbinding, label: "Verbinding" },
];

/* ── Icons ────────────────────────────────────────────────── */
function ShieldIcon() {
  return (
    <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function DocIcon({ active }: { active: boolean }) {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function PeopleIcon({ active }: { active: boolean }) {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BuildingIcon({ active }: { active: boolean }) {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" />
    </svg>
  );
}

function CheckIcon({ active }: { active: boolean }) {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function InfoIcon({ active }: { active: boolean }) {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function LinkIcon({ active }: { active: boolean }) {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function NLFlagIcon({ active }: { active: boolean }) {
  return (
    <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/* ── Global (unscoped) mobile nav items ─────────────────────── */
const mobileNavItemsGlobal = [
  { href: routes.tk.root, label: "TK" },
  { href: routes.gemeenten.root, label: "Gemeenten" },
  { href: routes.transparantie, label: "Transparantie" },
];

const mobileIconsGlobal: Record<string, (props: { active: boolean }) => JSX.Element> = {
  [routes.tk.root]: NLFlagIcon,
  [routes.gemeenten.root]: BuildingIcon,
  [routes.transparantie]: InfoIcon,
};

const mobileIcons: Record<string, (props: { active: boolean }) => JSX.Element> = {
  [routes.tk.root]: GridIcon,
  [routes.tk.beloften]: CheckIcon,
  [routes.tk.moties]: DocIcon,
  [routes.tk.partijen]: BuildingIcon,
  [routes.tk.verbinding]: LinkIcon,
};

/* ── Gemeente scope helpers ──────────────────────────────── */
const GEMEENTE_PREFIX = "/nl/gemeenten/";

function parseGemeenteSlug(pathname: string): string | null {
  if (!pathname.startsWith(GEMEENTE_PREFIX)) return null;
  const rest = pathname.slice(GEMEENTE_PREFIX.length);
  const slug = rest.split("/")[0];
  return slug || null;
}

function slugToName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Nav() {
  const pathname = usePathname();
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTKScope = pathname.startsWith("/nl/tweede-kamer");
  const gemeenteSlug = useMemo(() => parseGemeenteSlug(pathname), [pathname]);
  const isGemeenteScope = gemeenteSlug !== null;
  const isScopedPage = isTKScope || isGemeenteScope;

  // Build gemeente-scoped nav items dynamically (with beloften)
  const gemeenteNavItems = useMemo(() => {
    if (!gemeenteSlug) return [];
    const g = gemeente(gemeenteSlug);
    return [
      { href: g.root, label: "Overzicht", exact: true },
      { href: g.beloften, label: "Beloften" },
      { href: g.moties, label: "Moties" },
      { href: g.partijen, label: "Partijen" },
      { href: g.raadsleden, label: "Raadsleden" },
    ];
  }, [gemeenteSlug]);

  const mobileGemeenteItems = useMemo(() => {
    if (!gemeenteSlug) return [];
    const g = gemeente(gemeenteSlug);
    return [
      { href: g.root, label: "Overzicht", exact: true },
      { href: g.beloften, label: "Beloften" },
      { href: g.moties, label: "Moties" },
      { href: g.partijen, label: "Partijen" },
      { href: g.raadsleden, label: "Leden" },
    ];
  }, [gemeenteSlug]);

  // Choose which nav items to show based on scope
  const scopeNavItems = isTKScope ? tkNavItems : isGemeenteScope ? gemeenteNavItems : [];
  const activeMobileItems = isGemeenteScope
    ? mobileGemeenteItems
    : isTKScope
      ? mobileNavItemsTK
      : mobileNavItemsGlobal;

  // Mobile icons based on current scope
  const getMobileIcon = (href: string): ((props: { active: boolean }) => JSX.Element) | undefined => {
    if (isGemeenteScope) {
      const g = gemeente(gemeenteSlug!);
      if (href === g.root) return GridIcon;
      if (href === g.beloften) return CheckIcon;
      if (href === g.moties) return DocIcon;
      if (href === g.partijen) return BuildingIcon;
      if (href === g.raadsleden) return PeopleIcon;
      return undefined;
    }
    if (isTKScope) return mobileIcons[href];
    // Global/unscoped
    return mobileIconsGlobal[href];
  };

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Global top bar ──────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border" style={{ background: "var(--nav-bg)", backdropFilter: "blur(18px) saturate(180%)", WebkitBackdropFilter: "blur(18px) saturate(180%)" }}>
        {/* Top row: logo + scope switcher + actions */}
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-moss">
                <span className="text-white dark:text-[#0E1623]"><ShieldIcon /></span>
              </div>
              <span className="hidden sm:inline text-[17px] font-serif text-ink tracking-tight">CivicStat</span>
            </Link>

            <span className="text-text-tertiary text-[13px] ml-0.5">/</span>

            {/* Scope Switcher — replaces old breadcrumb */}
            <ScopeSwitcherLoader />
          </div>

          {/* Actions: search + begrippen + global links + theme + hamburger */}
          <div className="flex items-center gap-1.5">
            {/* Global nav items (desktop only) */}
            <nav className="hidden items-center gap-0.5 lg:flex mr-2">
              {globalItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[7px] px-3 py-1.5 text-[13px] transition-colors ${
                    isActive(item.href)
                      ? "bg-surface-sub font-semibold text-ink"
                      : "text-text-secondary hover:bg-surface-sub/60"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

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
              href={routes.tk.zoeken}
              className={`rounded-[7px] p-2 transition-colors ${
                isActive(routes.tk.zoeken)
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

            {/* Hamburger (mobile + tablet) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-[7px] p-2 text-text-secondary hover:bg-surface-sub/60 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Scoped sub-nav (desktop) — works for both TK and gemeente */}
        {isScopedPage && scopeNavItems.length > 0 && (
          <nav className="hidden md:flex mx-auto max-w-[1200px] items-center gap-0.5 px-6 pb-2 overflow-x-auto scrollbar-none">
            {scopeNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[7px] px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors ${
                  isActive(item.href, (item as any).exact)
                    ? "bg-surface-sub font-semibold text-ink"
                    : "text-text-secondary hover:bg-surface-sub/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-subtle bg-surface px-6 py-4 space-y-1">
            {/* Scope navigation */}
            <div className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
              Navigeer
            </div>
            <Link
              href={routes.tk.root}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-lg px-3 py-2 text-[14px] transition-colors ${
                isTKScope
                  ? "bg-surface-sub font-semibold text-ink"
                  : "text-text-secondary hover:bg-surface-sub/60"
              }`}
            >
              🇳🇱 Tweede Kamer
            </Link>
            <Link
              href={routes.gemeenten.root}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-lg px-3 py-2 text-[14px] transition-colors ${
                pathname === routes.gemeenten.root
                  ? "bg-surface-sub font-semibold text-ink"
                  : "text-text-secondary hover:bg-surface-sub/60"
              }`}
            >
              🏛 Gemeenteraden
            </Link>
            <div className="border-t border-border-subtle my-2" />

            {/* Current scope items */}
            {isTKScope && (
              <>
                <div className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
                  Tweede Kamer
                </div>
                {tkNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-[14px] transition-colors ${
                      isActive(item.href, item.exact)
                        ? "bg-surface-sub font-semibold text-ink"
                        : "text-text-secondary hover:bg-surface-sub/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-border-subtle my-2" />
              </>
            )}
            {isGemeenteScope && (
              <>
                <div className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary mb-2">
                  {slugToName(gemeenteSlug!)}
                </div>
                {gemeenteNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-[14px] transition-colors ${
                      isActive(item.href, item.exact)
                        ? "bg-surface-sub font-semibold text-ink"
                        : "text-text-secondary hover:bg-surface-sub/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-border-subtle my-2" />
              </>
            )}
            {globalItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-[14px] transition-colors ${
                  isActive(item.href)
                    ? "bg-surface-sub font-semibold text-ink"
                    : "text-text-secondary hover:bg-surface-sub/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ── Mobile bottom nav ────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom,0px)] md:hidden">
        {activeMobileItems.map((item) => {
          const active = isActive(item.href, (item as any).exact);
          const Icon = getMobileIcon(item.href);
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
