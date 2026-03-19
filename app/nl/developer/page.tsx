import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer API — CivicStat",
  description:
    "Toegang tot CivicStat data via de publieke API v2. Parlementaire stemdata, verkiezingsbeloften en scorecards — gratis beschikbaar onder CC BY 4.0.",
};

const API_BASE = "https://civicstat-api.fly.dev";

const publicEndpoints = [
  {
    method: "GET",
    path: "/v2/parliaments",
    description: "Alle parlementen (Tweede Kamer, gemeenteraden)",
  },
  {
    method: "GET",
    path: "/v2/parties",
    description: "Alle partijen, optioneel gefilterd op parlement",
  },
  {
    method: "GET",
    path: "/v2/parliament/:slug/scorecards",
    description: "MCS-scorecards per parlement",
  },
  {
    method: "GET",
    path: "/v2/insights",
    description: "Automatisch berekende inzichten",
  },
  {
    method: "GET",
    path: "/v2/search?q=...",
    description: "Zoek partijen, moties, beloften en Kamerleden",
  },
  {
    method: "GET",
    path: "/v2/stats",
    description: "Platformstatistieken (aantallen moties, beloften, etc.)",
  },
];

const authEndpoints = [
  {
    method: "GET",
    path: "/v2/promises",
    description: "Beloften met matchdata (partij, jaar, thema filters)",
  },
  {
    method: "GET",
    path: "/v2/promises/:id",
    description: "Enkelvoudige belofte met alle gekoppelde moties",
  },
  {
    method: "GET",
    path: "/v2/motions",
    description: "Moties doorzoeken (query, partij, soort, parlement)",
  },
  {
    method: "GET",
    path: "/v2/motions/:id",
    description: "Motiedetails met stemresultaten",
  },
  {
    method: "GET",
    path: "/v2/votes",
    description: "Stemmingen opvragen",
  },
  {
    method: "GET",
    path: "/v2/votes/:id",
    description: "Stemdetails per partij",
  },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-surface-secondary dark:bg-neutral-900 border border-border rounded-md p-4 overflow-x-auto text-[12px] leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function EndpointRow({
  method,
  path,
  description,
}: {
  method: string;
  path: string;
  description: string;
}) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="py-2 pr-3 text-[12px] font-mono font-semibold text-moss whitespace-nowrap">
        {method}
      </td>
      <td className="py-2 pr-3 text-[12px] font-mono whitespace-nowrap">
        {path}
      </td>
      <td className="py-2 text-[12px] text-text-secondary">{description}</td>
    </tr>
  );
}

