# Developer Guide (Agent-Optimized): Family Recipe Manager

This file is intentionally lean to reduce token usage for agentic coding.
- For “how to work in this repo” (commands, rules, business logic), see **CLAUDE.md**
- For deep explanations (architecture, file walkthroughs, debugging narratives), see **PROJECT_DEEP_DIVE.md**

---

## TL;DR

Family Recipe Manager is a mobile-first web app for storing and scaling family recipes.

Core capabilities:
- CRUD recipes with ingredients + steps
- Portion scaling (2–6 servings)
- Search + category filtering
- Mobile-first UI
- Phase 1 is single-user, no auth

---

## Phase 1 — MVP (single-user) ✅ COMPLETE

### Status: DEPLOYED TO PRODUCTION
- **Production URL**: https://tried-and-tweaked.vercel.app
- **Database**: Turso (LibSQL) - serverless SQLite
- **Hosting**: Vercel

### Completed Features
- ✅ Home: recipe grid + search + category filter
- ✅ Recipe detail: ingredients + steps visible together (no tab switching required)
- ✅ Serving selector: scales ingredients instantly
- ✅ Create recipe
- ✅ Edit recipe
- ✅ Delete recipe (with confirmation)
- ✅ Seed data with 6 sample recipes
- ✅ Mobile-first responsive design
- ✅ Production deployment with Turso database

### Deployment Architecture
- **Local Development**: SQLite file database (`prisma/dev.db`)
- **Production**: Turso (LibSQL) via `@prisma/adapter-libsql`
- **Auto-detection**: [app/lib/prisma.js](app/lib/prisma.js) switches between SQLite and Turso based on environment

### Environment Variables
- **Local**: `DATABASE_URL="file:./dev.db"`
- **Production (Vercel)**: `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`

### Out of scope (Phase 1)
- Authentication / multi-user
- Image upload (URLs only)
- Recipe sharing
- Import-from-URL
- Nutrition info

---

## Phase 2 — Quality-of-life + enhancements

Not required for Phase 1. Examples:
- Auth / multi-user
- Image upload (choose storage approach)
- Favorites / wishlist
- Recipe sharing/export
- Import from URLs
- Nutrition info
- Better category system (potential schema change)

---

## Guardrails for Agents

- Follow **CLAUDE.md** as the source of truth for:
  - development commands
  - database paths
  - business logic rules (scaling, filtering, validation)
  - coding conventions (JSX, component style)
- Prefer small, reversible changes.
- Avoid adding dependencies unless Phase 1 clearly needs it.
- Keep mobile-first UX as the default.

---

## Quick runbook (minimal)

Full details are in **CLAUDE.md**.

### Local Development
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Prisma generate: `npx prisma generate`
- Reset DB + seed: `npx prisma migrate reset`

### Production Database Operations
Requires your Turso credentials from Vercel environment variables:

```bash
# Run migrations to Turso
TURSO_DATABASE_URL="<url>" TURSO_AUTH_TOKEN="<token>" npx prisma migrate deploy

# Seed production database
TURSO_DATABASE_URL="<url>" TURSO_AUTH_TOKEN="<token>" npx prisma db seed
```

### Deployment
- **Auto-deploy**: Push to `main` branch triggers Vercel deployment
- **Manual deploy**: Vercel dashboard → Deployments → Redeploy
