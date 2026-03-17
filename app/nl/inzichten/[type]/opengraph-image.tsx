import { ImageResponse } from "next/og";
import { getInsights } from "../../../../lib/api";
import { INSIGHT_TYPES } from "../InsightPanels";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: { type: string };
}) {
  const meta = INSIGHT_TYPES.find((t) => t.id === params.type);
  const label = meta?.label ?? "Inzichten";
  const subtitle = meta?.subtitle ?? "";

  let headline = "";
  try {
    if (meta) {
      const data = await getInsights();
      if (data) headline = meta.headline(data);
    }
  } catch {
    // fallback to static
  }

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
            CivicStat · Inzichten
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: 14,
              color: "#8B95A8",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 400,
              color: "#0E1116",
              lineHeight: 1.1,
              fontFamily: "serif",
            }}
          >
            {label}
          </div>
          {headline && (
            <div
              style={{
                fontSize: 24,
                color: "#4A5468",
                lineHeight: 1.4,
                maxWidth: 800,
              }}
            >
              {headline}
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
    { width: 1200, height: 630 }
  );
}
