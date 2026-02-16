import type {
  MotionListResponse,
  MotionListItem,
  MotionDetail,
  PartyListItem,
  PartyDetail,
  PartyScorecard,
  ScorecardComparison,
  KoersvastheidResponse,
  MemberListItem,
  MemberDetail,
  VoteDetail,
  PromiseListResponse,
  PromiseListItem,
  PromiseDetail,
  PromiseStatsResponse,
  CoalitieverwateringResponse,
  PlatformStats,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://civicstat-api.fly.dev";

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...opts,
    next: { revalidate: 300 }, // cache 5 min (ISR)
    headers: {
      "Content-Type": "application/json",
      ...opts?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${url}`);
  }

  return res.json();
}

// ─── Motions ────────────────────────────────────────────────

export async function getMotions(params?: {
  q?: string;
  status?: string;
  party?: string;
  hasVotes?: boolean;
  limit?: number;
  offset?: number;
}): Promise<MotionListResponse> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.status) sp.set("status", params.status);
  if (params?.party) sp.set("party", params.party);
  if (params?.hasVotes) sp.set("hasVotes", "true");
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));

  const qs = sp.toString();
  return apiFetch<MotionListResponse>(`/motions${qs ? `?${qs}` : ""}`);
}

export async function getMotion(id: string): Promise<MotionDetail> {
  return apiFetch<MotionDetail>(`/motions/${encodeURIComponent(id)}`);
}

// ─── Parties ────────────────────────────────────────────────

export async function getParties(): Promise<PartyListItem[]> {
  return apiFetch<PartyListItem[]>("/parties");
}

// ─── Members ────────────────────────────────────────────────

export async function getMembers(params?: {
  q?: string;
  party?: string;
}): Promise<MemberListItem[]> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.party) sp.set("party", params.party);
  const qs = sp.toString();
  return apiFetch<MemberListItem[]>(`/members${qs ? `?${qs}` : ""}`);
}

// ─── Member Detail ──────────────────────────────────────────

export async function getMember(id: string): Promise<MemberDetail> {
  return apiFetch<MemberDetail>(`/members/${encodeURIComponent(id)}`);
}

// ─── Party Detail ───────────────────────────────────────────

export async function getParty(id: string): Promise<PartyDetail> {
  return apiFetch<PartyDetail>(`/parties/${encodeURIComponent(id)}`);
}

export async function getPartyScorecard(
  id: string,
  params?: { year?: number; periodStart?: string; periodEnd?: string },
): Promise<PartyScorecard> {
  const sp = new URLSearchParams();
  if (params?.year) sp.set("year", String(params.year));
  if (params?.periodStart) sp.set("periodStart", params.periodStart);
  if (params?.periodEnd) sp.set("periodEnd", params.periodEnd);
  const qs = sp.toString();
  return apiFetch<PartyScorecard>(`/parties/${encodeURIComponent(id)}/scorecard${qs ? `?${qs}` : ""}`);
}

export async function getAllScorecards(
  params?: { year?: number; periodStart?: string; periodEnd?: string },
): Promise<PartyScorecard[]> {
  const sp = new URLSearchParams();
  if (params?.year) sp.set("year", String(params.year));
  if (params?.periodStart) sp.set("periodStart", params.periodStart);
  if (params?.periodEnd) sp.set("periodEnd", params.periodEnd);
  const qs = sp.toString();
  return apiFetch<PartyScorecard[]>(`/parties/scorecards${qs ? `?${qs}` : ""}`);
}

export async function getScorecardYears(): Promise<number[]> {
  return apiFetch<number[]>("/parties/scorecards/years");
}

export async function compareScorecards(
  years: number[] = [2023, 2025],
): Promise<ScorecardComparison[]> {
  return apiFetch<ScorecardComparison[]>(`/parties/scorecards/compare?years=${years.join(",")}`);
}

export async function getKoersvastheid(
  id: string,
  years: number[] = [2023, 2025],
): Promise<KoersvastheidResponse> {
  return apiFetch<KoersvastheidResponse>(
    `/parties/${encodeURIComponent(id)}/koersvastheid?years=${years.join(",")}`,
  );
}

// ─── Votes ──────────────────────────────────────────────────

// ─── Promises ───────────────────────────────────────────────

export async function getPromises(params?: {
  q?: string;
  party?: string;
  theme?: string;
  year?: number;
  limit?: number;
  offset?: number;
}): Promise<PromiseListResponse> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.party) sp.set("party", params.party);
  if (params?.theme) sp.set("theme", params.theme);
  if (params?.year) sp.set("year", String(params.year));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));

  const qs = sp.toString();
  return apiFetch<PromiseListResponse>(`/promises${qs ? `?${qs}` : ""}`);
}

export async function getPromise(id: string): Promise<PromiseDetail> {
  return apiFetch<PromiseDetail>(`/promises/${encodeURIComponent(id)}`);
}

export async function getPromiseStats(): Promise<PromiseStatsResponse> {
  return apiFetch<PromiseStatsResponse>("/promises/stats");
}

// ─── Votes ──────────────────────────────────────────────────

export async function getVotes(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ items: VoteDetail[]; total: number; limit: number; offset: number }> {
  const sp = new URLSearchParams();
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return apiFetch(`/votes${qs ? `?${qs}` : ""}`);
}

// ─── Search All ────────────────────────────────────────────
// Queries motions, promises, and members in parallel; never throws.

export interface SearchAllResults {
  motions: { items: MotionListItem[]; total: number };
  promises: { items: PromiseListItem[]; total: number };
  members: MemberListItem[];
}

export async function searchAll(q: string): Promise<SearchAllResults> {
  const [motionsResult, promisesResult, membersResult] = await Promise.allSettled([
    getMotions({ q, limit: 10 }),
    getPromises({ q, limit: 10 }),
    getMembers({ q }),
  ]);

  return {
    motions:
      motionsResult.status === "fulfilled"
        ? { items: motionsResult.value.items, total: motionsResult.value.total }
        : { items: [], total: 0 },
    promises:
      promisesResult.status === "fulfilled"
        ? { items: promisesResult.value.items, total: promisesResult.value.total }
        : { items: [], total: 0 },
    members:
      membersResult.status === "fulfilled" ? membersResult.value : [],
  };
}

// ─── Regeerakkoord ──────────────────────────────────────────

export async function getRegeerakkoordScorecard(
  id: string,
  params?: { year?: number; periodStart?: string; periodEnd?: string },
): Promise<PartyScorecard | null> {
  try {
    const sp = new URLSearchParams();
    if (params?.year) sp.set("year", String(params.year));
    if (params?.periodStart) sp.set("periodStart", params.periodStart);
    if (params?.periodEnd) sp.set("periodEnd", params.periodEnd);
    const qs = sp.toString();
    return await apiFetch<PartyScorecard>(
      `/parties/${encodeURIComponent(id)}/regeerakkoord${qs ? `?${qs}` : ""}`,
    );
  } catch {
    return null;
  }
}

export async function getCoalitieverwatering(
  id: string,
  params?: { year?: number },
): Promise<CoalitieverwateringResponse | null> {
  try {
    const sp = new URLSearchParams();
    if (params?.year) sp.set("year", String(params.year));
    const qs = sp.toString();
    return await apiFetch<CoalitieverwateringResponse>(
      `/parties/${encodeURIComponent(id)}/coalitieverwatering${qs ? `?${qs}` : ""}`,
    );
  } catch {
    return null;
  }
}

// ─── Langfuse AI Observability ────────────────────────────────

export async function getLangfuseMetrics(): Promise<import("./types").LangfuseMetrics | null> {
  try {
    return await apiFetch<import("./types").LangfuseMetrics>("/langfuse/metrics");
  } catch {
    return null;
  }
}

export async function getLangfuseTraces(params?: {
  limit?: number;
  page?: number;
}): Promise<import("./types").LangfuseTracesResponse | null> {
  try {
    const sp = new URLSearchParams();
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.page) sp.set("page", String(params.page));
    const qs = sp.toString();
    return await apiFetch<import("./types").LangfuseTracesResponse>(
      `/langfuse/traces${qs ? `?${qs}` : ""}`,
    );
  } catch {
    return null;
  }
}

// ─── Inzichten (Insights) ──────────────────────────────────

export async function getInsights(): Promise<import("./types").InsightsResponse | null> {
  try {
    return await apiFetch<import("./types").InsightsResponse>("/insights");
  } catch {
    return null;
  }
}

// ─── Platform Stats ─────────────────────────────────────────

export async function getPlatformStats(): Promise<PlatformStats | null> {
  try {
    return await apiFetch<PlatformStats>("/stats");
  } catch {
    return null;
  }
}

// ─── Admin / Status ──────────────────────────────────────────

export async function getSystemStatus() {
  try {
    const url = `${API_URL}/admin/status`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getPipelineRuns(limit: number = 10) {
  try {
    const url = `${API_URL}/admin/pipeline-runs?limit=${limit}`;
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
