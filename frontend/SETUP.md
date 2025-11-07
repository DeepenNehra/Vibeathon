# Arogya-AI Frontend Setup

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create `.env.local` with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open:** [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Supabase (Auth + Database)

## Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Run ESLint
