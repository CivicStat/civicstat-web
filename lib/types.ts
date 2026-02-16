// ─── API Response Types ─────────────────────────────────────

export interface PartyRef {
  id: string;
  name: string;
  abbreviation: string;
  colorNeutral?: string | null;
}

export interface MpRef {
  id: string;
  tkId?: string;
  name: string;
  surname: string;
  party?: PartyRef;
}

export interface SponsorRef {
  mp: MpRef;
  role?: string;
}

export interface VoteSummary {
  id: string;
  tkId: string;
  date?: string;
  result: string;
  totalFor: number;
  totalAgainst: number;
  totalAbstain: number;
}

export interface MotionListItem {
  id: string;
  tkId: string;
  tkNumber: string | null;
  title: string;
  text: string;
  dateIntroduced: string;
  status: string;
  statusDetail?: string | null;
  soort?: string | null;
  result?: string | null;
  sourceUrl: string;
  sponsors: SponsorRef[];
  votes: VoteSummary[];
  // Legacy: single vote (API may return this or votes array)
  vote?: VoteSummary | null;
  hasPromiseMatches?: boolean;
}

export interface MotionListResponse {
  items: MotionListItem[];
  total: number;
  limit: number;
  offset: number;
}

// Vote detail (for motion detail page)
export interface VoteRecord {
  id: string;
  voteValue: "FOR" | "AGAINST" | "ABSTAIN" | "ABSENT";
  mp: MpRef;
  party: PartyRef;
}

// Raw Stemming entry from TK OData (party-level vote in rawData.Stemming)
export interface RawStemming {
  Id: string;
  Soort: string; // "Voor" | "Tegen" | "Niet deelgenomen"
  ActorNaam: string; // Party abbreviation
  ActorFractie?: string;
  Fractie_Id: string | null;
  Persoon_Id: string | null;
  FractieGrootte: number;
  Vergissing?: boolean;
}

export interface VoteDetail extends VoteSummary {
  date: string;
  title: string;
  records: VoteRecord[];
  rawData?: {
    StemmingsSoort?: string; // "Met handopsteken" | "Hoofdelijk"
    Stemming?: RawStemming[];
    [key: string]: unknown;
  };
  motion?: {
    id: string;
    tkId: string;
    title: string;
    tkNumber: string | null;
    text?: string;
  } | null;
}

export interface MotionPromiseMatch {
  id: string;
  matchType: string;
  confidence: number;
  promise: {
    id: string;
    promiseCode: string;
    summary: string;
    theme: string;
    expectedVoteDirection: string | null;
    program: {
      electionYear: number;
      party: {
        id: string;
        abbreviation: string;
        colorNeutral: string | null;
      };
    };
  };
}

// Vote prediction types (on-the-fly computation from promise matches)
export interface PartyPredictionItem {
  partyId: string;
  abbreviation: string;
  name: string;
  seats: number;
  predictedDirection: "FOR" | "AGAINST" | "UNKNOWN";
  confidence: number;
  matchCount: number;
  explicitCount: number;
}

export interface MotionPrediction {
  motionId: string;
  predictedVoor: number;
  predictedTegen: number;
  predictedOnbekend: number;
  reliability: number;
  partyPredictions: PartyPredictionItem[];
  algorithm: string;
}

/** @deprecated Legacy stored prediction type — kept for backwards compat */
export interface VotePrediction {
  id: string;
  motionId: string;
  algorithmVersion: string;
  partyPredictions: {
    id: string;
    partyId: string;
    predictedVote: "FOR" | "AGAINST" | "UNKNOWN";
    confidence: number;
    rationale: string | null;
    party: {
      id: string;
      abbreviation: string;
      colorNeutral: string | null;
    };
  }[];
}

export interface MotionDetail extends MotionListItem {
  vote: VoteDetail | null;
  promiseMatches?: MotionPromiseMatch[];
  prediction?: MotionPrediction | null;
}

// Party types
export interface PartyListItem {
  id: string;
  tkId: string | null;
  name: string;
  abbreviation: string;
  colorNeutral: string | null;
  website: string | null;
  seats: number;
  seatsUpdatedAt: string | null;
  startDate: string | null;
  endDate: string | null;
  _count: { mps: number };
}