export default function DeveloperPage() {
  return (
    <div className="mx-auto max-w-[800px] px-5 py-7 pb-24">
      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Developer API
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-[700px]">
        CivicStat stelt parlementaire data gratis beschikbaar via een publieke
        API. Gebruik onze data voor onderzoek, journalistiek of civic tech
        projecten.
      </p>

      {/* Quick start */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Snel beginnen
        </h2>
        <p className="text-[13px] text-text-secondary mb-3">
          Publieke endpoints zijn direct toegankelijk zonder authenticatie:
        </p>
        <CodeBlock>{`curl ${API_BASE}/v2/parties`}</CodeBlock>
        <p className="text-[12px] text-text-tertiary mt-2">
          Response: JSON met alle partijen en hun metadata.
        </p>
      </section>

      {/* Public endpoints */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Publieke endpoints
        </h2>
        <p className="text-[13px] text-text-secondary mb-3">
          Geen API-sleutel vereist. Rate limit: 100 verzoeken per minuut.
        </p>
        <div className="card overflow-x-auto">
          <table className="w-full">
            <tbody>
              {publicEndpoints.map((ep) => (
                <EndpointRow key={ep.path} {...ep} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Authenticated endpoints */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Geauthenticeerde endpoints
        </h2>
        <p className="text-[13px] text-text-secondary mb-3">
          Voor volledige toegang tot beloftedata, matchresultaten en ruwe
          stemdata is een API-sleutel vereist.
        </p>
        <div className="card overflow-x-auto">
          <table className="w-full">
            <tbody>
              {authEndpoints.map((ep) => (
                <EndpointRow key={ep.path} {...ep} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Authentication */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Authenticatie
        </h2>
        <p className="text-[13px] text-text-secondary mb-3">
          Voeg je API-sleutel toe via de <code className="text-[12px] bg-surface-secondary px-1 py-0.5 rounded">X-API-Key</code> header:
        </p>
        <CodeBlock>{`curl -H "X-API-Key: csk_jouw_sleutel" \\
  ${API_BASE}/v2/promises`}</CodeBlock>
        <p className="text-[13px] text-text-secondary mt-3">
          Alternatieven: <code className="text-[12px] bg-surface-secondary px-1 py-0.5 rounded">Authorization: Bearer csk_...</code> header
          of <code className="text-[12px] bg-surface-secondary px-1 py-0.5 rounded">?api_key=csk_...</code> query parameter.
        </p>
      </section>

      {/* Code examples */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Voorbeelden
        </h2>

        <h3 className="text-[13px] font-semibold text-ink mt-4 mb-2">
          Python
        </h3>
        <CodeBlock>{`import requests

# Publieke data (geen sleutel nodig)
parties = requests.get("${API_BASE}/v2/parties").json()
for party in parties:
    print(party["name"], party.get("abbreviation", ""))

# Geauthenticeerde data
headers = {"X-API-Key": "csk_jouw_sleutel"}
promises = requests.get(
    "${API_BASE}/v2/promises",
    params={"party": "VVD", "theme": "KLIMAAT"},
    headers=headers,
).json()`}</CodeBlock>

        <h3 className="text-[13px] font-semibold text-ink mt-4 mb-2">
          JavaScript
        </h3>
        <CodeBlock>{`// Publieke data
const parties = await fetch("${API_BASE}/v2/parties")
  .then(r => r.json());

// Geauthenticeerde data
const promises = await fetch(
  "${API_BASE}/v2/promises?party=VVD&theme=KLIMAAT",
  { headers: { "X-API-Key": "csk_jouw_sleutel" } }
).then(r => r.json());`}</CodeBlock>
      </section>

      {/* Rate limiting */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Rate limiting
        </h2>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          Publieke endpoints: 100 verzoeken per minuut. Geauthenticeerde
          endpoints: 1.000 verzoeken per minuut. Bij overschrijding ontvang je
          een <code className="text-[12px] bg-surface-secondary px-1 py-0.5 rounded">429 Too Many Requests</code> response.
          Wacht 60 seconden en probeer het opnieuw.
        </p>
      </section>

      {/* Interactive docs */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Interactieve documentatie
        </h2>
        <p className="text-[13px] text-text-secondary mb-3">
          Bekijk de volledige OpenAPI-specificatie en test endpoints direct in de browser:
        </p>
        <a
          href={`${API_BASE}/v2/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[13px] font-medium text-moss hover:underline"
        >
          Swagger UI openen &rarr;
        </a>
      </section>

      {/* License */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Licentie
        </h2>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          Alle data is beschikbaar onder{" "}
          <strong>CC BY 4.0</strong>. Vrij te gebruiken met bronvermelding:
        </p>
        <CodeBlock>{`Data: CivicStat.nl (CC BY 4.0)`}</CodeBlock>
      </section>

      {/* API key request */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          API-sleutel aanvragen
        </h2>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          Stuur een e-mail naar{" "}
          <a
            href="mailto:api@civicstat.nl"
            className="text-moss hover:underline"
          >
            api@civicstat.nl
          </a>{" "}
          met je naam, organisatie en beoogd gebruik. We streven ernaar binnen 24
          uur te reageren.
        </p>
      </section>

      {/* Support */}
      <section className="mb-8">
        <h2 className="text-[16px] font-semibold text-ink mb-3">
          Support
        </h2>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          Bugs en feature requests kunnen gemeld worden via{" "}
          <a
            href="https://github.com/civic-labs/civicstat/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-moss hover:underline"
          >
            GitHub Issues
          </a>
          .
        </p>
      </section>

      <div className="mt-4">
        <Link
          href="/"
          className="text-[12px] text-text-tertiary hover:text-moss transition-colors"
        >
          &larr; Terug naar overzicht
        </Link>
      </div>
    </div>
  );
}
