# PROJECT_DEEP_DIVE.md — Family Recipe Manager

This is the long-form architecture and implementation guide for the current codebase.

Current stack (source of truth):
- Next.js 16 (App Router)
- React 19
- Prisma ORM
- Neon Postgres
- Vercel Blob (image uploads)
- Mobile-first UI

For day-to-day commands and quick runbooks, use `DEV_GUIDE.md`.

## 1) Product Scope

Family Recipe Manager is a single-user recipe app optimized for phone usage while cooking.

Core capabilities:
- Create, edit, delete recipes
- Ingredient and step management with ordering
- Recipe search (title/description)
- Category filtering (multi-select AND logic)
- Serving-size scaling on recipe detail pages
- Image upload via Vercel Blob

## 2) High-Level Architecture

Data/rendering flow:

```text
Browser (Client Components)
    ⇅
Next.js App Router (Server Components + API Routes)
    ⇅
Prisma Client
    ⇅
Neon Postgres

File Upload Flow:
Browser file input -> POST /api/upload -> Vercel Blob -> Blob URL -> saved in Recipe.imageUrl
```

Key split:
- Server Components fetch data (`app/page.js`, `app/recipes/[id]/page.js`, `app/recipes/[id]/edit/page.js`)
- Client Components handle interactivity (`RecipeForm`, `RecipeGrid`, `RecipeDetail`)
- API routes handle mutations and upload (`app/api/recipes`, `app/api/recipes/[id]`, `app/api/upload`)

## 3) Data Model

Defined in `prisma/schema.prisma`.

Main entities:
- `Recipe`
  - Core metadata (`title`, `description`, `imageUrl`, `source`, `categories`)
  - `baseServings`
  - Timestamps (`createdAt`, `updatedAt`)
- `Ingredient`
  - Belongs to a recipe via `recipeId`
  - Uses `amountText` as primary UX field (e.g. `450g`, `1 sachet`, `pinch`)
  - Stores optional parsed `quantity`/`unit` for scalable numeric amounts
  - Ordered via `order`
- `Step`
  - Belongs to a recipe via `recipeId`
  - Ordered via `order`

Relation behavior:
- `Ingredient`/`Step` are cascade-deleted when a `Recipe` is deleted.

## 4) Runtime Data Access Strategy

`app/lib/prisma.js` uses a standard singleton pattern:
- One Prisma client per server runtime process
- Prevents unnecessary connection churn in development

Pages marked as dynamic where needed:
- Home and recipe pages run as dynamic server-rendered pages to avoid stale build-time data assumptions.

## 5) CRUD API Design

### `POST /api/recipes` (`app/api/recipes/route.js`)
Creates recipe + nested ingredients + steps.

Validates:
- Non-empty title
- `baseServings >= 1`
- At least one category
- At least one ingredient
- At least one step

### `PUT /api/recipes/[id]` (`app/api/recipes/[id]/route.js`)
Updates recipe in transaction.

Update strategy:
- Verify recipe exists
- Delete all existing ingredients/steps
- Recreate from submitted form payload

This keeps ordering logic simple and deterministic for a small app.

### `DELETE /api/recipes/[id]` (`app/api/recipes/[id]/route.js`)
Deletes recipe after existence check.

## 6) Image Upload Architecture

Upload endpoint: `POST /api/upload` (`app/api/upload/route.js`)

Behavior:
- Accepts multipart `file`
- Validates type: JPEG/PNG/WEBP/GIF
- Validates size: <= 5MB
- Uploads to Vercel Blob via `put(...)`
- Returns `{ url, pathname }`

Form behavior in `app/components/RecipeForm.js`:
- Upload-first flow (no manual URL input in form)
- User selects file via styled button
- On submit, file is uploaded first
- Returned Blob URL is saved into recipe `imageUrl`
- In edit mode, existing image URL is retained unless a new file is selected

Required env var:
- `BLOB_READ_WRITE_TOKEN`

## 7) Search and Category Filtering

Filtering utility: `app/lib/recipeFilters.js`

Current rules:
- Search query matches title OR description (case-insensitive)
- Category filtering uses **AND logic** for multi-select
  - If user selects `Vegan` + `Pasta`, recipe must include both
- Sorting options:
  - newest
  - oldest
  - alphabetical

UI integration:
- `RecipeGrid` delegates filtering/sorting to `filterAndSortRecipes(...)`.

## 8) Mobile-First UX Conventions

General:
- Touch-friendly controls
- Stacked layouts by default
- Progressive enhancement to larger breakpoints

Examples:
- Form editor sections are stacked cards
- Category chips are horizontally scrollable
- Detail page keeps core actions visible and simple
- E2E smoke uses iPhone profile to catch mobile regressions

## 9) Testing Strategy

The project uses two layers:

### Unit/Route tests (Vitest)
- `tests/api/recipes.route.test.js`
- `tests/api/recipe-id.route.test.js`
- `tests/api/upload.route.test.js`
- `tests/lib/recipeFilters.test.js`

Coverage includes:
- Create/update/delete route behavior
- Basic validation + not-found branches
- Upload success/failure validation
- Search + AND category filter logic

Command:
```bash
npm test
```

### Mobile smoke E2E (Playwright)
- `tests/e2e/mobile-smoke.spec.js`

Flow covered in one test:
- Create recipe (with mocked `/api/upload` response)
- Edit recipe title
- Search recipe by title
- Verify multi-tag AND behavior (`Vegan` + `Pasta`)
- Delete recipe

Command:
```bash
npm run test:e2e
```

Note:
- The E2E test runs against a local dev server from `playwright.config.mjs`.
- Upload endpoint is mocked in test for speed/reliability.

## 10) Operational Environment

Expected env vars:
- `DATABASE_URL` (Neon pooled)
- `DIRECT_URL` (Neon direct; Prisma migrate)
- `BLOB_READ_WRITE_TOKEN` (Vercel Blob upload)

Local baseline file:
- `.env.example`

## 11) Important Implementation Choices

Why categories are stored as comma-separated string:
- Keeps model simple for fixed category list in current scope
- Works fine with in-memory filtering on fetched list
- Can evolve later to normalized many-to-many if taxonomy grows

Why update route recreates ingredients/steps:
- Easier than diffing nested arrays
- Low risk/low complexity for small app
- Preserves deterministic ordering behavior

Why upload route is server-side:
- Keeps Blob token off client
- Centralized validation
- Cleaner future extension path (virus scanning, moderation, transforms)

## 12) Known Constraints / Backlog

- No browser-level image optimization yet (`<img>` still used in detail/card views)
- No blob cleanup job for replacing/deleting old image objects
- No auth / ownership model (single-user)
- No advanced media pipeline (thumbnails, variants)

## 13) Future-Friendly Extensions

Natural next steps:
- Add blob cleanup on recipe delete / image replace
- Convert category storage to normalized relation if custom tags are introduced
- Add optimistic UI for edit/delete flows
- Add additional E2E cases for error states and accessibility checks
- Introduce image transformations or CDN variants

---

If something in this document conflicts with code, treat these files as canonical:
1. `prisma/schema.prisma`
2. `app/api/**/*`
3. `app/components/**/*`
4. `DEV_GUIDE.md`
