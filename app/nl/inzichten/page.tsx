import Link from "next/link";
import { getInsights } from "../../../lib/api";
import { routes } from "../../../lib/routes";
import InsightCards from "./InsightCards";

export const revalidate = 3600;

export const metadata = {
  title: "Inzichten — Wat vertelt de data? — CivicStat",
  description:
    "Automatisch ontdekte patronen: beloftehouders, themakloof, rebellen, coalitieverwatering, stemparadoxen, onverwachte bondgenoten, coalitiescheuren, stijgers & dalers, en stille consensus.",
};

export default async function InzichtenPage() {
  const data = await getInsights();

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Inzichten
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-2 max-w-[700px]">
        Wat vertelt de data? Automatisch berekende bevindingen op basis van
        stemgedrag, verkiezingsbeloften en coalitiedynamiek.
      </p>

      {data ? (
        <>
          <InsightCards data={data} />

          <div className="mt-8 card px-5 py-4">
            <h3 className="text-[13px] font-semibold text-ink mb-1">
              Over deze analyse
            </h3>
            <p className="text-[12px] text-text-secondary leading-relaxed">
              Alle inzichten worden automatisch berekend op basis van openbare
              stemdata en verkiezingsprogramma&apos;s. Er wordt geen politiek oordeel
              geveld — de patronen tonen enkel hoe partijen feitelijk stemmen
              ten opzichte van hun beloften.
            </p>
            {data.generatedAt && (
              <p className="text-[11px] text-text-tertiary mt-2">
                Laatst bijgewerkt:{" "}
                {new Date(data.generatedAt).toLocaleString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API. Probeer het later opnieuw.
        </div>
      )}

      <div className="mt-4">
        <Link
          href={routes.home}
          className="text-[12px] text-text-tertiary hover:text-moss transition-colors"
        >
          &larr; Terug naar overzicht
        </Link>
      </div>
    </div>
  );
}
