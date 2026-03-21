import { NextRequest, NextResponse } from "next/server";

interface FeedbackPayload {
  partyId: string;
  partyAbbreviation: string;
  electionYear: number;
  message: string;
}

export async function POST(req: NextRequest) {
  let payload: FeedbackPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { partyId, partyAbbreviation, electionYear, message } = payload;
  if (!partyId || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Forward to webhook if configured
  const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `[Scorecard feedback] ${partyAbbreviation} TK${electionYear}\n${message}`,
          partyId,
          partyAbbreviation,
          electionYear,
          message,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      // Log but don't fail the user-facing response
      console.error("[scorecard-feedback] webhook error:", err);
    }
  } else {
    // No webhook configured — log to stdout for visibility
    console.log(
      `[scorecard-feedback] party=${partyAbbreviation} year=${electionYear} message="${message}"`,
    );
  }

  return NextResponse.json({ ok: true });
}
