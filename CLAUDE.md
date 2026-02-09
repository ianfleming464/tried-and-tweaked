# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.
Keep changes small, safe, and Phase-appropriate.

---

## Project Summary

**Family Recipe Manager** — mobile-first web app for storing and scaling recipes.

Tech:
- Next.js (App Router)
- React
- Prisma ORM + SQLite
- Tailwind CSS
- **JSX only** (no TypeScript in Phase 1)

Phase 1 constraints:
- Single-user
- No auth
- Image URLs only (no uploads)

---

## Core Features (Phase 1)

- Recipe CRUD (title, description, imageUrl, baseServings, source, categories)
- Ingredients + Steps with ordering
- Portion scaling (2–6 servings)
- Search (title + description)
- Category filtering (OR logic)
- Responsive mobile-first UI

---

## Commands

### App
- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — production build
- `npm start` — run production server
- `npm run lint` — ESLint

### Prisma / DB
Paths:
- Schema: `prisma/schema.prisma`
- Seed: `prisma/seed.js`
- DB file: `prisma/dev.db` (gitignored)
- Prisma client output: `app/generated/prisma` (gitignored)

Commands:
- `npx prisma generate`
- `npx prisma migrate dev --name <desc>`
- `npx prisma migrate reset`
- `npx prisma db push` (prototyping only; prefer migrations)
- `npx prisma studio`
- `npx prisma db seed`

Import Prisma client:
```js
import { PrismaClient } from '@/app/generated/prisma'
