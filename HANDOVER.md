# CivicStat — Project Handover

_Last updated: 11 February 2026_

---

## Quick Start

```bash
# Frontend (Next.js)
cd civicstat-web && npm run dev          # → localhost:3000

# API (NestJS)
cd apps/api && npm run start:dev         # → localhost:3001

# ETL
cd packages/etl && npx tsx src/index.ts all

# Database
cd packages/db && npx prisma studio
```

**Production:**

- Frontend: [civicstat-web.vercel.app](https://civicstat-web.vercel.app)
- API: [civicstat-api.fly.dev](https://civicstat-api.fly.dev/health)

---

## Architecture

| Layer      | Tech                           | Location          | Deployed To              |
| ---------- | ------------------------------ | ----------------- | ------------------------ |
| **Web**    | Next.js 14 (App Router)        | `civicstat-web/`  | Vercel                   |
| **API**    | NestJS + Prisma                | `apps/api/`       | Fly.io (Amsterdam)       |
| **DB**     | PostgreSQL + pgvector          | `packages/db/`    | Supabase (EU)            |
| **ETL**    | TypeScript scripts             | `packages/etl/`   | Manual (`npx tsx`)       |
| **Shared** | Types, utils                   | `packages/shared/`| —                        |

Monorepo managed with **pnpm workspaces** + **Turborepo**.

> Note: `civicstat-web/` is a separate git repository (deployed via Vercel git integration). The monorepo root (`apps/api/`, `packages/`) is deployed separately.

---

## Data State

| Entity                  | Count  | Notes                                    |
| ----------------------- | ------ | ---------------------------------------- |
| Promises                | 225    | 15 parties x 15 each (TK2023 programs)  |
| Motions                 | 12,529 | From TK OData API                        |
| Votes                   | 12,444 | 84-85% linked to motions                 |
| Promise-motion matches  | 2,738  | All `keyword-overlap-v1` (implicit)      |
| MPs                     | ~3,070 | Historical + active                      |
| Parties (active)        | 15     | With known TK2023 seats                  |
| Themes                  | 12     | Defensie, Wonen, Migratie, Klimaat, etc. |

Seat counts centralized in `lib/seats.ts` (frontend) and `parties.service.ts` (API).

---

## Design System

### Fonts

| Role        | Font                  | Variable        |
| ----------- | --------------------- | --------------- |
| Headings    | Instrument Serif 400  | `--font-serif`  |
| Body/UI     | Plus Jakarta Sans     | `--font-sans`   |

### Color Palette (Tailwind tokens)

```
ink:            #0E1116     — Primary text
mist:           #F7F8FA     — Page background
moss:           #0F5B4D     — Accent (politically neutral)
surface:        #FFFFFF     — Card backgrounds
surface-sub:    #EEF1F5     — Subtle backgrounds
border:         #DDE1E8     — Card borders
text-secondary: #4A5468     — Body text
text-tertiary:  #8B95A8     — Metadata
bar-voor:       #2D3648     — Vote bar (neutral dark)
bar-tegen:      #C5CBD6     — Vote bar (neutral light)
```

Dark mode: fully designed with `.dark` class toggle (`ThemeToggle` component). Uses `localStorage` with system preference fallback.

### Design Principles

1. **Political neutrality** — monochrome vote bars, no party rankings, no editorial interpretation
2. **Data transparency** — all sources traceable, methodology explained, confidence scores visible
3. **Serif headings, sans body** — Instrument Serif for h1-h4, Plus Jakarta Sans for everything else
4. **Cards with subtle shadows** — nearly invisible `rgba(14,17,22,0.06)`
5. **Section labels** — 11px uppercase tracking-wider text-tertiary

---

## Key Components

| Component            | File                          | Purpose                              |
| -------------------- | ----------------------------- | ------------------------------------ |
| `Nav`                | `components/Nav.tsx`          | Top nav + mobile bottom nav          |
| `Footer`             | `components/Footer.tsx`       | Site footer with Transparantie link  |
| `PartyBadge`         | `components/PartyBadge.tsx`   | Colored dot + abbreviation pill      |
| `StatusBadge`        | `components/StatusBadge.tsx`  | Aangenomen/Verworpen indicator       |
| `VoteBar`            | `components/VoteBar.tsx`      | Proportional bar with tooltips       |
| `Term`               | `components/Term.tsx`         | Inline tooltip for terminology       |
| `MethodologyLink`    | `components/MethodologyLink.tsx` | Link to /transparantie            |
| `SearchBar`          | `components/SearchBar.tsx`    | Debounced search with results        |
| `ThemeToggle`        | `components/ThemeToggle.tsx`  | Dark mode toggle                     |

---

## API Client Pattern

`lib/api.ts` — all calls use `apiFetch<T>()` with ISR (5-minute cache via `next.revalidate`):

```typescript
const data = await getMotions({ status, q, limit: 25, offset: 0 });
const motion = await getMotion(id);
const parties = await getParties();
const members = await getMembers();
const promise = await getPromise(id);
const scorecards = await getAllScorecards();
```

Page-level ISR: `export const revalidate = 3600` (homepage, partijen, beloften, kamerleden) and `1800` (moties).

---

## ETL Pipeline

```
TK OData API → ETL scripts → PostgreSQL → NestJS API → Next.js frontend
```

Key scripts in `packages/etl/src/`:

- `ingest/fracties.ts` — Party data
- `ingest/kamerleden.ts` — MP data
- `ingest/moties.ts` — Motion data
- `ingest/stemmingen.ts` — Vote data
- `matching/promise-motion-matcher.ts` — Keyword matching engine
- `matching/keyword-match.ts` — TF-IDF passage matching
- `prediction/predict-vote.ts` — Belofte-kloof prediction

---

## Known Limitations

- Match algorithm is keyword-based only (`keyword-overlap-v1`); semantic matching via pgvector planned
- ~15% of votes not linked to motions (TK API Zaak linkage gaps)
- Seat counts hardcoded (centralized in `lib/seats.ts`, not yet in database)
- civicstat.nl domain not yet configured
- No user authentication system
- Individual MP vote records not displayed on kamerleden detail page (only aggregate stats + sponsored motions)
- ~15% vote linkage gap is expected (non-motion Besluiten: amendementen, wetsvoorstellen, begrotingen)
- Sponsor data covers ~12% of motions (re-run `npx tsx src/index.ts sponsors` to refresh)
- Sort by votes on moties page is client-side only (sorts current page, not full dataset)

---

## Recent Changes

### Batch 1 — Quick Wins & Visual Fixes (Feb 11)

- Live API stats on /transparantie (Promise.allSettled)
- TK2023 & TK2025 text update
- Empty state for parties without promises
- VoteBar tooltips + showCounts prop
- Consistency bar contrast improvements
- MCS contextual label (Hoog/Gemiddeld/Laag)

### Batch 2 — Visual Polish & Mobile (Feb 11)

- Consensus matrix mobile scroll indicator
- Loading skeletons for beloften, moties, partijen, kamerleden
- Dark mode audit (all pass)
- Mobile nav: replaced Transparantie with Kamerleden
- Beloften mobile card layout improvements
- Moties listing mobile vote bar

### Batch 3 — Infrastructure (Feb 11)

- Centralized `TK_SEATS` in `lib/seats.ts` (removed duplicates)
- Added seats to Party API response
- ISR revalidation exports on 5 key pages
- Created `Footer` component

### Batch 4 — Data Quality Indicators (Feb 11)

- Match quality indicator on promise cards (avg confidence with progress bar)
- Data completeness indicator on party cards (green dot vs "Geen analyse")
- Enhanced confidence badge on motion-promise links (color-coded dots)
- "Hoe wordt dit berekend?" expandable on promise detail page
- Consolidated HANDOVER.md

### Batch 5 — Data Pipeline & API Deployment (Feb 11)

- API deploy prep: verified clean TypeScript build for Fly.io (Prisma generate + tsc + build all pass)
- Vote linkage gap documented in ETL (`stemmingen.ts`): ~15% unlinked is expected (non-motion Besluiten)
- Moties listing: added sponsor name (indiener) next to party badge on motion cards
- Homepage: added Belofteconsistentie section with top 6 party MCS scores
- Moties listing: added sort toggle (Nieuwste / Meest gestemd) with client-side sorting

---

## Useful Commands

```bash
# Deploy frontend
cd civicstat-web && git push origin main     # auto-deploys via Vercel

# Deploy API
cd apps/api && fly deploy                     # Fly.io

# Build check
cd civicstat-web && npm run build

# API type check
cd apps/api && npx tsc --noEmit
```

---

## Further Documentation

See `docs/` directory in the monorepo root for:

- `architecture.md` — System architecture details
- `algorithms.md` — Algorithm documentation
- `data-sources.md` — TK OData API details
- `governance.md` — Governance policies
- `policies/` — Privacy, security, moderation policies
- `handover-2026-02-*.md` — Session-specific handover notes
