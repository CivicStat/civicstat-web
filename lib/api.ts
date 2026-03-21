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
  MpScorecard,
  VoteDetail,
  PromiseListResponse,
  PromiseListItem,
  PromiseDetail,
  PromiseStatsResponse,
  CoalitieverwateringResponse,
  CoalitionComparisonItem,
  BelofteOMeterResponse,
  PartyComparisonResponse,
  PlatformStats,
  ParliamentListItem,
  ParliamentDetail,
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
  result?: string;
  party?: string;
  soort?: string;
  hasVotes?: boolean;
  hasPromiseMatches?: boolean;
  limit?: number;
  offset?: number;
}): Promise<MotionListResponse> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.status) sp.set("status", params.status);
  if (params?.result) sp.set("result", params.result);
  if (params?.party) sp.set("party", params.party);
  if (params?.soort) sp.set("soort", params.soort);
  if (params?.hasVotes) sp.set("hasVotes", "true");
  if (params?.hasPromiseMatches !== undefined) sp.set("hasPromiseMatches", String(params.hasPromiseMatches));
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

export async function getMemberScorecard(
  id: string,
  electionYear = 2023,
): Promise<MpScorecard> {
  return apiFetch<MpScorecard>(
    `/members/${encodeURIComponent(id)}/scorecard?electionYear=${electionYear}`
  );
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

// ─── MCS Trend (scorecard history) ──────────────────────────

export interface McsSnapshot {
  month: string;
  electionYear: number;
  mcs: number;
  scoredPromises: number;
  consistentCount: number;
  inconsistentCount: number;
  mixedCount: number;
}

export interface McsHistoryResponse {
  partyId: string;
  abbreviation: string;
  snapshots: McsSnapshot[];
}

export async function getMcsHistory(
  parliamentSlug: string,
  partyAbbr: string,
  params?: { year?: number },
): Promise<McsHistoryResponse> {
  const sp = new URLSearchParams();
  if (params?.year) sp.set("year", String(params.year));
  const qs = sp.toString();
  return apiFetch<McsHistoryResponse>(
    `/parliament/${encodeURIComponent(parliamentSlug)}/parties/${encodeURIComponent(partyAbbr)}/scorecard/history${qs ? `?${qs}` : ""}`,
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

// ─── Coalition Dynamics ──────────────────────────────────────

export async function getPartyCoalitionAlignment(
  partyId: string,
  coalition?: string,
): Promise<import("./types").CoalitionAlignmentResult | null> {
  try {
    const sp = new URLSearchParams();
    if (coalition) sp.set("coalition", coalition);
    const qs = sp.toString();
    return await apiFetch<import("./types").CoalitionAlignmentResult>(
      `/parties/${encodeURIComponent(partyId)}/coalition-alignment${qs ? `?${qs}` : ""}`,
    );
  } catch {
    return null;
  }
}

export async function getPartyVrijeStemmen(
  partyId: string,
  year?: number,
  coalition?: string,
): Promise<import("./types").VrijeStemmenResult | null> {
  try {
    const sp = new URLSearchParams();
    if (year) sp.set("year", String(year));
    if (coalition) sp.set("coalition", coalition);
    const qs = sp.toString();
    return await apiFetch<import("./types").VrijeStemmenResult>(
      `/parties/${encodeURIComponent(partyId)}/vrije-stemmen${qs ? `?${qs}` : ""}`,
    );
  } catch {
    return null;
  }
}

// ─── Coalition Comparison ────────────────────────────────────

export async function getCoalitionComparison(): Promise<CoalitionComparisonItem[]> {
  return apiFetch<CoalitionComparisonItem[]>("/coalitions/compare");
}

export async function getBelofteOMeter(slug: string): Promise<BelofteOMeterResponse> {
  return apiFetch<BelofteOMeterResponse>(`/coalitions/${slug}/belofte-o-meter`);
}

// ─── Party Comparison ────────────────────────────────────────

export async function getPartyComparison(
  slug: string,
  partyIds: string[],
  year?: number,
): Promise<PartyComparisonResponse> {
  const sp = new URLSearchParams();
  sp.set("partyIds", partyIds.join(","));
  if (year) sp.set("year", String(year));
  return apiFetch<PartyComparisonResponse>(
    `/parliament/${encodeURIComponent(slug)}/parties/compare?${sp.toString()}`,
  );
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

// ─── Parliaments ─────────────────────────────────────────────

export async function getParliaments(): Promise<ParliamentListItem[]> {
  return apiFetch<ParliamentListItem[]>("/parliaments");
}

export async function getParliament(slug: string): Promise<ParliamentDetail> {
  return apiFetch<ParliamentDetail>(`/parliaments/${encodeURIComponent(slug)}`);
}

// ─── Parliament-scoped (municipal) endpoints ─────────────────

export async function getScopedMotions(
  slug: string,
  params?: {
    q?: string;
    status?: string;
    result?: string;
    party?: string;
    limit?: number;
    offset?: number;
  },
): Promise<MotionListResponse> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.status) sp.set("status", params.status);
  if (params?.result) sp.set("result", params.result);
  if (params?.party) sp.set("party", params.party);
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return apiFetch<MotionListResponse>(
    `/parliament/${encodeURIComponent(slug)}/motions${qs ? `?${qs}` : ""}`,
  );
}

export async function getScopedMotion(slug: string, id: string): Promise<MotionDetail> {
  return apiFetch<MotionDetail>(
    `/parliament/${encodeURIComponent(slug)}/motions/${encodeURIComponent(id)}`,
  );
}

export async function getScopedParties(slug: string): Promise<PartyListItem[]> {
  return apiFetch<PartyListItem[]>(
    `/parliament/${encodeURIComponent(slug)}/parties`,
  );
}

export async function getScopedMembers(
  slug: string,
  params?: { q?: string; party?: string; limit?: number; offset?: number },
): Promise<MemberListItem[]> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.party) sp.set("party", params.party);
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return apiFetch<MemberListItem[]>(
    `/parliament/${encodeURIComponent(slug)}/members${qs ? `?${qs}` : ""}`,
  );
}

