"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/* ─── Glossary data ─── */

interface GlossaryEntry {
  term: string;
  definition: string;
  badge?: { label: string; className: string };
  formula?: string;
  source?: string;
}

interface Section {
  id: string;
  title: string;
  entries: GlossaryEntry[];
}

const SECTIONS: Section[] = [
  {
    id: "begrippen",
    title: "Begrippen",
    entries: [
      {
        term: "Mandaatconsistentiescore (MCS)",
        definition:
          "Percentage stemmingen waarin een partij consistent stemt met de eigen verkiezingsbeloften. 100% = altijd consistent met beloften. Berekend per thema en als totaalcijfer.",
        formula: "MCS = consistente stemmen / (consistente + afwijkende stemmen) \u00d7 100%",
      },
      {
        term: "Initiatief Alignment Score (IAS)",
        definition:
          "Meet of een partij zelf wetgeving initieert die past bij de eigen beloften (moties indient), in tegenstelling tot alleen meestemmen met voorstellen van anderen.",
        formula: "IAS = ingediende moties met belofte-match / totaal relevante beloften \u00d7 100%",
      },
      {
        term: "Coalitie Alignment Index (CAI)",
        definition:
          "Het percentage stemmingen waarin een Kamerlid of partij hetzelfde stemt als de coalitiepartijen. Meet coalitiediscipline versus eigenstandigheid.",
        formula: "CAI = gelijke stemmen met coalitieblok / totaal stemmingen \u00d7 100%",
      },
      {
        term: "Motie",
        definition:
          "Een niet-bindend verzoek van de Kamer aan de regering. Politiek gezien zwaarwegend, maar juridisch niet afdwingbaar.",
      },
      {
        term: "Stemming",
        definition:
          "Formele stembeslissing in de Tweede Kamer. Twee varianten: met handopsteken (standaard) of hoofdelijk (op verzoek van \u226530 leden).",
      },
      {
        term: "Hoofdelijke stemming",
        definition:
          "Stemming waarbij elk individueel Kamerlid per naam stemt. Vindt plaats op verzoek van minstens 30 leden. Alleen hierbij zijn individuele stemrecords beschikbaar.",
      },
      {
        term: "Met handopsteken",
        definition:
          "De standaard stemmethode. De voorzitter telt de stemmen per fractie. Alleen partijstandpunten worden geregistreerd, geen individuele stemmen.",
      },
      {
        term: "Fractie",
        definition:
          "De partijgroep in de Tweede Kamer. Bepaalt het zetelgewicht bij stemmingen.",
      },
      {
        term: "Indiener",
        definition:
          "Het Kamerlid dat een motie heeft ingediend. Geregistreerd als ZaakActor in de TK API.",
      },
      {
        term: "Belofte",
        definition:
          "Een concrete of richtinggevende toezegging uit een verkiezingsprogramma.",
      },
      {
        term: "Belofte-kloof",
        definition:
          "Het verschil in zetels tussen de verwachte uitkomst (op basis van beloften) en de werkelijke stemuitslag bij een motie.",
        formula: "Belofte-kloof = werkelijke stemmen \u2018voor\u2019 \u2212 verwachte stemmen \u2018voor\u2019",
      },
      {
        term: "Match confidence",
        definition:
          "Betrouwbaarheidsscore (0-100%) van de koppeling tussen een motie en een belofte. Hoger = sterkere tekstuele of thematische overeenkomst.",
      },
      {
        term: "Verwachte stemrichting",
        definition:
          "De voorspelde stemrichting van een partij op basis van de gekoppelde belofte en het matchtype.",
      },
    ],
  },
  {
    id: "match-types",
    title: "Match-types",
    entries: [
      {
        term: "Expliciet",
        definition:
          "De motie adresseert direct dezelfde concrete toezegging als de belofte. Weegt mee met factor 1.0.",
        badge: { label: "EXPLICIET", className: "bg-accent-subtle text-moss" },
      },
      {
        term: "Impliciet",
        definition:
          "De motie valt binnen hetzelfde thema als de belofte, maar er is geen directe tekstuele overeenkomst. Weegt mee met factor 0.5.",
        badge: { label: "IMPLICIET", className: "bg-surface-sub text-text-secondary" },
      },
      {
        term: "Tegengesteld",
        definition:
          "De motie druist in tegen de belofte. De voorspelde stemrichting wordt omgekeerd. Weegt mee met factor 1.0.",
        badge: { label: "TEGENGESTELD", className: "bg-surface-sub text-text-tertiary" },
      },
    ],
  },
  {
    id: "specificiteit",
    title: "Specificiteit",
    entries: [
      {
        term: "Hoog (specifiek)",
        definition:
          "Meetbare, concrete toezegging met een duidelijk toetsbaar doel.",
        badge: { label: "SPECIFIEK", className: "bg-accent-subtle text-moss" },
      },
      {
        term: "Gemiddeld",
        definition:
          "Duidelijke richting, maar geen exact meetbaar doel.",
        badge: { label: "GEMIDDELD", className: "bg-surface-sub text-text-secondary" },
      },
      {
        term: "Laag (vaag)",
        definition:
          "Abstracte of vage toezegging die moeilijk objectief toetsbaar is.",
        badge: { label: "VAAG", className: "bg-surface-sub text-text-tertiary" },
      },
    ],
  },
  {
    id: "databronnen",
    title: "Databronnen",
    entries: [
      {
        term: "Tweede Kamer OData API",
        definition:
          "De offici\u00eble open data API van de Tweede Kamer der Staten-Generaal.",
        source: "https://gegevensmagazijn.tweedekamer.nl",
      },
      {
        term: "DNPP Repository",
        definition:
          "Het Documentatiecentrum Nederlandse Politieke Partijen aan de Rijksuniversiteit Groningen.",
        source: "https://dnpprepo.ub.rug.nl",
      },
      {
        term: "Zetelverdeling",
        definition:
          "Gebaseerd op de actuele fractiegrootte volgens de Tweede Kamer, niet op de verkiezingsuitslag.",
      },
    ],
  },
];

