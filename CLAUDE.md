# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Version Warning

This project uses versions that may differ significantly from your training data:
- **Next.js 16.2.6** — newer than Next.js 15; APIs and conventions may differ
- **React 19.2.4** — newer React APIs (use(), improved Suspense, etc.)
- **Tailwind CSS v4** — config-file-free, CSS-native approach; no `tailwind.config.js`

Before writing code that touches these APIs, read `node_modules/next/dist/docs/` for current conventions. Heed deprecation notices.

## Commands

All commands run from `wedding-app/`:

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (eslint-config-next/core-web-vitals + typescript)
```

No test framework is configured.

## Architecture

Single-page wedding invitation app using the **Next.js App Router**.

- `app/layout.tsx` — Root layout; loads Geist Sans + Geist Mono via `next/font/google`, applies Tailwind base styles
- `app/globals.css` — Global CSS (Tailwind v4 imports)
- `app/pagetest.tsx` — The entire wedding invitation as one `'use client'` page; self-contained components defined in the same file

**`pagetest.tsx` component structure** (all in one file):
1. `DynamicBGM` — Fixed top pill that expands (framer-motion layout animation) to show song info; controls an `<audio>` element
2. `FallingPetals` — Animated cherry blossom petals using absolute-positioned framer-motion divs
3. `GuestbookWall` — Polaroid-style guestbook with a form and `useState` message list (client-side only, no persistence)
4. `WeddingInvitation` — Root component assembling all sections: Hero, Intro, Gallery, Location, Guestbook, RSVP, Footer

**Path alias**: `@/*` resolves to the project root (`wedding-app/`).

**Key dependencies**: `framer-motion` (animations), `lucide-react` (icons).

## Notes

- `pagetest.tsx` is the active page — there is no `app/page.tsx`; this file would need to be renamed or a `page.tsx` created to route to it
- Guestbook messages are in-memory only (no backend/database)
- Map buttons (카카오맵, 네이버지도) are not yet wired to actual URLs