// Member types
export interface MemberListItem {
  id: string;
  tkId: string;
  name: string;
  initials: string | null;
  prefix: string | null;
  surname: string;
  gender: string | null;
  startDate: string;
  endDate: string | null;
  party: PartyRef;
  _count: { sponsors: number; voteRecords: number };
}

// Vote stats (shared between member & party detail)
export interface VoteStats {
  totalVotes: number;
  for: number;
  against: number;
  abstain: number;
  absent?: number;
  participationRate?: number;
  votesWon?: number;
  votesLost?: number;
}

// Member detail
export interface MemberDetail extends MemberListItem {
  constituency?: string | null;
  motions: {
    id: string;
    tkId: string;
    tkNumber: string | null;
    title: string;
    text: string;
    dateIntroduced: string;
    status: string;
    sponsors?: { role: string }[];
    vote?: {
      result: string;
      totalFor: number;
      totalAgainst: number;
    } | null;
  }[];
  voteStats: VoteStats;
}

// Party detail
export interface PartyDetail {
  id: string;
  tkId: string | null;
  name: string;
  abbreviation: string;
  colorNeutral: string | null;
  website: string | null;
  seats: number;
  seatsUpdatedAt: string | null;
  startDate: string | null;
  endDate: string | null;
  mps: {
    id: string;
    tkId: string;
    name: string;
    surname: string;
    startDate: string;
    endDate: string | null;
  }[];
  voteStats: VoteStats;
}

// ─── Promise types ─────────────────────────────────────────

export interface PromiseMotionMatch {
  id: string;
  matchType: "EXPLICIT_MATCH" | "IMPLICIT_MATCH" | "CONTRA_MATCH";
  confidence: number;
  rationale: string;
  matchMethod: string;
  motion: {
    id: string;
    tkId: string;
    tkNumber: string | null;
    title: string;
    text: string;
    dateIntroduced: string;
    status: string;
    votes: {
      id: string;
      result: string;
      totalFor: number;
      totalAgainst: number;
      totalAbstain: number;
    }[];
  };
}

export interface PromiseListItem {
  id: string;
  programId: string;
  promiseCode: string;
  text: string;
  summary: string;
  theme: string;
  specificity: string;
  pageRef: string | null;
  expectedVoteDirection: string;
  extractedBy: string;
  createdAt: string;
  program: {
    id: string;
    electionYear: number;
    title: string;
    party: PartyRef;
  };
  motionMatches: PromiseMotionMatch[];
}

