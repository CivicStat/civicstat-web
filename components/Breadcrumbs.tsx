import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation for detail pages.
 * The last item is rendered as plain text (current page).
 */
export default function Breadcrumbs({ items }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-[13px] text-text-tertiary mb-5 overflow-x-auto"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            {i > 0 && (
              <svg
                width={12}
                height={12}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                className="shrink-0 text-text-tertiary/50"
                aria-hidden
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
            {isLast || !item.href ? (
              <span className="text-text-secondary font-medium truncate max-w-[280px]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-ink transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
