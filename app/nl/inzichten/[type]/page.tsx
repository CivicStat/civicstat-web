import { notFound } from "next/navigation";
import Link from "next/link";
import { getInsights } from "../../../../lib/api";
import { routes } from "../../../../lib/routes";
import {
  INSIGHT_TYPES,
  BeloftehoudersPanel,
  ParadoxPanel,
  ThemakloofPanel,
  VerwateringPanel,
  RebellenPanel,
  ScheurenPanel,
  BedgenotenPanel,
  BewegingPanel,
  ConsensusPanel,
} from "../InsightPanels";

export const revalidate = 3600;

const VALID_TYPES = new Set([
  "beloftehouders",
  "paradox",
  "themakloof",
  "verwatering",
  "rebellen",
  "scheuren",
  "bedgenoten",
  "beweging",
  "consensus",
]);

export async function generateStaticParams() {
  return [...VALID_TYPES].map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: { type: string };
}) {
  const meta = INSIGHT_TYPES.find((t) => t.id === params.type);
  if (!meta) return {};

  return {
    title: `${meta.label} — Inzichten — CivicStat`,
    description: `${meta.subtitle}. ${meta.description}`,
    openGraph: {
      title: `${meta.label} — CivicStat Inzichten`,
      description: meta.description,
      url: `https://civicstat.nl/nl/inzichten/${params.type}`,
      siteName: "CivicStat",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.label} — CivicStat Inzichten`,
      description: meta.description,
    },
  };
}

export default async function InsightDetailPage({
  params,
}: {
  params: { type: string };
}) {
  if (!VALID_TYPES.has(params.type)) notFound();

  const meta = INSIGHT_TYPES.find((t) => t.id === params.type)!;
  const data = await getInsights();

  return (
    <div className="mx-auto max-w-[900px] px-5 py-7 pb-24">
      {/* Breadcrumb */}
      <nav className="mb-5 text-[12px] text-text-tertiary">
        <Link
          href={routes.inzichten}
          className="hover:text-moss transition-colors"
        >
          Inzichten
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{meta.label}</span>
      </nav>

      <h1 className="font-serif text-[26px] font-normal text-ink mb-1.5">
        {meta.label}
      </h1>
      <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-[640px]">
        {meta.description}
      </p>

      {data ? (
        <>
          {params.type === "beloftehouders" && (
            <BeloftehoudersPanel items={data.beloftehouders ?? []} />
          )}
          {params.type === "paradox" && (
            <ParadoxPanel items={data.paradox ?? []} />
          )}
          {params.type === "themakloof" && (
            <ThemakloofPanel items={data.themakloof ?? []} />
          )}
          {params.type === "verwatering" && (
            <VerwateringPanel items={data.verwatering ?? []} />
          )}
          {params.type === "rebellen" && (
            <RebellenPanel items={data.rebellen ?? []} />
          )}
          {params.type === "scheuren" && (
            <ScheurenPanel items={data.scheuren ?? []} />
          )}
          {params.type === "bedgenoten" && (
            <BedgenotenPanel items={data.bedgenoten ?? []} />
          )}
          {params.type === "beweging" && (
            <BewegingPanel items={data.beweging ?? []} />
          )}
          {params.type === "consensus" && (
            <ConsensusPanel items={data.consensus ?? []} />
          )}

          {data.generatedAt && (
            <p className="mt-8 text-[11px] text-text-tertiary">
              Bijgewerkt:{" "}
              {new Date(data.generatedAt).toLocaleString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </>
      ) : (
        <div className="card p-6 text-sm text-text-secondary">
          Kon geen verbinding maken met de API. Probeer het later opnieuw.
        </div>
      )}
    </div>
  );
}
