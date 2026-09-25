<div align="center">

  <img src="public/image.svg" alt="CineStream Logo" width="120" height="120" />

  # 🎬 CineStream

  ### *The Next-Generation Cinematic & Anime Streaming Platform*

  [![Next.js 16](https://img.shields.io/badge/Next.js-16.2.9-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![Better Auth](https://img.shields.io/badge/Better_Auth-1.6.20-5865F2?style=for-the-badge&logo=auth0&logoColor=white)](https://www.better-auth.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-DB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

  <p align="center">
    <b>A modern, high-performance streaming web application built with Next.js 16 App Router, React 19, domain-driven modular architecture, multi-server video embedding, and real-time watch progress tracking.</b>
  </p>

</div>

<div align="center">

  **[🎥 Watch Demo](#-demo-walkthrough)** · **[🌐 Live Site](https://YOUR-LIVE-URL.vercel.app)** · **[✨ Features](#-what-it-does)** · **[🏗️ Architecture](#-project-architecture)** · **[⚡ Run Locally](#-getting-started)**

</div>

---

## 🎥 Demo Walkthrough

> 2-minute tour: browsing, multi-server playback, search, watchlist, and continue-watching.

<div align="center">

[![CineStream demo video](https://cdn.loom.com/sessions/thumbnails/YOUR_LOOM_VIDEO_ID-with-play.gif)](https://www.loom.com/share/YOUR_LOOM_VIDEO_ID)

https://github.com/user-attachments/assets/29550c97-6b00-4683-bed5-d1481b24d785



*Click to watch on Loom*

</div>

---

## ⚡ TL;DR

**CineStream** is a full-stack streaming app for Movies, TV Series and Anime, built with Next.js 16, React 19, Prisma and PostgreSQL.

- **Full-stack ownership:** UI, API routes, database schema, auth and third-party API integration, all in one project.
- **Real user data:** accounts, watch history and watchlist are stored per user in PostgreSQL.
- **Resilient playback:** multiple video servers with a fallback if one fails.
- **Maintainable structure:** code is organized by feature (`/features`), not by file type.

## ✨ What It Does

| | |
| :--- | :--- |
| 🎬 **Browse** | Movies, TV series and anime with carousels, Top 10 lists and trailers |
| ▶️ **Watch** | Season/episode picker, multiple servers, anime sub/dub |
| 🔍 **Search** | Live debounced search with mobile full-screen mode |
| 📌 **My List** | One-click bookmarking synced to your account |
| ⏱️ **Continue Watching** | Progress saved per movie / episode |
| 🔐 **Sign in** | Google OAuth or email + password |

---

## 🚀 Engineering Highlights (for Tech Leads)

Here are the architectural highlights and engineering capabilities demonstrated in this codebase:

### 1. 🏗️ Domain-Driven Modular Architecture (`/features`)
- Structured cleanly into domain feature packages (`features/movies`, `features/series`, `features/anime`, `features/auth`, `features/watchlist`, `features/userprofile`).
- Decouples component logic, custom hooks, data fetching services, and page layouts to ensure maintainability, scalability, and clean code principles.

### 2. 📺 Multi-Server Video Streaming Engine
- Built-in multi-server fallback player (`Videasy`, `Vidfast`, `VidLink Sub/Dub`, `VidSrc`, `EmbedAPI`).
- Dynamic season & episode selector with smooth UI auto-fade controls and iframe failover handling.
- Native support for Anime Subbed & Dubbed streaming servers via AniList & MyAnimeList API integration.

### 3. 🔐 Authentication (`Better Auth` + Prisma ORM)
- Secure session-based and token authentication utilizing **Better Auth** with a custom **PostgreSQL Prisma Adapter**.
- Multi-provider support: Google OAuth 2.0 and Email/Password credentials.
- Schema includes `User`, `Session`, `Account`, and `Verification` models with cascading constraints.

### 4. 🕒 Real-Time Watch History & Watchlist Synchronization
- Automatically records and calculates watch progress (`UserWatchHistory`) across movies, series, and anime episodes.
- Persistent local and server-side state for **"Continue Watching"** carousels.
- One-click **My List** bookmarking API (`/api/watchlist`) linked to user accounts.

### 5. 🔍 Real-Time Instant Search & Smart Navigation
- Debounced live search overlay (`SearchBar.jsx`) with dynamic URL slug routing (`/search/[...slug]`).
- Smart session history stack tracker (`sessionStorage`) that automatically handles back-navigation without trapping users in video player loops.
- Fully responsive navigation with full-screen mobile search and slide-out drawers.

### 6. 🎨 "Cinematic Noir" Custom Design System
- Engineered using **Tailwind CSS v4** `@theme` design tokens with custom HSL surfaces, Cyber-Cyan (`#00D1FF`) glows, and glassmorphic navigation bars (`backdrop-blur-xl`).
- High-touch interactive components using **Swiper.js** for responsive touch carousels and numbered rank outlines for Top 10 lists.

---

## 📂 Project Architecture

```plain
CineStream/
├── app/                        # Next.js 16 App Router Pages & API Routes
│   ├── (auth)/                 # Login & Registration route groups
│   ├── anime/                  # Anime Hub, Details & Episode Player routes
│   ├── api/                    # Serverless API routes (auth, watchlist)
│   ├── movie/                  # Movie Hub, Details & Player routes
│   ├── mylist/                 # User Watchlist page
│   ├── profile/                # User Profile page
│   ├── search/                 # Dynamic search routing
│   ├── series/                 # TV Series, Seasons & Episode routes
│   ├── tv/                     # TV Shows Hub
│   ├── globals.css             # Tailwind v4 theme tokens & custom CSS
│   └── layout.js               # Root application layout & provider setup
│
├── features/                   # Domain-Driven Modular Feature Packages
│   ├── anime/                  # Anime components (Player, Carousels, Top 10, Shonen Hits)
│   ├── auth/                   # Sign In & Sign Up components
│   ├── movies/                 # Movie components (Hero Carousel, Trailers, Continue Watching)
│   ├── series/                 # Series components (Episode Player, Season selector, Airing Today)
│   ├── tvshows/                # TV Show showcase components
│   ├── userprofile/            # User profile management
│   └── watchlist/              # Watchlist management components
│
├── components/                 # Shared UI Components (NavBar, Footer, SearchBar)
├── lib/                        # Core Utilities & Configurations
│   ├── auth.ts                 # Better Auth server configuration
│   ├── auth-client.ts          # Better Auth client hooks
│   ├── db.js                   # Prisma Client database instance
│   └── tenstack/               # TanStack React Query client setup
│
└── prisma/                     # Database Schema & Migrations
    ├── schema.prisma           # Prisma PostgreSQL data models
    └── migrations/             # SQL Migration history
```

---

## 🗄️ Database Schema & Models

The database is powered by **PostgreSQL** through **Prisma ORM**:

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

## 🛠️ Tech Stack & Libraries

| Domain | Technology / Library | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | React Server Components, File-based routing, Dynamic API routes |
| **UI Library** | [React 19](https://react.dev/) | Concurrent rendering, modern hooks, server components |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Custom `@theme` tokens, glassmorphism, responsive layout grid |
| **Authentication** | [Better Auth](https://www.better-auth.com/) | OAuth (Google), Email/Password, session management |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) | Type-safe queries, migration control, `@prisma/adapter-pg` |
| **State & Querying** | [TanStack React Query](https://tanstack.com/query) | Client-side query caching and data synchronization |
| **Carousels & Motion** | [Swiper.js](https://swiperjs.com/) | Touch-enabled responsive carousels with autoplay & pagination |
| **External APIs** | TMDB API, AniList GraphQL, MyAnimeList API | Live movie, series, and anime metadata ingestion |

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or higher (v20+ recommended)
- **Bun / npm / pnpm / yarn** installed
- **PostgreSQL Database** (Local instance or hosted service like Supabase/Neon)

### 2. Environment Setup
Create a `.env` file in the root directory and configure the following environment variables:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/cinestream?schema=public"

# Authentication (Better Auth)
BETTER_AUTH_SECRET="your-super-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# TMDB API Integration
NEXT_PUBLIC_TMDB_BASE_URL="https://api.themoviedb.org"
NEXT_PUBLIC_ACCESS_TOKEN="your-tmdb-bearer-token"
```

### 3. Install Dependencies
```bash
npm install
# or
bun install
```

### 4. Database Setup & Prisma Migrations
```bash
npx prisma db push
# or
npx prisma migrate dev
```

### 5. Launch Development Server
```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore **CineStream**.

---

## 📈 Production Build & Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with HMR |
| `npm run build` | Compiles the production build for deployment |
| `npm run start` | Runs the compiled production server |
| `npx prisma studio` | Opens Prisma Studio GUI to inspect DB records |

---

<div align="center">
  <p>Crafted with 💙 using Next.js 16, React 19, and Tailwind CSS v4</p>
</div>
