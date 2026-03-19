import { ImageResponse } from "next/og";
import { getMember } from "../../../../../lib/api";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: { id: string };
}) {
  let surname = "Kamerlid";
  let fullName = "";
  let partyAbbr = "";
  let totalMotions = 0;
  let totalVotes = 0;

  try {
    const member = await getMember(params.id);
    surname = member.surname;
    fullName = member.name;
    partyAbbr = member.party?.abbreviation ?? "";
    totalMotions = member.motions?.length ?? 0;
    totalVotes = member.voteStats?.totalVotes ?? 0;
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
            CivicStat · Tweede Kamer
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              fontSize: 14,
              color: "#8B95A8",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            Kamerlid
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
            {surname}
          </div>
          {fullName && (
            <div style={{ fontSize: 22, color: "#4A5468", lineHeight: 1.3 }}>
              {fullName}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "12px" }}>
            {partyAbbr && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  border: "1px solid #DDE1E8",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: "#0E1116" }}>
                  {partyAbbr}
                </span>
              </div>
            )}
            {totalMotions > 0 && (
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: 28, fontWeight: 400, color: "#0E1116", fontFamily: "serif" }}>
                  {totalMotions}
                </span>
                <span style={{ fontSize: 14, color: "#8B95A8" }}>moties</span>
              </div>
            )}
            {totalVotes > 0 && (
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span style={{ fontSize: 28, fontWeight: 400, color: "#0E1116", fontFamily: "serif" }}>
                  {totalVotes}
                </span>
                <span style={{ fontSize: 14, color: "#8B95A8" }}>stemmingen</span>
              </div>
            )}
          </div>
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
