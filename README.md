# CineStream

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.9-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.6.20-5865F2?logo=auth0&logoColor=white)](https://www.better-auth.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A streaming web app for movies, TV series, and anime, built with Next.js 16 (App Router), React 19, Prisma, and PostgreSQL. Supports multi-server video playback with automatic fallback and per-user watch history/watchlist tracking.

**[Demo](#demo)** · **[Features](#what-it-does)** · **[Architecture](#project-architecture)** · **[Run locally](#getting-started)**

---

## Demo

75-second tour: movies, series, anime, TV shows, My List, and Continue Watching.

https://github.com/user-attachments/assets/8c96b2eb-ddd0-4047-9ac1-7cdd25d4d5ff

---

## Summary

CineStream is a full-stack streaming app for movies, TV series, and anime.

- Full-stack ownership: UI, API routes, database schema, auth, and third-party API integration.
- Real user data: accounts, watch history, and watchlist are stored per user in PostgreSQL.
- Resilient playback: multiple video servers with automatic fallback if one fails.
- Feature-organized codebase (`/features`), not organized by file type.

## What it does

| | |
| :--- | :--- |
| Browse | Movies, TV series, and anime with carousels, Top 10 lists, and trailers |
| Watch | Season/episode picker, multiple servers, anime sub/dub |
| Search | Live debounced search with a mobile full-screen mode |
| My List | One-click bookmarking synced to the user's account |
| Continue Watching | Progress saved per movie/episode |
| Sign in | Google OAuth or email + password |

---

## Notable implementation details

### Domain-organized structure (`/features`)
Code is split into feature packages (`features/movies`, `features/series`, `features/anime`, `features/auth`, `features/watchlist`, `features/userprofile`), each owning its own components, hooks, and data fetching.

### Multi-server video playback
A player with fallback across multiple embed sources (Videasy, Vidfast, VidLink Sub/Dub, VidSrc, EmbedAPI), a season/episode selector, and native anime sub/dub support via AniList and MyAnimeList APIs.

### Authentication
Session-based auth via Better Auth with a PostgreSQL Prisma adapter. Supports Google OAuth 2.0 and email/password. Schema includes `User`, `Session`, `Account`, and `Verification` models.

### Watch history and watchlist sync
Tracks watch progress (`UserWatchHistory`) across movies, series, and anime episodes, backing the "Continue Watching" carousels. Watchlist bookmarking goes through `/api/watchlist`.

### Search and navigation
Debounced live search (`SearchBar.jsx`) with dynamic URL routing (`/search/[...slug]`), plus a session history stack (`sessionStorage`) to handle back-navigation without trapping users in the video player.

### Design system
Tailwind CSS v4 `@theme` tokens for custom HSL surfaces and a glassmorphic navigation bar. Swiper.js for touch carousels.

---

## Project architecture

```plain
CineStream/
├── app/                        # Next.js 16 App Router pages & API routes
│   ├── (auth)/                 # Login & registration route groups
│   ├── anime/                  # Anime hub, details & episode player routes
│   ├── api/                    # Serverless API routes (auth, watchlist)
│   ├── movie/                  # Movie hub, details & player routes
│   ├── mylist/                 # User watchlist page
│   ├── profile/                # User profile page
│   ├── search/                 # Dynamic search routing
│   ├── series/                 # TV series, seasons & episode routes
│   ├── tv/                     # TV shows hub
│   ├── globals.css             # Tailwind v4 theme tokens & custom CSS
│   └── layout.js               # Root application layout & provider setup
│
├── features/                   # Feature packages
│   ├── anime/                  # Player, carousels, Top 10, Shonen Hits
│   ├── auth/                   # Sign in & sign up components
│   ├── movies/                 # Hero carousel, trailers, Continue Watching
│   ├── series/                 # Episode player, season selector, Airing Today
│   ├── tvshows/                # TV show showcase components
│   ├── userprofile/            # User profile management
│   └── watchlist/              # Watchlist management components
│
├── components/                 # Shared UI components (NavBar, Footer, SearchBar)
├── lib/                         # Core utilities & configuration
│   ├── auth.ts                 # Better Auth server configuration
│   ├── auth-client.ts          # Better Auth client hooks
│   ├── db.js                   # Prisma client instance
│   └── tenstack/               # TanStack React Query client setup
│
└── prisma/                     # Database schema & migrations
    ├── schema.prisma           # Prisma PostgreSQL data models
    └── migrations/              # SQL migration history
```

---

## Database schema

PostgreSQL via Prisma ORM:

```mermaid
erDiagram
    User ||--o{ UserWatchHistory : tracks
    User ||--o{ UserWatchList : saves
    User ||--o{ Session : owns
    User ||--o{ Account : links

    User {
        string id PK
        string name
        string email UK
        string password
        boolean emailVerified
        string image
        datetime createdAt
    }

    UserWatchHistory {
        string id PK
        string user_id FK
        int tmdb_id
        string type "movie | tv | anime"
        int progress
        int season
        int episode
    }

    UserWatchList {
        string id PK
        string user_id FK
        int tmdb_id
        string type "movie | tv | anime"
    }

    Session {
        string id PK
        string token UK
        string userId FK
        datetime expiresAt
    }
```

---

## Tech stack

| Domain | Technology | Notes |
| :--- | :--- | :--- |
| Framework | [Next.js 16 (App Router)](https://nextjs.org/) | React Server Components, file-based routing |
| UI library | [React 19](https://react.dev/) | Concurrent rendering, server components |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) | Custom `@theme` tokens, responsive layout |
| Authentication | [Better Auth](https://www.better-auth.com/) | Google OAuth, email/password, session management |
| Database & ORM | [Prisma ORM](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) | Type-safe queries, `@prisma/adapter-pg` |
| State & querying | [TanStack React Query](https://tanstack.com/query) | Client-side caching and sync |
| Carousels | [Swiper.js](https://swiperjs.com/) | Touch-enabled responsive carousels |
| External APIs | TMDB API, AniList GraphQL, MyAnimeList API | Movie, series, and anime metadata |

---

## Getting started

### Prerequisites
- Node.js v18+ (v20+ recommended)
- Bun, npm, pnpm, or yarn
- PostgreSQL (local or hosted, e.g. Supabase/Neon)

### Environment setup
Copy `.env.example` to `.env` (`cp .env.example .env`). It already includes demo TMDB and MyAnimeList keys, so you only need to set `DATABASE_URL` and `BETTER_AUTH_SECRET`. Google sign-in is optional. Full list of variables:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/cinestream?schema=public"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your-super-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# TMDB API Integration (use the "API Read Access Token" from your TMDB account)
NEXT_PUBLIC_TMDB_BASE_URL="https://api.themoviedb.org"
NEXT_PUBLIC_ACCESS_TOKEN="your-tmdb-bearer-token"
ACCESS_TOKEN="your-tmdb-bearer-token"   # same token, used by server-rendered anime pages

# MyAnimeList (anime pages) - create a client ID at myanimelist.net > Profile > API
CILENTID="your-mal-client-id"
NEXT_PUBLIC_MAL_CLIENT_ID="your-mal-client-id"
```

### Install dependencies
```bash
npm install
# or
bun install
```

### Database setup & Prisma migrations
```bash
npx prisma db push
# or
npx prisma migrate dev
```

### Launch development server
```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with HMR |
| `npm run build` | Compiles the production build |
| `npm run start` | Runs the compiled production server |
| `npx prisma studio` | Opens Prisma Studio to inspect DB records |
