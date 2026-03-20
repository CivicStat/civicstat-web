import { ImageResponse } from "next/og";
import { getFormation } from "../../../../lib/api";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: { slug: string };
}) {
  let cityName = params.slug;
  let phase = "";
  let participantNames: string[] = [];

  try {
    const data = await getFormation(params.slug);
    if (data) {
      cityName = data.parliamentName;
      if (data.formation) {
        phase = data.formation.phase;
        participantNames = data.formation.participants.map(
          (p) => p.party.abbreviation,
        );
      }
    }
  } catch {
    // fallback to slug
  }

  const phaseLabel: Record<string, string> = {
    VERKENNING: "Verkenningsfase",
    INFORMATIE: "Informatiefase",
    FORMATIE: "Formatiefase",
    AFGEROND: "Afgerond",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F7F8FA",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "auto",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#0F5B4D",
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#4A5468",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            CivicStat · Formatie
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {phase && (
            <div
              style={{
                fontSize: 14,
                color: "#8B95A8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              {phaseLabel[phase] ?? phase}
            </div>
          )}
          <div
            style={{
              fontSize: 64,
              fontWeight: 400,
              color: "#0E1116",
              lineHeight: 1.1,
              fontFamily: "serif",
            }}
          >
            Formatie {cityName}
          </div>
          {participantNames.length > 0 && (
            <div
              style={{
                fontSize: 24,
                color: "#4A5468",
                lineHeight: 1.4,
                maxWidth: 800,
              }}
            >
              {participantNames.join(", ")}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid #DDE1E8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 16, color: "#8B95A8" }}>
            civicstat.nl — Politieke transparantie op basis van feiten
          </span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#0F5B4D",
            }}
          />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