/* ─── Component ─── */

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MethodologyPanel({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["begrippen"]));
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // ESC key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!mounted || !open) return null;

  const q = search.toLowerCase();

  const filteredSections = SECTIONS.map((section) => ({
    ...section,
    entries: q
      ? section.entries.filter(
          (e) =>
            e.term.toLowerCase().includes(q) ||
            e.definition.toLowerCase().includes(q)
        )
      : section.entries,
  })).filter((s) => s.entries.length > 0);

  // When searching, auto-expand all matching sections
  const visibleOpen = q
    ? new Set(filteredSections.map((s) => s.id))
    : openSections;

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/40"
        style={{ animation: "fadeIn 0.2s ease" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 z-[70] flex flex-col bg-surface border-l border-border shadow-card-md overflow-hidden"
        style={{
          width: "min(440px, 90vw)",
          animation: "slideInRight 0.25s ease",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="font-serif text-[18px] text-ink">Methodologie &amp; begrippen</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-tertiary hover:text-ink hover:bg-surface-sub transition-colors"
            aria-label="Sluiten"
          >
            <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 rounded-[7px] bg-surface-sub px-3 py-1.5">
            <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="text-text-tertiary shrink-0">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Zoek begrip..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-text-tertiary outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-text-tertiary hover:text-ink">
                <svg width={12} height={12} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {filteredSections.map((section) => {
            const isOpen = visibleOpen.has(section.id);
            return (
              <div key={section.id} className="rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                    isOpen
                      ? "bg-surface-sub/40 dark:bg-surface-sub/60"
                      : "bg-surface hover:bg-surface-sub/50"
                  }`}
                >
                  <span className="text-[13px] font-semibold text-ink">{section.title}</span>
                  <svg
                    width={14}
                    height={14}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    viewBox="0 0 24 24"
                    className={`text-text-tertiary transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="border-t border-border divide-y divide-border">
                    {section.entries.map((entry) => (
                      <div key={entry.term} className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-ink">{entry.term}</span>
                          {entry.badge && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${entry.badge.className}`}>
                              {entry.badge.label}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-text-secondary leading-relaxed">
                          {entry.definition}
                        </p>
                        {entry.formula && (
                          <div className="mt-2 bg-surface-sub rounded-lg px-3 py-2 font-mono text-[12px] text-moss">
                            {entry.formula}
                          </div>
                        )}
                        {entry.source && (
                          <a
                            href={entry.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-[12px] text-moss hover:underline"
                          >
                            {entry.source.replace(/^https?:\/\//, "")}
                            <svg width={10} height={10} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredSections.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-8">
              Geen resultaten voor &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
