import type {
  MotionListResponse,
  MotionListItem,
  MotionDetail,
  PartyListItem,
  PartyDetail,
  PartyScorecard,
  MemberListItem,
  MemberDetail,
  VoteDetail,
  PromiseListResponse,
  PromiseListItem,
  PromiseDetail,
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
  limit?: number;
  offset?: number;
}): Promise<MotionListResponse> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.status) sp.set("status", params.status);
  if (params?.party) sp.set("party", params.party);
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

export async function getPartyScorecard(id: string): Promise<PartyScorecard> {
  return apiFetch<PartyScorecard>(`/parties/${encodeURIComponent(id)}/scorecard`);
}

export async function getAllScorecards(): Promise<PartyScorecard[]> {
  return apiFetch<PartyScorecard[]>("/parties/scorecards");
}

// ─── Votes ──────────────────────────────────────────────────

// ─── Promises ───────────────────────────────────────────────

export async function getPromises(params?: {
  q?: string;
  party?: string;
  theme?: string;
  limit?: number;
  offset?: number;
}): Promise<PromiseListResponse> {
  const sp = new URLSearchParams();
  if (params?.q) sp.set("q", params.q);
  if (params?.party) sp.set("party", params.party);
  if (params?.theme) sp.set("theme", params.theme);
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));

  const qs = sp.toString();
  return apiFetch<PromiseListResponse>(`/promises${qs ? `?${qs}` : ""}`);
}

export async function getPromise(id: string): Promise<PromiseDetail> {
  return apiFetch<PromiseDetail>(`/promises/${encodeURIComponent(id)}`);
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
