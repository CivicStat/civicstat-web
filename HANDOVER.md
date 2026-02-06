# CivicStat — Handover & Status

**Date:** 6 February 2026
**Project:** Neutraal Transparantie-Platform (CivicStat)
**Repo:** `/Users/koenbekkering/Documents/New project`

---

## What Is This Project?

A neutral, auditable platform that makes Dutch Tweede Kamer data (motions, votes, MPs, parties) accessible and traceable. Built with a principle of no political rankings, labels, or recommendations — only facts with source attribution.

---

## Architecture

| Layer | Tech | Location | Deployed To |
|-------|------|----------|-------------|
| **Web** | Next.js 14 (App Router) | `civicstat-web/` | Vercel — civicstat-web.vercel.app |
| **API** | NestJS | `apps/api/` | Fly.io — civicstat-api.fly.dev |
| **DB** | PostgreSQL + Prisma + pgvector | `packages/db/` | Supabase (EU region) |
| **ETL** | TypeScript scripts | `packages/etl/` | Run manually (`npx tsx src/index.ts`) |
| **Shared** | Types/utils | `packages/shared/` | — |

**Note:** there are **two web directories** — `apps/web/` (monorepo placeholder, may be empty) and `civicstat-web/` (the actual deployed Next.js app with its own git). The canonical frontend is `civicstat-web/`.

---

## Current State (What Works)

### ✅ Fully Deployed & Live

**Frontend (civicstat-web.vercel.app)** — wired to live API with real data:
- `/` — Landing page with hero, features, live "Laatste stemmingen" from API
- `/moties` — Motions listing with server-side pagination, status filters, search
- `/moties/[id]` — Motion detail with vote breakdown per party, sources, methodology
- `/kamerleden` — MPs listing with party badges, initials avatars
- `/partijen` — Parties with seat distribution bar, party grid
- `/transparantie`, `/verbinding`, `/consultaties`, `/portal` — Skeleton pages

**API (civicstat-api.fly.dev)**:
- `/health`, `/motions`, `/votes`, `/parties`, `/members`

**ETL Pipeline (`packages/etl/`)**:
- fracties: ✅ 58 ingested
- kamerleden: ✅ 3070 personen
- moties: ✅ 100 ingested
- stemmingen: ✅ 50 ingested (all "Met handopsteken")

---

## Design System — "v3" (Current, Canonical)

The v3 design is the production design. Reference prototype: `civicstat-v3.jsx` (project file).

### Fonts

| Role | Font | Variable |
|------|------|----------|
| **Headings** | Instrument Serif (400, normal+italic) | `--font-serif` |
| **Body/UI** | Plus Jakarta Sans (200–800) | `--font-sans` |

### Color Palette (Tailwind Tokens)

```
ink:            #0E1116     — Primary text
mist:           #F7F8FA     — Page background
moss:           #0F5B4D     — Accent / CTA (politically neutral green)
moss-hover:     #0D4F43     — Accent hover state
surface:        #FFFFFF     — Card backgrounds
surface-sub:    #EEF1F5     — Subtle backgrounds, table headers
surface-sub2:   #E4E8EE     — Deeper subtle
border:         #DDE1E8     — Card/section borders
border-subtle:  #EEF1F5     — Row dividers
text-secondary: #4A5468     — Body text, descriptions
text-tertiary:  #8B95A8     — Metadata, labels
accent-subtle:  #E8F5F0     — Accent backgrounds
bar-voor:       #2D3648     — Vote bar "voor" (dark slate — NOT political)
bar-tegen:      #C5CBD6     — Vote bar "tegen" (light grey)
bar-afwezig:    #EEF1F5     — Vote bar background
```

### Design Principles

1. **Monochrome vote bars** — `bar-voor` and `bar-tegen` are neutral greys, never red/green or party colors
2. **Party colors only in dots** — Only in the small dot inside `PartyBadge`
3. **Serif headings, sans body** — Instrument Serif for h1–h4, Plus Jakarta Sans for everything else
4. **Cards with subtle shadows** — Nearly invisible `rgba(14,17,22,0.06)`
5. **Section labels** — 11px uppercase tracking-wider text-tertiary
6. **No emoji in UI** — Neutral, factual presentation
7. **Status badges** — Checkmark/X icon, no color coding
8. **Mobile: bottom nav** — 4-tab bottom navigation on mobile, top nav on desktop

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `Nav` | `components/Nav.tsx` | Sticky top nav + fixed bottom nav (mobile) |
| `PartyBadge` | `components/PartyBadge.tsx` | Colored dot + abbreviation pill |
| `StatusBadge` | `components/StatusBadge.tsx` | Aangenomen/Verworpen with check/X |
| `VoteBar` | `components/VoteBar.tsx` | Proportional bar with animated widths |
| `PageShell` | `components/PageShell.tsx` | Shared page wrapper |

### Dark Mode (Designed, not implemented)

Full dark tokens exist in prototype (`civicstat-v3.jsx` → `T.dark`):
- bg: #0E1623, accent: #4ADE9A, text: #E4E9F2
- Tailwind `darkMode: "class"` already configured

---

## API Client Pattern

`lib/api.ts` — all calls use ISR (5min cache):
```typescript
const data = await getMotions({ status, q, limit: 25, offset: 0 });
const motion = await getMotion(id);
const parties = await getParties();
const members = await getMembers({ party });
```

---

## TK OData API Knowledge

- **`Stemming`** = party-level vote record, NOT an overall vote
- **`Besluit`** = the actual vote decision
- **Vote date** from `Besluit` → `Agendapunt` → `Activiteit.Datum`
- **"Hoofdelijk"** = roll-call (individual MP records)
- **"Met handopsteken"** = show of hands (party-level only)

---

## To-Do's

### 🔴 P1 — Data Quality
1. Ingest more data (100 motions / 50 votes is too little)
2. Fix vote-to-motion linking (motionId: null)
3. Ingest roll-call ("Hoofdelijk") votes
4. Populate MotionSponsor via ZaakActor

### 🟡 P2 — Frontend
5. Dark mode toggle
6. Wire search bar
7. MP profile page (`/kamerleden/[id]`)
8. Party detail page (`/partijen/[id]`)

### 🟡 P3 — Analysis
9. Program passage ingestion (plan in `program-ingest-plan.md`)
10. Motion-Program matching
11. Consensus/Verbinding statistics

### 🟢 P4 — Platform
12. Authentication (NextAuth)
13. Consultations
14. Incremental sync
15. Scheduled ETL

---

## Useful Commands

```bash
# ETL
cd packages/etl && npx tsx src/index.ts all

# Database
cd packages/db && npx prisma studio

# API
cd apps/api && npm run start:dev

# Web
cd civicstat-web && npm run dev
cd civicstat-web && npx vercel --prod
```

---

## Deployment

- **Vercel project:** civic-stat/civicstat-web
- **Production:** https://civicstat-web.vercel.app
- **Last deploy:** 6 Feb 2026 — commit 7c0bdfb
- **Auto-deploy:** Push to origin/main triggers build
- **ISR:** 5-minute revalidation on API pages
