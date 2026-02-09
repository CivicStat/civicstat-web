import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparantie — CivicStat",
  description:
    "Methodologie, databronnen en algoritmes achter CivicStat. Lees hoe wij verkiezingsbeloften koppelen aan stemgedrag.",
};

export default function TransparantiePage() {
  return (
    <main className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[26px] font-normal text-ink mb-2">
          Transparantie &amp; methodologie
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-[68ch]">
          CivicStat maakt het stemgedrag van de Tweede Kamer transparant en
          vergelijkt het met verkiezingsbeloften. Hieronder leggen we uit hoe
          onze data wordt verzameld, verwerkt en gepresenteerd.
        </p>
      </div>

      {/* ─── 1. Data pipeline ──────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={1} title="Datapipeline" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          Alle parlementaire gegevens komen uit de offici&euml;le Tweede Kamer
          OData API. Er wordt geen data handmatig aangepast of gefilterd.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <StepCard
            step="1"
            title="Ingest"
            description="Moties, stemmingen, Kamerleden en fracties worden dagelijks opgehaald via de OData REST-feed van de Tweede Kamer."
          />
          <StepCard
            step="2"
            title="Matching"
            description="Beloften uit verkiezingsprogramma's worden automatisch gekoppeld aan moties via trefwoord- en tekstanalyse."
          />
          <StepCard
            step="3"
            title="Scoring"
            description="Per belofte berekenen we de Mandate Consistency Score op basis van het stemgedrag bij gerelateerde moties."
          />
        </div>
      </section>

      {/* ─── 2. Databronnen ────────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={2} title="Databronnen" />
        <div className="space-y-3">
          <SourceItem
            name="Tweede Kamer OData API"
            url="https://gegevensmagazijn.tweedekamer.nl"
            description="Besluiten, stemmingen, personen en fracties. Offici&euml;le bron van alle parlementaire data."
          />
          <SourceItem
            name="Verkiezingsprogramma's (PDF)"
            url="https://tweedekamer.nl"
            description="Verkiezingsprogramma's TK2023 van alle 15 deelnemende partijen. Gedownload van de offici&euml;le partijwebsites."
          />
          <SourceItem
            name="Kiesraad"
            url="https://www.kiesraad.nl"
            description="Offici&euml;le verkiezingsuitslagen en fractiezetels voor verificatie."
          />
        </div>
      </section>

      {/* ─── 3. MCS Methodologie ───────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={3} title="Mandate Consistency Score (MCS)" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          De MCS meet in hoeverre een partij stemt in lijn met haar
          verkiezingsbeloften. De score wordt per partij berekend op basis van
          alle beloften waarvoor minimaal &eacute;&eacute;n gerelateerde motie met
          stemmingsresultaat beschikbaar is.
        </p>

        <div className="bg-surface-sub rounded-lg p-4 mb-4 font-mono text-[13px] text-ink max-w-[500px]">
          MCS = (consistent + mixed &times; 0.5) / scored &times; 100
        </div>

        <div className="space-y-2 text-sm text-text-secondary max-w-[68ch]">
          <p>
            <strong className="text-ink">Consistent:</strong> &ge;70% van de
            gerelateerde moties is in lijn met de belofte (rekening houdend met
            verwachte stemrichting en matchtype).
          </p>
          <p>
            <strong className="text-ink">Inconsistent:</strong> &le;30% van de
            gerelateerde moties is in lijn.
          </p>
          <p>
            <strong className="text-ink">Gemengd:</strong> tussen 30% en 70%.
          </p>
          <p>
            <strong className="text-ink">Confidence weighting:</strong> matches
            met een betrouwbaarheidsscore &lt;0.3 worden uitgesloten. De
            gewogen ratio wordt gebruikt zodat sterkere matches zwaarder
            meetellen.
          </p>
        </div>
      </section>

      {/* ─── 4. Matching-algoritme ─────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={4} title="Matching-algoritme" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          Moties worden automatisch gekoppeld aan beloften via een
          trefwoordalgoritme. Elke belofte heeft een set thematische
          trefwoorden; een motie wordt gekoppeld als de tekst voldoende
          overlap vertoont.
        </p>

        <div className="space-y-2 text-sm text-text-secondary max-w-[68ch]">
          <p>
            <strong className="text-ink">Match-types:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <span className="text-ink font-medium">Direct (explicit):</span>{" "}
              de motie behandelt hetzelfde onderwerp als de belofte.
            </li>
            <li>
              <span className="text-ink font-medium">Impliciet:</span> de motie
              raakt aan het thema maar is niet een directe vertaling.
            </li>
            <li>
              <span className="text-ink font-medium">Contra:</span> de motie
              gaat in tegen de richting van de belofte.
            </li>
          </ul>
          <p className="mt-2">
            Elke match krijgt een betrouwbaarheidsscore van 0 tot 1. Matches
            onder 0.3 worden niet getoond.
          </p>
        </div>
      </section>

      {/* ─── 5. Neutraliteit ───────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={5} title="Neutraliteit &amp; onpartijdigheid" />
        <div className="space-y-3 text-sm text-text-secondary max-w-[68ch]">
          <p>
            CivicStat is politiek onafhankelijk en ontvangt geen financiering
            van politieke partijen, bedrijven of belangengroepen.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Alle partijen worden op dezelfde manier behandeld: dezelfde
              algoritmes, dezelfde drempelwaarden, dezelfde weergave.
            </li>
            <li>
              We publiceren geen rankings of &ldquo;beste partij&rdquo;-scores. De data
              spreekt voor zich.
            </li>
            <li>
              Elke berekening is reproduceerbaar. De broncode van de ETL-pipeline
              en de scoringsalgoritmes is openbaar beschikbaar.
            </li>
            <li>
              Fouten en beperkingen worden expliciet benoemd (zie hieronder).
            </li>
          </ul>
        </div>
      </section>

      {/* ─── 6. Beperkingen ────────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={6} title="Beperkingen" />
        <div className="space-y-3 text-sm text-text-secondary max-w-[68ch]">
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>
              <strong className="text-ink">Moties ≠ al het beleid.</strong>{" "}
              Wetsvoorstellen, amendementen en begrotingsbesluiten worden nog
              niet meegenomen.
            </li>
            <li>
              <strong className="text-ink">Automatische matching is
              imperfect.</strong>{" "}
              Sommige koppelingen kunnen onjuist zijn. We werken continu aan
              verbetering van het algoritme.
            </li>
            <li>
              <strong className="text-ink">Coalitiedwang.</strong> Partijen in
              een coalitie stemmen soms mee met het regeerakkoord, ook als dit
              afwijkt van hun verkiezingsprogramma. Dit nuanceren we nog niet
              automatisch.
            </li>
            <li>
              <strong className="text-ink">Enkel TK2023.</strong> Vooralsnog
              beperken we ons tot de Tweede Kamerverkiezingen van 2023.
              Historische data volgt later.
            </li>
            <li>
              <strong className="text-ink">Beloften zijn handmatig
              ge&euml;xtraheerd.</strong> Hoewel we waar mogelijk geautomatiseerde
              methoden gebruiken, zijn de initi&euml;le beloften per partij
              handmatig gevalideerd.
            </li>
          </ul>
        </div>
      </section>

      {/* ─── 7. Begrippenlijst ─────────────────────────────────── */}
      <section className="card p-6">
        <SectionHeading number={7} title="Begrippenlijst" />
        <div className="space-y-3">
          <GlossaryItem
            term="Motie"
            definition="Een verzoek van een of meer Kamerleden aan de regering. Moties zijn niet bindend maar wel politiek relevant."
          />
          <GlossaryItem
            term="Belofte"
            definition="Een concrete of directionele toezegging uit een verkiezingsprogramma, gekoppeld aan een specifiek thema."
          />
          <GlossaryItem
            term="MCS (Mandate Consistency Score)"
            definition="Een percentage dat aangeeft in hoeverre een partij stemt in lijn met haar beloften. 100% = volledig consistent."
          />
          <GlossaryItem
            term="Match confidence"
            definition="Betrouwbaarheidsscore (0–100%) van de automatische koppeling tussen een motie en een belofte."
          />
          <GlossaryItem
            term="Verwachte stemrichting"
            definition="Of een partij naar verwachting voor of tegen een gerelateerde motie zou stemmen, gebaseerd op de belofte."
          />
          <GlossaryItem
            term="Hoofdelijke stemming"
            definition="Stemming waarbij alle individuele Kamerleden hun stem uitbrengen. Levert per-lid stemdata op."
          />
          <GlossaryItem
            term="Stemming met handopsteken"
            definition="Standaardprocedure waarbij de voorzitter de uitslag vaststelt. Alleen partijniveau-data beschikbaar."
          />
        </div>
      </section>
    </main>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/10 text-[11px] font-bold text-moss">
        {number}
      </span>
      <h2 className="font-serif text-[20px] font-normal text-ink">{title}</h2>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg bg-surface-sub border border-border-subtle p-4">
      <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-1">
        Stap {step}
      </div>
      <div className="text-sm font-semibold text-ink mb-1">{title}</div>
      <p className="text-[13px] text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function SourceItem({
  name,
  url,
  description,
}: {
  name: string;
  url: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border-subtle last:border-0">
      <span className="mt-0.5 text-[10px] font-bold text-moss bg-accent-subtle px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">
        Bron
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink">{name}</div>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          {description}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] text-moss hover:text-ink transition-colors mt-0.5"
        >
          {url.replace("https://", "")}
          <svg
            width={10}
            height={10}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function GlossaryItem({
  term,
  definition,
}: {
  term: string;
  definition: string;
}) {
  return (
    <div className="py-2 border-b border-border-subtle last:border-0">
      <dt className="text-sm font-semibold text-ink">{term}</dt>
      <dd className="text-[13px] text-text-secondary leading-relaxed mt-0.5">
        {definition}
      </dd>
    </div>
  );
}
