import type { Metadata } from "next";
import { getMotions, getVotes, getPromiseStats } from "../../lib/api";
import TransparantieNav from "./TransparantieNav";

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

      <TransparantieNav />

      {/* ─── 1. Data pipeline ──────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={1} title="Datapipeline" id="datapipeline" />
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
        <SectionHeading number={2} title="Huidige data" id="huidige-data" />
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
        <SectionHeading number={3} title="Databronnen" id="databronnen" />
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
        <SectionHeading number={4} title="Scores &amp; berekeningen" id="scores" />

        <div className="space-y-5 max-w-[68ch]">
          <ScoreDefinition
            term="Mandate Consistency Score (MCS)"
            definition="Meet hoe consistent een partij stemt ten opzichte van de eigen verkiezingsbeloften. 100% = altijd consistent. Berekend per thema en als totaalcijfer. Elke match weegt mee op basis van type en betrouwbaarheid."
            formula="MCS = &Sigma;(typeGewicht &times; confidence &times; stemuitlijn) / &Sigma;(typeGewicht &times; confidence) &times; 100"
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
            <strong className="text-ink">Matchtype-gewichten:</strong>{" "}
            EXPLICIET = 1.0, TEGENGESTELD = 1.0, IMPLICIET = 0.5. Elke match
            weegt mee op basis van zowel het type als de betrouwbaarheidsscore.
          </p>
          <p>
            <strong className="text-ink">Minimum drempel:</strong>{" "}
            Beloften met minder dan 3 gekoppelde moties worden uitgesloten
            van de scoring en gerapporteerd als &ldquo;onvoldoende data&rdquo;.
          </p>
          <p>
            <strong className="text-ink">Steekproefweging:</strong>{" "}
            Partijen met meer gekoppelde moties krijgen stabielere scores.
          </p>
        </div>

        <div className="mt-4 space-y-2 text-sm text-text-secondary max-w-[68ch]">
          <p>
            <strong className="text-ink">Consistent:</strong> ≥70% van de
            gewogen stemuitlijning is in lijn met de belofte.
          </p>
          <p>
            <strong className="text-ink">Inconsistent:</strong> ≤30% van de
            gewogen stemuitlijning is in lijn.
          </p>
          <p>
            <strong className="text-ink">Gemengd:</strong> tussen 30% en 70%.
          </p>
        </div>
      </section>

      {/* ─── 5. Periodes & koersvastheid ─────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={5} title="Periodes &amp; koersvastheid" id="periodes" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          CivicStat vergelijkt verkiezingsbeloften over meerdere parlementaire
          periodes. Momenteel ondersteunen we TK2023 en TK2025.
        </p>

        <div className="space-y-4 max-w-[68ch] mb-5">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1">Periode-filtering</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Elk verkiezingsprogramma heeft een parlementaire periode waarbinnen
              stemmingen worden meegeteld. TK2023: 6 december 2023 t/m
              29 oktober 2025. TK2025: 29 oktober 2025 t/m einde volgende
              parlementaire periode. Stemmingen buiten deze vensters worden
              uitgesloten van de MCS-berekening.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1">Koersvastheid</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              De koersvastheid meet hoe stabiel een partij scoort over
              verschillende parlementaire periodes. Een partij met een gelijke
              MCS in TK2023 en TK2025 krijgt koersvastheid 100. Een partij
              waarvan de MCS sterk schommelt, krijgt een lagere waarde.
            </p>
          </div>
        </div>

        <div className="mt-2 space-y-2 text-sm text-text-secondary max-w-[68ch]">
          <ScoreDefinition
            term="Koersvastheid"
            definition="Meet de stabiliteit van de MCS over periodes. 100 = identieke MCS in beide periodes; 0 = maximaal verschil (100 punten)."
            formula="Koersvastheid = 100 &minus; |MCS(TK2023) &minus; MCS(TK2025)|"
          />
        </div>
      </section>

      {/* ─── 6. Matching-algoritme ─────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={6} title="Matching-algoritme" id="matching" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          Moties worden automatisch gekoppeld aan beloften via een
          trefwoordalgoritme in drie stappen.
        </p>

        <div className="space-y-4 max-w-[68ch] mb-5">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1">Stap 1 — Motiefilter</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Procedurele moties worden uitgefilterd v&oacute;&oacute;r de matching.
              Dit omvat: moties van wantrouwen, moties van afkeuring, moties
              van orde, ordedebatverzoeken, schorsing/sluiting, regeling van
              werkzaamheden en spreektijdverzoeken. Dit voorkomt foutieve
              matches wanneer procedurele taal overlapt met beleidstrefwoorden.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1">Stap 2 — Trefwoordmatching</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Elke belofte heeft een set vooraf gedefinieerde thematische
              trefwoorden (vastgesteld tijdens extractie, niet algoritmisch
              afgeleid). Een motie wordt gekoppeld wanneer de titel en tekst
              voldoende overlap vertonen met de trefwoorden van een belofte.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1">Stap 3 — Betrouwbaarheidsscore</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Elke match krijgt een betrouwbaarheidsscore (0&ndash;1) op basis
              van het aantal en de specificiteit van trefwoordhits. Matches
              onder 0.3 worden verworpen.
            </p>
          </div>
        </div>

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
          Het huidige algoritme is <span className="font-mono text-xs bg-surface-sub px-1.5 py-0.5 rounded text-ink">keyword-overlap-v2</span>.
        </p>
      </section>

      {/* ─── 7. Specificiteit ──────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={7} title="Specificiteit van beloften" id="specificiteit" />
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

      {/* ─── 8. Neutraliteit ───────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={8} title="Neutraliteit &amp; onpartijdigheid" id="neutraliteit" />
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

      {/* ─── 9. Beperkingen ────────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={9} title="Beperkingen" id="beperkingen" />
        <div className="space-y-3 text-sm text-text-secondary max-w-[68ch]">
          <p>
            <strong className="text-ink">Moties ≠ al het beleid.</strong>{" "}
            Wetsvoorstellen, amendementen en begrotingsbesluiten worden nog
            niet meegenomen.
          </p>
          <p>
            <strong className="text-ink">Automatische matching is
            imperfect.</strong>{" "}
            Versie 2 bevat een procedureel motiefilter dat foutieve matches
            vermindert, en gebruikt vooraf gedefinieerde trefwoorden per belofte
            in plaats van automatische extractie. Semantische matching op basis
            van embeddings is gepland als toekomstige verbetering (v3).
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
            <strong className="text-ink">Beloften zijn LLM-ondersteund
            ge&euml;xtraheerd.</strong>{" "}
            Beloften worden ge&euml;xtraheerd uit verkiezingsprogramma&rsquo;s
            met behulp van LLM-analyse (Claude, Anthropic) en vervolgens
            handmatig gevalideerd op volledigheid en correctheid.
          </p>
        </div>
      </section>

      {/* ─── 10. Begrippenlijst ────────────────────────────────── */}
      <section className="card p-6">
        <SectionHeading number={10} title="Begrippenlijst" id="begrippenlijst" />
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
          <GlossaryItem
            term="Koersvastheid"
            definition="Score (0&ndash;100) die aangeeft hoe stabiel de MCS van een partij is over meerdere parlementaire periodes (TK2023 vs TK2025). 100 = identiek, 0 = maximaal verschil."
          />
          <GlossaryItem
            term="Parlementaire periode"
            definition="Het tijdvenster waarbinnen stemmingen worden meegeteld voor een verkiezingsprogramma. TK2023: 6 december 2023 t/m 29 oktober 2025. TK2025: vanaf 29 oktober 2025."
          />
        </div>
      </section>
    </main>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function SectionHeading({ number, title, id }: { number: number; title: string; id?: string }) {
  return (
    <div id={id} className="flex items-center gap-2.5 mb-3 scroll-mt-20">
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
