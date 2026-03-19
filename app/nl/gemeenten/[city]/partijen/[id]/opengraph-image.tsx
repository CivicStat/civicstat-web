import { ImageResponse } from "next/og";
import { getParliament, getScopedParties, getScopedScorecard } from "../../../../../../lib/api";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CITY_NAMES: Record<string, string> = {
  amsterdam: "Amsterdam",
  "den-haag": "Den Haag",
  rotterdam: "Rotterdam",
  utrecht: "Utrecht",
};

export default async function OGImage({
  params,
}: {
  params: { city: string; id: string };
}) {
  const cityName = CITY_NAMES[params.city] ?? params.city;
  let partyName = params.id;
  let abbreviation = params.id;
  let mcs: number | null = null;
  let scoredPromises = 0;
  let totalPromises = 0;

  try {
    const parties = await getScopedParties(params.city);
    const party = parties.find(
      (p) =>
        p.abbreviation.toLowerCase() === params.id.toLowerCase() ||
        p.id === params.id,
    );
    if (party) {
      partyName = party.name ?? party.abbreviation;
      abbreviation = party.abbreviation;
    }
  } catch {}

  try {
    const sc = await getScopedScorecard(params.city, params.id);
    if (sc && sc.scoredPromises > 0) {
      mcs = sc.mandateConsistencyScore;
      scoredPromises = sc.scoredPromises;
      totalPromises = sc.totalPromises;
    }
  } catch {}

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
        {/* Brand mark */}
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
            CivicStat · Gemeente {cityName}
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "48px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
            <div
              style={{
                fontSize: 14,
                color: "#8B95A8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              Belofteconsistentie
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 400,
                color: "#0E1116",
                lineHeight: 1.0,
                fontFamily: "serif",
              }}
            >
              {abbreviation}
            </div>
            <div style={{ fontSize: 20, color: "#4A5468", lineHeight: 1.4 }}>
              {partyName !== abbreviation ? partyName : `Gemeenteraad ${cityName}`}
            </div>
            {scoredPromises > 0 && (
              <div style={{ fontSize: 14, color: "#8B95A8", marginTop: "4px" }}>
                {scoredPromises} van {totalPromises} beloften beoordeeld
              </div>
            )}
          </div>

          {/* MCS score */}
          {mcs !== null && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 160,
                height: 160,
                borderRadius: "50%",
                border: "3px solid rgba(14,17,22,0.08)",
                backgroundColor: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 400,
                  color: "#0E1116",
                  lineHeight: 1.0,
                  fontFamily: "serif",
                }}
              >
                {mcs}
              </div>
              <div style={{ fontSize: 14, color: "#8B95A8", marginTop: "4px" }}>
                van 100
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