export interface PromiseListResponse {
  items: PromiseListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface PromiseDetail {
  id: string;
  programId: string;
  promiseCode: string;
  text: string;
  summary: string;
  theme: string;
  specificity: string;
  pageRef: string | null;
  expectedVoteDirection: string;
  extractedBy: string;
  createdAt: string;
  program: {
    id: string;
    electionYear: number;
    title: string;
    sourceUrl: string | null;
    party: PartyRef;
  };
  passage: {
    id: string;
    chapter: string | null;
    heading: string | null;
    passageText: string;
  } | null;
  motionMatches: PromiseMotionMatch[];
}

// ─── Scorecard types ──────────────────────────────────────

export interface PromiseScore {
  promiseId: string;
  promiseCode: string;
  summary: string;
  theme: string;
  expectedDirection: string;
  totalMotionsWithVotes: number;
  alignedVotes: number;
  opposedVotes: number;
  weightedAligned: number;
  weightedOpposed: number;
  noVoteData: number;
  status: "consistent" | "inconsistent" | "mixed" | "insufficient_data";
}

export interface PartyScorecard {
  partyId: string;
  abbreviation: string;
  electionYear: number;
  periodStart: string;
  periodEnd: string;
  totalPromises: number;
  scoredPromises: number;
  insufficientDataPromises: number;
  consistentCount: number;
  inconsistentCount: number;
  mixedCount: number;
  mandateConsistencyScore: number;
  matchingAlgorithm: string;
  byTheme: Record<string, { consistent: number; inconsistent: number; mixed: number; total: number; insufficientData: number }>;
  promises?: PromiseScore[];
  note: string;
}

// ─── Multi-period comparison types ────────────────────────

export interface ScorecardComparison {
  partyId: string;
  abbreviation: string;
  periods: {
    electionYear: number;
    periodStart: string;
    periodEnd: string;
    mandateConsistencyScore: number;
    totalPromises: number;
    scoredPromises: number;
    consistentCount: number;
    inconsistentCount: number;
    mixedCount: number;
  }[];
  koersvastheid: number | null;
}

export interface KoersvastheidResponse {
  partyId: string;
  abbreviation: string;
  koersvastheid: number | null;
  periods: {
    electionYear: number;
    mandateConsistencyScore: number;
    scoredPromises: number;
    byTheme: Record<string, { score2023?: number; score2025?: number; delta: number }>;
  }[];
  themeStability: Record<string, number>;
}

// Program match types
export interface ProgramMatch {
  id: string;
  score: number;
  rationaleJson: {
    algorithm: string;
    version: string;
    matchedKeywords?: string[];
    snippet?: string;
  };
  party: PartyRef;
  passage: {
    id: string;
    chapter: string | null;
    heading: string | null;
    passageText: string;
    program: {
      id: string;
      electionYear: number;
      title: string;
    };
  };
}

// ─── Promise stats ─────────────────────────────────────────
export interface PromiseStatsResponse {
  totalPromises: number;
  totalMatches: number;
  byParty: { abbreviation: string; name: string; count: number }[];
  byTheme: { theme: string; count: number }[];
}

// ─── Platform stats ────────────────────────────────────────
export interface PlatformStats {
  promises: number;
  motions: number;
  votes: number;
  voteRecords: number;
  matches: number;
  matchesByMethod: {
    keyword: number;
    semantic: number;
    manual: number;
  };
  parties: number;
  members: number;
  programs: number;
  lastUpdated: string;
}

// ─── Langfuse AI Observability ──────────────────────────────
export interface LangfuseMetrics {
  totalTraces: number;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  avgLatencyMs: number;
  dailyMetrics: {
    date: string;
    traces: number;
    cost: number;
    inputTokens: number;
    outputTokens: number;
  }[];
}

export interface LangfuseTrace {
  id: string;
  name: string;
  timestamp: string;
  latencyMs: number | null;
  tags: string[];
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
  model: string | null;
  publicUrl: string;
}

export interface LangfuseTracesResponse {
  traces: LangfuseTrace[];
  totalItems: number;
  page: number;
  limit: number;
}

// ─── Inzichten (Insights) ──────────────────────────────────

export interface BedgenotenPair {
  partyA: string;
  partyB: string;
  agreementPct: number;
  sharedVotes: number;
  exampleMotion: { id: string; title: string; date: string } | null;
  note: string;
}

export interface CoalitieScheur {
  motionId: string;
  motionTitle: string;
  date: string;
  coalitionName: string;
  dissenters: { abbreviation: string; vote: string }[];
  loyalists: { abbreviation: string; vote: string }[];
  note: string;
}

export interface StijgerDaler {
  partyId: string;
  abbreviation: string;
  mcs2023: number;
  mcs2025: number;
  delta: number;
  note: string;
}

export interface StilleConsensusMotion {
  motionId: string;
  title: string;
  date: string;
  result: string;
  unanimousPct: number;
  totalParties: number;
  note: string;
}

export interface InsightsResponse {
  bedgenoten: BedgenotenPair[];
  scheuren: CoalitieScheur[];
  beweging: StijgerDaler[];
  consensus: StilleConsensusMotion[];
  generatedAt: string;
}

// ─── Coalitieverwatering ────────────────────────────────────
export interface CoalitieverwateringResponse {
  partyId: string;
  abbreviation: string;
  electionYear: number;
  regeerakkoordTitle: string;
  totalPartyPromises: number;
  survivedCount: number;
  dilutedCount: number;
  dilutionRate: number;
  matches?: {
    partyPromise: {
      code: string;
      summary: string;
      keywords: string[];
    };
    regeerakkoordPromise: {
      code: string;
      summary: string;
      keywords: string[];
    } | null;
    sharedKeywords: string[];
    survived: boolean;
  }[];
}
