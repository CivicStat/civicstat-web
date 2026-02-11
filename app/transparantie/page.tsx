import type { Metadata } from "next";
import { getMotions, getVotes, getPromiseStats } from "../../lib/api";

export const metadata: Metadata = {
  title: "Transparantie — CivicStat",
  description:
    "Methodologie, databronnen en algoritmes achter CivicStat. Lees hoe wij verkiezingsbeloften koppelen aan stemgedrag.",
};

export default async function TransparantiePage() {
  // Fetch live stats — gracefully fall back to "–" if API is unreachable
  const [motionsRes, votesRes, statsRes] = await Promise.allSettled([
    getMotions({ limit: 1 }),
    getVotes({ limit: 1 }),
    getPromiseStats(),
  ]);

  const motionCount =
    motionsRes.status === "fulfilled" ? motionsRes.value.total : null;
  const voteCount =
    votesRes.status === "fulfilled" ? votesRes.value.total : null;
  const promiseStats =
    statsRes.status === "fulfilled" ? statsRes.value : null;

  const fmt = (n: number | null) =>
    n != null ? n.toLocaleString("nl-NL") : "\u2013";

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
            description="Moties, stemmingen, Kamerleden en fracties worden opgehaald via de OData REST-feed van de Tweede Kamer."
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

      {/* ─── 2. Huidige data ───────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={2} title="Huidige data" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          CivicStat bevat momenteel de volgende gegevens uit de lopende
          parlementaire periode (TK2023 &amp; TK2025).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Moties" value={fmt(motionCount)} />
          <StatCard label="Stemmingen" value={fmt(voteCount)} />
          <StatCard label="Beloften" value={fmt(promiseStats?.totalPromises ?? null)} />
          <StatCard label="Partijen" value={fmt(promiseStats?.byParty.length ?? null)} />
        </div>
        <p className="text-xs text-text-tertiary mt-3">
          Data wordt elk uur automatisch bijgewerkt via de Tweede Kamer API.
        </p>
      </section>

      {/* ─── 3. Databronnen ────────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={3} title="Databronnen" />
        <div className="space-y-3">
          <SourceItem
            name="Tweede Kamer OData API (v4.0)"
            url="https://gegevensmagazijn.tweedekamer.nl"
            description="Besluiten, stemmingen, personen en fracties. Offici&euml;le bron van alle parlementaire data."
          />
          <SourceItem
            name="DNPP Repository"
            url="https://dnpprepo.ub.rug.nl"
            description="Documentatiecentrum Nederlandse Politieke Partijen, Rijksuniversiteit Groningen. Academisch archief van alle verkiezingsprogramma's."
          />
          <SourceItem
            name="Kiesraad"
            url="https://www.kiesraad.nl"
            description="Offici&euml;le verkiezingsuitslagen en fractiezetels voor verificatie."
          />
        </div>
      </section>

      {/* ─── 4. Scores & berekeningen ──────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={4} title="Scores &amp; berekeningen" />

        <div className="space-y-5 max-w-[68ch]">
          <ScoreDefinition
            term="Mandate Consistency Score (MCS)"
            definition="Meet hoe consistent een partij stemt ten opzichte van de eigen verkiezingsbeloften. 100% = altijd consistent. Berekend per thema en als totaalcijfer."
            formula="MCS = (consistent + mixed × 0.5) / scored × 100"
          />
          <ScoreDefinition
            term="Belofte-kloof"
            definition="Het verschil tussen het verwachte stemresultaat (op basis van verkiezingsbeloften × zetels) en het werkelijke stemresultaat. Een positief getal betekent meer steun dan verwacht; een negatief getal minder."
            formula="Belofte-kloof = werkelijke stemmen 'voor' − verwachte stemmen 'voor'"
          />
          <ScoreDefinition
            term="Betrouwbaarheidsscore"
            definition="Geeft aan hoe goed onderbouwd een voorspelling is. Gebaseerd op het aantal partijen waarvoor een beloftematch beschikbaar is ten opzichte van het totaal. Hoog (≥70%) = veel matches. Laag (<40%) = grotendeels afgeleid."
            formula="Betrouwbaarheid = partijen met voorspelling / totaal partijen × 100"
          />
        </div>

        <div className="mt-4 space-y-2 text-sm text-text-secondary max-w-[68ch]">
          <p>
            <strong className="text-ink">Consistent:</strong> ≥70% van de
            gerelateerde moties is in lijn met de belofte.
          </p>
          <p>
            <strong className="text-ink">Inconsistent:</strong> ≤30% van de
            gerelateerde moties is in lijn.
          </p>
          <p>
            <strong className="text-ink">Gemengd:</strong> tussen 30% en 70%.
          </p>
        </div>
      </section>

      {/* ─── 5. Matching-algoritme ─────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={5} title="Matching-algoritme" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          Moties worden automatisch gekoppeld aan beloften via een
          trefwoordalgoritme. Elke belofte heeft een set thematische
          trefwoorden; een motie wordt gekoppeld als de tekst voldoende
          overlap vertoont.
        </p>

        <div className="space-y-3 max-w-[68ch]">
          <MatchTypeItem
            label="EXPLICIET"
            labelClass="bg-accent-subtle text-moss"
            description="De motie adresseert direct dezelfde concrete toezegging als de belofte. Weegt mee met factor 1.0."
          />
          <MatchTypeItem
            label="IMPLICIET"
            labelClass="bg-surface-sub text-text-secondary"
            description="De motie valt binnen hetzelfde thema maar is geen directe vertaling. Weegt mee met factor 0.5."
          />
          <MatchTypeItem
            label="TEGENGESTELD"
            labelClass="bg-surface-sub text-text-tertiary"
            description="De motie druist in tegen de belofte. De voorspelde stemrichting wordt omgekeerd. Factor 1.0."
          />
        </div>

        <p className="text-sm text-text-secondary mt-4 max-w-[68ch]">
          Elke match krijgt een betrouwbaarheidsscore van 0 tot 1. Matches
          onder 0.3 worden niet getoond. Het huidige algoritme is <span className="font-mono text-xs bg-surface-sub px-1.5 py-0.5 rounded text-ink">keyword-overlap-v1</span>.
        </p>
      </section>

      {/* ─── 6. Specificiteit ──────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={6} title="Specificiteit van beloften" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          Elke belofte krijgt een specificiteitsclassificatie die aangeeft hoe
          concreet en toetsbaar de toezegging is.
        </p>
        <div className="space-y-3 max-w-[68ch]">
          <MatchTypeItem
            label="SPECIFIEK"
            labelClass="bg-accent-subtle text-moss"
            description="Meetbare, concrete toezegging met een duidelijk toetsbaar doel. Bijv. '100.000 woningen per jaar', 'defensie naar 2% bbp'."
          />
          <MatchTypeItem
            label="GEMIDDELD"
            labelClass="bg-surface-sub text-text-secondary"
            description="Duidelijke richting, maar geen exact meetbaar doel. Bijv. 'stikstofregels versoepelen', 'eigen risico verlagen'."
          />
          <MatchTypeItem
            label="VAAG"
            labelClass="bg-surface-sub text-text-tertiary"
            description="Abstracte toezegging die moeilijk objectief toetsbaar is. Bijv. 'investeren in onderwijs', 'de economie versterken'."
          />
        </div>
      </section>

      {/* ─── 7. Neutraliteit ───────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={7} title="Neutraliteit &amp; onpartijdigheid" />
        <div className="space-y-3 text-sm text-text-secondary max-w-[68ch]">
          <p>
            CivicStat is politiek onafhankelijk en ontvangt geen financiering
            van politieke partijen, bedrijven of belangengroepen.
          </p>
          <p>
            Alle partijen worden op dezelfde manier behandeld: dezelfde
            algoritmes, dezelfde drempelwaarden, dezelfde weergave.
            We publiceren geen rankings of &ldquo;beste partij&rdquo;-scores.
            Elke berekening is reproduceerbaar en fouten en beperkingen worden
            expliciet benoemd.
          </p>
        </div>
      </section>

      {/* ─── 8. Beperkingen ────────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={8} title="Beperkingen" />
        <div className="space-y-3 text-sm text-text-secondary max-w-[68ch]">
          <p>
            <strong className="text-ink">Moties ≠ al het beleid.</strong>{" "}
            Wetsvoorstellen, amendementen en begrotingsbesluiten worden nog
            niet meegenomen.
          </p>
          <p>
            <strong className="text-ink">Automatische matching is
            imperfect.</strong>{" "}
            Sommige koppelingen kunnen onjuist zijn. We werken continu aan
            verbetering van het algoritme.
          </p>
          <p>
            <strong className="text-ink">Coalitiedwang.</strong>{" "}
            Partijen in een coalitie stemmen soms mee met het regeerakkoord,
            ook als dit afwijkt van hun verkiezingsprogramma. Dit nuanceren
            we nog niet automatisch.
          </p>
          <p>
            <strong className="text-ink">TK2023 &amp; TK2025.</strong>{" "}
            CivicStat richt zich op de Tweede Kamerverkiezingen van 2023 en
            2025. Oudere parlementaire periodes worden nog niet meegenomen.
          </p>
          <p>
            <strong className="text-ink">Beloften zijn handmatig
            ge&euml;xtraheerd.</strong>{" "}
            Hoewel we waar mogelijk geautomatiseerde methoden gebruiken, zijn
            de initi&euml;le beloften per partij handmatig gevalideerd.
          </p>
        </div>
      </section>

      {/* ─── 9. Begrippenlijst ─────────────────────────────────── */}
      <section className="card p-6">
        <SectionHeading number={9} title="Begrippenlijst" />
        <div className="space-y-3">
          <GlossaryItem
            term="Motie"
            definition="Een verzoek van een of meer Kamerleden aan de regering. Moties worden ingediend tijdens een debat en in stemming gebracht. Ze zijn niet juridisch bindend maar politiek zwaarwegend."
          />
          <GlossaryItem
            term="Stemming"
            definition="De formele beslissing van de Kamer over een voorstel. Er zijn twee vormen: 'met handopsteken' (partijniveau) en 'hoofdelijk' (individueel per Kamerlid)."
          />
          <GlossaryItem
            term="Hoofdelijke stemming"
            definition="Stemming waarbij elk individueel Kamerlid per naam stemt. Vindt plaats op verzoek van minstens 30 leden. Alleen hierbij zijn individuele stemrecords beschikbaar."
          />
          <GlossaryItem
            term="Met handopsteken"
            definition="De standaard stemmethode. De voorzitter telt de stemmen per fractie. Alleen partijstandpunten worden geregistreerd, geen individuele stemmen."
          />
          <GlossaryItem
            term="Fractie"
            definition="Een groep Kamerleden die samen een partij vertegenwoordigen. De fractiegrootte bepaalt het aantal zetels bij stemmingen met handopsteken."
          />
          <GlossaryItem
            term="Indiener"
            definition="Het Kamerlid dat een motie indient. Medeindieners ondersteunen de motie formeel. Geregistreerd als ZaakActor in de TK API."
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
            term="Belofte-kloof"
            definition="Het verschil in zetels tussen de verwachte uitslag (op basis van beloften) en de werkelijke stemming."
          />
          <GlossaryItem
            term="Match confidence"
            definition="Betrouwbaarheidsscore (0–100%) van de automatische koppeling tussen een motie en een belofte."
          />
          <GlossaryItem
            term="Verwachte stemrichting"
            definition="Of een partij naar verwachting voor of tegen een gerelateerde motie zou stemmen, gebaseerd op de belofte."
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-sub border border-border-subtle p-4 text-center">
      <div className="text-[22px] font-serif text-ink">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary mt-0.5">
        {label}
      </div>
    </div>
  );
}

function ScoreDefinition({
  term,
  definition,
  formula,
}: {
  term: string;
  definition: string;
  formula: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink mb-1">{term}</h3>
      <p className="text-[13px] text-text-secondary leading-relaxed mb-2">
        {definition}
      </p>
      <div className="bg-surface-sub rounded-lg px-3 py-2 font-mono text-[12px] text-moss">
        {formula}
      </div>
    </div>
  );
}

function MatchTypeItem({
  label,
  labelClass,
  description,
}: {
  label: string;
  labelClass: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border-subtle last:border-0">
      <span
        className={`mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${labelClass}`}
      >
        {label}
      </span>
      <p className="text-[13px] text-text-secondary leading-relaxed">
        {description}
      </p>
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
