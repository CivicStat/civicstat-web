import type { Metadata } from "next";
import { getMotions, getVotes, getPromiseStats, getPlatformStats, getLangfuseMetrics, getLangfuseTraces } from "../../lib/api";
import TransparantieNav from "./TransparantieNav";

export const metadata: Metadata = {
  title: "Transparantie — CivicStat",
  description:
    "Methodologie, databronnen en algoritmes achter CivicStat. Lees hoe wij verkiezingsbeloften koppelen aan stemgedrag.",
};

export default async function TransparantiePage() {
  // Fetch live stats — gracefully fall back to "–" if API is unreachable
  const [motionsRes, votesRes, statsRes, platformRes, langfuseMetricsRes, langfuseTracesRes] = await Promise.allSettled([
    getMotions({ limit: 1 }),
    getVotes({ limit: 1 }),
    getPromiseStats(),
    getPlatformStats(),
    getLangfuseMetrics(),
    getLangfuseTraces({ limit: 20 }),
  ]);

  const motionCount =
    motionsRes.status === "fulfilled" ? motionsRes.value.total : null;
  const voteCount =
    votesRes.status === "fulfilled" ? votesRes.value.total : null;
  const promiseStats =
    statsRes.status === "fulfilled" ? statsRes.value : null;
  const platformStats =
    platformRes.status === "fulfilled" ? platformRes.value : null;
  const langfuseMetrics =
    langfuseMetricsRes.status === "fulfilled" ? langfuseMetricsRes.value : null;
  const langfuseTraces =
    langfuseTracesRes.status === "fulfilled" ? langfuseTracesRes.value : null;

  const fmt = (n: number | null | undefined) =>
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
            description="Beloften uit verkiezingsprogramma's worden automatisch gekoppeld aan moties via trefwoordanalyse en semantische AI-matching (Claude)."
          />
          <StepCard
            step="3"
            title="Scoring"
            description="Per belofte berekenen we de Mandate Consistency Score op basis van het stemgedrag bij gerelateerde moties."
          />
        </div>
      </section>

      {/* ─── 2. AI in CivicStat ─────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={2} title="Hoe gebruikt CivicStat AI?" id="ai-methodologie" />
        <p className="text-sm text-text-secondary leading-relaxed mb-5 max-w-[68ch]">
          CivicStat gebruikt AI (Anthropic Claude) op twee plekken in de
          analysepipeline: bij het extraheren van beloften uit
          verkiezingsprogramma&rsquo;s, en bij het koppelen van beloften aan
          Kamermoties. In beide gevallen werkt de AI als een gestructureerde
          analysator &mdash; niet als beoordelaar. Het model geeft geen oordeel
          over partijen en wordt expliciet ge&iuml;nstrueerd politiek neutraal te
          werken.
        </p>

        {/* Subsection: Belofte-extractie */}
        <div className="space-y-5 max-w-[68ch] mb-6">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1.5">Belofte-extractie</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed mb-2">
              Verkiezingsprogramma&rsquo;s (PDF&rsquo;s van het DNPP Repository,
              Rijksuniversiteit Groningen) worden verwerkt door Claude om
              individuele, toetsbare beloften te extraheren.
            </p>
            <div className="space-y-2 text-[13px] text-text-secondary leading-relaxed">
              <p>
                <strong className="text-ink">Input:</strong>{" "}
                Ruwe tekstpassages uit offici&euml;le verkiezingsprogramma&rsquo;s.
              </p>
              <p>
                <strong className="text-ink">Opdracht aan het model:</strong>{" "}
                Extraheer concrete, toetsbare toezeggingen. Classificeer elk op
                thema (17 thema&rsquo;s), specificiteit (SPECIFIEK / GEMIDDELD / VAAG)
                en toetsbaarheid.
              </p>
              <p>
                <strong className="text-ink">Wat het model niet doet:</strong>{" "}
                Het model beoordeelt niet of beloften wenselijk, haalbaar of
                verstandig zijn. Het extraheert alleen wat er staat.
              </p>
              <p>
                <strong className="text-ink">Kwaliteitscontrole:</strong>{" "}
                Ge&euml;xtraheerde beloften worden opgeslagen met het label{" "}
                <span className="font-mono text-xs bg-surface-sub px-1 py-0.5 rounded text-ink">LLM_EXTRACTED</span>.
                Het totale aantal per partij wordt gemonitord op inflatie.
              </p>
            </div>
          </div>

          {/* Subsection: Semantische koppeling */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1.5">Semantische koppeling</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed mb-3">
              Voor elke verkiezingsbelofte zoekt CivicStat relevante Kamermoties.
              Dit gebeurt in twee stappen:
            </p>

            <div className="space-y-3 mb-4">
              <div className="rounded-lg bg-surface-sub border border-border-subtle p-3">
                <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-1">
                  Stap 1 &mdash; Voorselectie
                </div>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  Kandidaat-moties worden geselecteerd op basis van gedeelde
                  trefwoorden en thema. Dit levert per belofte 30&ndash;80
                  kandidaat-moties op uit het totaal van{" "}
                  {fmt(platformStats?.motions ?? motionCount)}+ moties.
                </p>
              </div>
              <div className="rounded-lg bg-surface-sub border border-border-subtle p-3">
                <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-1">
                  Stap 2 &mdash; AI-beoordeling
                </div>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  Een AI-model (Claude Sonnet) beoordeelt elke kandidaat-motie op
                  relevantie voor de belofte. Per motie geeft het model een
                  classificatie, betrouwbaarheidsscore, voorspelde stemrichting en
                  een beknopte motivatie in het Nederlands.
                </p>
              </div>
            </div>

            {/* Example: what the model sees */}
            <h4 className="text-[13px] font-semibold text-ink mb-2">Wat het model te zien krijgt</h4>
            <div className="rounded-lg border border-border-subtle overflow-hidden mb-4">
              <div className="bg-surface-sub px-4 py-3 border-b border-border-subtle">
                <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">
                  Belofte (VVD)
                </div>
                <p className="text-[13px] text-ink leading-relaxed italic">
                  &ldquo;Defensie-uitgaven structureel naar NAVO-norm van 2% bbp&rdquo;
                </p>
              </div>
              <div className="bg-surface-sub px-4 py-3 border-b border-border-subtle">
                <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">
                  Kandidaat-motie
                </div>
                <p className="text-[13px] text-ink leading-relaxed italic">
                  &ldquo;Motie over structurele verhoging defensiebudget naar 2% bbp&rdquo;
                </p>
              </div>
              <div className="px-4 py-3 bg-white">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-accent-subtle text-moss">
                    Expliciet
                  </span>
                  <span className="text-[12px] text-text-secondary">confidence 0.94</span>
                  <span className="text-[12px] text-text-secondary">&middot;</span>
                  <span className="text-[12px] text-text-secondary">VOOR</span>
                </div>
                <p className="text-[12px] text-text-secondary italic leading-relaxed">
                  &ldquo;Motie roept expliciet op tot structurele verhoging naar
                  2% bbp &mdash; identiek aan de belofte van de VVD.&rdquo;
                </p>
              </div>
            </div>

            {/* Classification table */}
            <h4 className="text-[13px] font-semibold text-ink mb-2">Classificatie-uitleg</h4>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="py-2 pr-3 text-left font-semibold text-ink">Type</th>
                    <th className="py-2 pr-3 text-left font-semibold text-ink">Betekenis</th>
                    <th className="py-2 pr-3 text-left font-semibold text-ink">Voorbeeld</th>
                    <th className="py-2 text-left font-semibold text-ink">Gewicht</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-3">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-accent-subtle text-moss">
                        Expliciet
                      </span>
                    </td>
                    <td className="py-2 pr-3">Motie gaat over exact hetzelfde punt als de belofte</td>
                    <td className="py-2 pr-3 text-[11px] italic">&ldquo;2% bbp defensie&rdquo; &#8596; &ldquo;NAVO-norm 2% bbp&rdquo;</td>
                    <td className="py-2 font-mono">1.0</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-3">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-surface-sub text-text-secondary">
                        Impliciet
                      </span>
                    </td>
                    <td className="py-2 pr-3">Motie valt in hetzelfde thema maar niet over exact hetzelfde punt</td>
                    <td className="py-2 pr-3 text-[11px] italic">&ldquo;F-35 onderhoud&rdquo; &#8596; &ldquo;defensie versterken&rdquo;</td>
                    <td className="py-2 font-mono">0.5</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2 pr-3">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-surface-sub text-text-tertiary">
                        Tegengesteld
                      </span>
                    </td>
                    <td className="py-2 pr-3">Motie druist in tegen de belofte</td>
                    <td className="py-2 pr-3 text-[11px] italic">&ldquo;defensiebudget korten&rdquo; &#8596; &ldquo;defensie naar 2% bbp&rdquo;</td>
                    <td className="py-2 font-mono">1.0 <span className="text-[10px] text-text-tertiary">(omgekeerd)</span></td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 text-text-tertiary text-[11px]">Geen match</td>
                    <td className="py-2 pr-3">Geen relevante verbinding</td>
                    <td className="py-2 pr-3 text-text-tertiary">&mdash;</td>
                    <td className="py-2 text-text-tertiary">Niet opgeslagen</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Neutrality instruction */}
            <h4 className="text-[13px] font-semibold text-ink mb-2">Neutraliteitsinstructie aan het model</h4>
            <div className="bg-surface-sub border-l-2 border-moss/30 rounded-r-lg px-4 py-3 mb-4">
              <p className="text-[12px] text-text-secondary leading-relaxed italic">
                &ldquo;Je bent een neutrale politieke analist. Je beoordeelt of
                moties relevant zijn voor een belofte. Je geeft geen oordeel over
                de wenselijkheid van beloften of moties. Gebruik EXPLICIET alleen
                als de motie echt over hetzelfde concrete punt gaat.&rdquo;
              </p>
            </div>

            {/* Confidence indicator */}
            <p className="text-[13px] text-text-secondary leading-relaxed">
              <strong className="text-ink">Betrouwbaarheidsindicator:</strong>{" "}
              Niet elke koppeling is even sterk. CivicStat toont bij elke score
              hoeveel beloften daadwerkelijk gekoppeld konden worden aan moties.
              Een score op basis van 35 van 210 beloften is minder betrouwbaar dan
              een score op basis van 150 van 200 beloften. Deze informatie is
              altijd zichtbaar naast de MCS-score.
            </p>
          </div>

          {/* Subsection: Wat CivicStat NIET doet */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1.5">Wat CivicStat niet doet</h3>
            <div className="space-y-2 text-[13px] text-text-secondary leading-relaxed">
              <p>
                <strong className="text-ink">Geen ranking of oordeel</strong>{" "}
                &mdash; CivicStat rangschikt partijen niet van
                &ldquo;betrouwbaar&rdquo; tot &ldquo;onbetrouwbaar&rdquo;.
                Scores zijn feitelijke consistentie-metingen, geen waardeoordelen.
              </p>
              <p>
                <strong className="text-ink">Geen campagneadvies</strong>{" "}
                &mdash; CivicStat zegt niet op welke partij je moet stemmen.
              </p>
              <p>
                <strong className="text-ink">Geen AI-gegenereerde conclusies</strong>{" "}
                &mdash; Het AI-model beoordeelt individuele belofte-motie
                koppelingen. De MCS-score wordt berekend met een vaste formule op
                basis van die koppelingen &mdash; niet door het AI-model.
              </p>
              <p>
                <strong className="text-ink">Geen verborgen weging</strong>{" "}
                &mdash; Elke koppeling is traceerbaar. Gebruikers kunnen
                doorklikken van score &#8594; belofte &#8594; motie &#8594; stemuitslag
                &#8594; bron.
              </p>
            </div>
          </div>

          {/* Subsection: Beperkingen en doorontwikkeling */}
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1.5">AI-beperkingen</h3>
            <div className="space-y-2 text-[13px] text-text-secondary leading-relaxed">
              <p>
                <strong className="text-ink">Trefwoord-voorselectie</strong>{" "}
                &mdash; De voorselectie op trefwoorden kan relevante moties missen
                als ze over hetzelfde onderwerp gaan maar andere woorden
                gebruiken. De semantische beoordeling (stap 2) vangt dit
                gedeeltelijk op.
              </p>
              <p>
                <strong className="text-ink">Model-bias</strong>{" "}
                &mdash; Hoewel Claude ge&iuml;nstrueerd wordt neutraal te werken,
                kan elk AI-model subtiele bias bevatten. Daarom publiceert
                CivicStat de exacte instructie en is elke koppeling individueel
                controleerbaar.
              </p>
              <p>
                <strong className="text-ink">Belofte-kwaliteit</strong>{" "}
                &mdash; De kwaliteit van de MCS hangt af van de kwaliteit van de
                ge&euml;xtraheerde beloften. Vage beloften leveren vagere
                koppelingen op.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-tertiary max-w-[68ch]">
          CivicStat gebruikt{" "}
          <a
            href="https://docs.anthropic.com/en/docs/about-claude/models"
            target="_blank"
            rel="noopener noreferrer"
            className="text-moss hover:text-ink transition-colors"
          >
            Claude Sonnet (Anthropic)
          </a>{" "}
          voor semantische analyse. Het model draait met API-toegang en verwerkt
          uitsluitend publieke parlementaire data.
        </p>
      </section>

      {/* ─── 3. Huidige data ───────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={3} title="Huidige data" id="huidige-data" />
        <p className="text-sm text-text-secondary leading-relaxed mb-4 max-w-[68ch]">
          CivicStat bevat momenteel de volgende gegevens uit de lopende
          parlementaire periode (TK2023 &amp; TK2025).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Moties" value={fmt(platformStats?.motions ?? motionCount)} />
          <StatCard label="Stemmingen" value={fmt(platformStats?.votes ?? voteCount)} />
          <StatCard label="Beloften" value={fmt(platformStats?.promises ?? promiseStats?.totalPromises)} />
          <StatCard label="Koppelingen" value={fmt(platformStats?.matches)} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <StatCard label="Partijen" value={fmt(platformStats?.parties ?? promiseStats?.byParty.length)} />
          <StatCard label="Kamerleden" value={fmt(platformStats?.members)} />
          <StatCard label="Programma's" value={fmt(platformStats?.programs)} />
          <StatCard label="Stemrecords" value={fmt(platformStats?.voteRecords)} />
        </div>
        <p className="text-xs text-text-tertiary mt-3">
          Data wordt elk uur automatisch bijgewerkt via de Tweede Kamer API.
          {platformStats?.lastUpdated && (
            <> Laatste update: {new Date(platformStats.lastUpdated).toLocaleString("nl-NL", { dateStyle: "long", timeStyle: "short" })}.</>
          )}
        </p>
      </section>

      {/* ─── 4. Databronnen ────────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={4} title="Databronnen" id="databronnen" />
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

      {/* ─── 5. Scores & berekeningen ──────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={5} title="Scores &amp; berekeningen" id="scores" />

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

      {/* ─── 6. Periodes & koersvastheid ─────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={6} title="Periodes &amp; koersvastheid" id="periodes" />
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

      {/* ─── 7. Matching-algoritme ─────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={7} title="Matching-algoritme" id="matching" />
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
          Koppelingen worden gemaakt via drie methodes: trefwoordanalyse,
          semantische AI-matching en handmatige validatie.
        </p>

        {platformStats?.matches != null && platformStats.matches > 0 && (
          <div className="mt-4 max-w-[68ch]">
            <h3 className="text-sm font-semibold text-ink mb-2">Matchmethoden</h3>
            <div className="grid grid-cols-3 gap-3">
              <MethodCard
                method="Trefwoord"
                code="keyword-overlap-v2"
                count={platformStats.matchesByMethod.keyword}
                total={platformStats.matches}
              />
              <MethodCard
                method="Semantisch"
                code="semantic-claude"
                count={platformStats.matchesByMethod.semantic}
                total={platformStats.matches}
              />
              <MethodCard
                method="Handmatig"
                code="manual"
                count={platformStats.matchesByMethod.manual}
                total={platformStats.matches}
              />
            </div>
          </div>
        )}
      </section>

      {/* ─── 8. Specificiteit ──────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={8} title="Specificiteit van beloften" id="specificiteit" />
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

      {/* ─── 9. Neutraliteit ───────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={9} title="Neutraliteit &amp; onpartijdigheid" id="neutraliteit" />
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

      {/* ─── 10. Beperkingen ────────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={10} title="Beperkingen" id="beperkingen" />
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
            in plaats van automatische extractie. Aanvullend wordt semantische
            matching met Claude AI ingezet voor diepere inhoudelijke beoordeling.
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

      {/* ─── 11. AI-logboek ────────────────────────────────────── */}
      <section className="card p-6 mb-5">
        <SectionHeading number={11} title="AI-logboek" id="ai-logboek" />
        <p className="text-sm text-text-secondary leading-relaxed mb-5 max-w-[68ch]">
          Elke AI-aanroep die CivicStat doet wordt gelogd in{" "}
          <a
            href="https://langfuse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-moss hover:text-ink transition-colors"
          >
            Langfuse
          </a>
          , een open-source observability-platform. Alle traces zijn publiek
          toegankelijk zodat journalisten, onderzoekers en ge&iuml;nteresseerden
          exact kunnen zien welke AI-modellen worden gebruikt, wat ze te zien
          krijgen, en wat ze terugsturen.
        </p>

        {/* Metric cards */}
        {langfuseMetrics && langfuseMetrics.totalTraces > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <StatCard label="AI-aanroepen" value={fmt(langfuseMetrics.totalTraces)} />
              <StatCard
                label="Totale kosten"
                value={langfuseMetrics.totalCost != null
                  ? `\u20AC${langfuseMetrics.totalCost.toFixed(2)}`
                  : "\u2013"}
              />
              <StatCard
                label="Input tokens"
                value={langfuseMetrics.totalInputTokens != null
                  ? (langfuseMetrics.totalInputTokens / 1_000_000).toFixed(1) + "M"
                  : "\u2013"}
              />
              <StatCard
                label="Output tokens"
                value={langfuseMetrics.totalOutputTokens != null
                  ? (langfuseMetrics.totalOutputTokens / 1_000_000).toFixed(1) + "M"
                  : "\u2013"}
              />
            </div>

            {/* Trace table */}
            {langfuseTraces && langfuseTraces.traces.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-ink mb-2">
                  Recente AI-aanroepen
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px] border-collapse">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="py-2 pr-3 text-left font-semibold text-ink">Datum</th>
                        <th className="py-2 pr-3 text-left font-semibold text-ink">Taak</th>
                        <th className="py-2 pr-3 text-left font-semibold text-ink">Tags</th>
                        <th className="py-2 pr-3 text-right font-semibold text-ink">Tokens</th>
                        <th className="py-2 pr-3 text-right font-semibold text-ink">Kosten</th>
                        <th className="py-2 text-right font-semibold text-ink"></th>
                      </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                      {langfuseTraces.traces.map((trace) => (
                        <tr key={trace.id} className="border-b border-border-subtle last:border-0">
                          <td className="py-2 pr-3 whitespace-nowrap">
                            {new Date(trace.timestamp).toLocaleDateString("nl-NL", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-2 pr-3 font-medium text-ink">
                            {trace.name}
                          </td>
                          <td className="py-2 pr-3">
                            <div className="flex gap-1 flex-wrap">
                              {trace.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-surface-sub text-text-tertiary"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 pr-3 text-right font-mono">
                            {(trace.inputTokens + trace.outputTokens).toLocaleString("nl-NL")}
                          </td>
                          <td className="py-2 pr-3 text-right font-mono">
                            {trace.totalCost > 0
                              ? `$${trace.totalCost.toFixed(4)}`
                              : "\u2013"}
                          </td>
                          <td className="py-2 text-right">
                            <a
                              href={trace.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-moss hover:text-ink transition-colors text-[11px] whitespace-nowrap"
                            >
                              Bekijk trace &rarr;
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <a
              href="https://cloud.langfuse.com/project/cmlnvh26d0220ad077c82ujek"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-moss hover:text-ink transition-colors"
            >
              Alle traces bekijken in Langfuse &rarr;
            </a>
          </>
        ) : (
          <p className="text-xs text-text-tertiary">
            AI-logboekgegevens worden geladen zodra de eerste traces zijn verwerkt.
          </p>
        )}
      </section>

      {/* ─── 12. Begrippenlijst ────────────────────────────────── */}
      <section className="card p-6">
        <SectionHeading number={12} title="Begrippenlijst" id="begrippenlijst" />
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

function MethodCard({
  method,
  code,
  count,
  total,
}: {
  method: string;
  code: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="rounded-lg bg-surface-sub border border-border-subtle p-3">
      <div className="text-sm font-semibold text-ink">{method}</div>
      <div className="text-[11px] font-mono text-text-tertiary mb-2">{code}</div>
      <div className="text-[20px] font-serif text-ink">
        {count.toLocaleString("nl-NL")}
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-border-subtle overflow-hidden">
        <div
          className="h-full rounded-full bg-moss transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[11px] text-text-tertiary mt-1">{pct}% van totaal</div>
    </div>
  );
}
