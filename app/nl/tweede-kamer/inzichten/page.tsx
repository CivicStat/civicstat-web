import Link from "next/link";
import { getInsights } from "../../../../lib/api";
import InsightTabs from "./InsightTabs";
import { routes } from "../../../../lib/routes";

export const revalidate = 3600; // ISR: re-generate at most every hour

export const metadata = {
  title: "Inzichten — CivicStat",
  description:
    "Automatisch ontdekte stempatronen: onverwachte bondgenoten, coalitiescheuren, stijgers & dalers, en stille consensus.",
};

export default async function InzichtenPage() {
  const data = await getInsights();

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-7 pb-24">
      {/* Header */}
      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        Inzichten
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-[700px]">
        Automatisch ontdekte patronen in stemgedrag — gebaseerd op de 500 meest
        recente stemmingen in de Tweede Kamer.
      </p>

      {data ? (
        <>
          <InsightTabs
            bedgenoten={data.bedgenoten}
            scheuren={data.scheuren}
            beweging={data.beweging}
            consensus={data.consensus}
          />

          {/* Methodology note */}
          <div className="mt-8 card px-5 py-4">
            <h3 className="text-[13px] font-semibold text-ink mb-1">
              Over deze analyse
            </h3>
            <p className="text-[12px] text-text-secondary leading-relaxed">
              Alle inzichten worden automatisch berekend op basis van openbare
              stemdata van de Tweede Kamer. Er wordt geen politiek oordeel
              geveld — de patronen tonen enkel hoe partijen feitelijk stemmen.
              De analyse is beperkt tot de 500 meest recente stemmingen met
              uitslag (aangenomen of verworpen).
            </p>
            {data.generatedAt && (
              <p className="text-[11px] text-text-tertiary mt-2">
                Laatst bijgewerkt: {new Date(data.generatedAt).toLocaleString("nl-NL", {
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

      {/* Back link */}
      <div className="mt-4">
        <Link
          href={routes.tk.root}
          className="text-[12px] text-text-tertiary hover:text-moss transition-colors"
        >
          ← Terug naar overzicht
        </Link>
      </div>
    </div>
  );
}
