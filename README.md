# CIVICSTAT Web

Next.js 14 frontend for CIVICSTAT.nl - Neutraal platform voor Nederlandse Tweede Kamer moties en stemgedrag.

## 🚀 Vercel Deployment

### Stap 1: Import Project
1. Ga naar [vercel.com/new](https://vercel.com/new)
2. Import repository: `CivicStat/civicstat-web`
3. Framework Preset: **Next.js** (auto-detected)
4. Root Directory: **/** (default)
5. Node Version: **20.x** (auto-detected via `.node-version`)

### Stap 2: Environment Variables
Voeg toe in Vercel project settings:

```env
NEXT_PUBLIC_API_URL=https://civicstat-api.fly.dev
```

### Stap 3: Deploy
Klik **Deploy** - Vercel zal automatisch:
- Dependencies installeren (`npm install`)
- Build draaien (`npm run build`)
- Applicatie deployen

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
civicstat-web/
├── app/                    # Next.js 14 App Router
│   ├── moties/            # Moties pagina's
│   ├── kamerleden/        # Kamerleden overzicht
│   ├── partijen/          # Partijen analyse
│   ├── verbinding/        # Verbinding visualisatie
│   ├── transparantie/     # Transparantie & bronnen
│   └── portal/            # Data portal
├── components/            # Reusable React components
└── globals.css           # Tailwind CSS styles
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Node**: 20.20.0
- **API**: NestJS backend op Fly.io

## 📝 Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Dev Command**: `npm run dev`

## 🔗 Links

- **API**: https://civicstat-api.fly.dev
- **Health Check**: https://civicstat-api.fly.dev/health
- **Monorepo**: https://github.com/CivicStat/CivicStat

## 📄 License

MIT - CIVICSTAT.nl