export async function getScopedMember(
  slug: string,
  id: string,
): Promise<MemberDetail> {
  return apiFetch<MemberDetail>(
    `/parliament/${encodeURIComponent(slug)}/members/${encodeURIComponent(id)}`,
  );
}

export async function getScopedVotes(
  slug: string,
  params?: { limit?: number; offset?: number },
): Promise<{ items: VoteDetail[]; total: number; limit: number; offset: number }> {
  const sp = new URLSearchParams();
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return apiFetch(
    `/parliament/${encodeURIComponent(slug)}/votes${qs ? `?${qs}` : ""}`,
  );
}

export async function getScopedStats(slug: string): Promise<PlatformStats | null> {
  try {
    return await apiFetch<PlatformStats>(
      `/parliament/${encodeURIComponent(slug)}/stats`,
    );
  } catch {
    return null;
  }
}

// ─── Parliament-scoped promises ─────────────────────────────

export async function getScopedPromises(
  slug: string,
  params?: {
    q?: string;
    party?: string;
    theme?: string;
    year?: number;
    limit?: number;
    offset?: number;
  },
): Promise<PromiseListResponse> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.party) sp.set("party", params.party);
  if (params?.theme) sp.set("theme", params.theme);
  if (params?.year) sp.set("year", String(params.year));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return apiFetch<PromiseListResponse>(
    `/parliament/${encodeURIComponent(slug)}/promises${qs ? `?${qs}` : ""}`,
  );
}

export async function getScopedPromise(
  slug: string,
  id: string,
): Promise<PromiseDetail> {
  return apiFetch<PromiseDetail>(
    `/parliament/${encodeURIComponent(slug)}/promises/${encodeURIComponent(id)}`,
  );
}

export async function getScopedPromiseStats(
  slug: string,
): Promise<PromiseStatsResponse> {
  return apiFetch<PromiseStatsResponse>(
    `/parliament/${encodeURIComponent(slug)}/promises/stats`,
  );
}

// ─── Parliament-scoped scorecards ────────────────────────────

export async function getScopedScorecards(
  slug: string,
  params?: { year?: number },
): Promise<Omit<PartyScorecard, "promises">[]> {
  const sp = new URLSearchParams();
  if (params?.year) sp.set("year", String(params.year));
  const qs = sp.toString();
  return apiFetch<Omit<PartyScorecard, "promises">[]>(
    `/parliament/${encodeURIComponent(slug)}/scorecards${qs ? `?${qs}` : ""}`,
  );
}

export async function getScopedScorecard(
  slug: string,
  partyId: string,
  params?: { year?: number },
): Promise<PartyScorecard> {
  const sp = new URLSearchParams();
  if (params?.year) sp.set("year", String(params.year));
  const qs = sp.toString();
  return apiFetch<PartyScorecard>(
    `/parliament/${encodeURIComponent(slug)}/parties/${encodeURIComponent(partyId)}/scorecard${qs ? `?${qs}` : ""}`,
  );
}

// ─── Election Overview (Campaign 2026) ──────────────────────

export interface ElectionOverviewParty {
  partyId: string;
  abbreviation: string;
  name: string;
  seats: number | null;
  historicalMcs: number | null;
  historicalScoredPromises: number | null;
  historicalTotalPromises: number | null;
  vooruitblikMcs: number | null;
  vooruitblikScoredPromises: number | null;
  vooruitblikTotalPromises: number | null;
  promiseCount2022: number;
  promiseCount2026: number;
}

export interface ElectionOverviewResponse {
  parliamentId: string;
  parliamentName: string;
  parliamentSlug: string;
  electionDate: string;
  parties: ElectionOverviewParty[];
}

export async function getElectionOverview(
  slug: string,
): Promise<ElectionOverviewResponse | null> {
  try {
    return await apiFetch<ElectionOverviewResponse>(
      `/parliament/${encodeURIComponent(slug)}/election-overview`,
    );
  } catch {
    return null;
  }
}

// ─── Formatie (Coalition Formation) ──────────────────────────

export async function getFormation(
  slug: string,
): Promise<import("./types").FormationResponse | null> {
  try {
    return await apiFetch<import("./types").FormationResponse>(
      `/parliament/${encodeURIComponent(slug)}/formatie`,
    );
  } catch {
    return null;
  }
}

export async function getFormationKansen(
  slug: string,
): Promise<import("./types").KansenResponse | null> {
  try {
    return await apiFetch<import("./types").KansenResponse>(
      `/parliament/${encodeURIComponent(slug)}/formatie/kansen`,
    );
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

// ─── Platform Updates ───────────────────────────────────────

export interface PlatformUpdateItem {
  id: string;
  title: string;
  body: string;
  category: "NIEUWE_DATA" | "NIEUWE_ANALYSE" | "VERBETERING" | "BUGFIX" | null;
  linkUrl: string | null;
  linkLabel: string | null;
  publishedAt: string;
}

export async function getPlatformUpdates(): Promise<PlatformUpdateItem[]> {
  try {
    return await apiFetch<PlatformUpdateItem[]>("/updates?limit=100");
  } catch {
    return [];
  }
}
