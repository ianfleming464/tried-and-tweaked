# Developer Guide: Family Recipe Manager

This guide provides a deep dive into the codebase architecture, explaining not just WHAT each file does, but WHY it's structured this way. Perfect for learning Next.js, React patterns, and full-stack development.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File-by-File Breakdown](#file-by-file-breakdown)
3. [Data Flow & Request Lifecycle](#data-flow--request-lifecycle)
4. [Database Architecture](#database-architecture)
5. [Component Patterns](#component-patterns)
6. [Scaling Logic Deep Dive](#scaling-logic-deep-dive)
7. [Adding New Features](#adding-new-features)
8. [Best Practices Used](#best-practices-used)
9. [Common Debugging Scenarios](#common-debugging-scenarios)

---

## Architecture Overview

### High-Level Architecture

This is a **full-stack React application** using Next.js App Router:

```
Browser (Client)
    ↓ ↑
Next.js Pages (Server Components)
    ↓ ↑
API Routes (Server-side)
    ↓ ↑
Prisma ORM
    ↓ ↑
SQLite Database
```

### Why This Stack?

**Next.js App Router** (instead of Pages Router):
- **Reason**: Modern React architecture with better performance
- **Benefit**: Server Components by default = faster initial page loads
- **Benefit**: Colocation of data fetching with UI components
- **Tradeoff**: Steeper learning curve, but better long-term patterns

**Server Components vs Client Components**:
- **Server Components** (default): Fetch data, render on server, send HTML to browser
  - Used for: Pages that fetch data (home, detail, edit)
  - Benefit: No JavaScript sent to browser for these components
  - Benefit: Direct database access (no API needed)

- **Client Components** (`'use client'`): Interactive, run in browser
  - Used for: Forms, search, filters, modals
  - Reason: Need state (`useState`), event handlers, interactivity
  - Tradeoff: Adds JavaScript to browser bundle

**Prisma + SQLite**:
- **Reason**: Type-safe database queries with great developer experience
- **SQLite**: Perfect for single-user, no separate database server needed
- **Alternative**: Could use PostgreSQL/MySQL for multi-user (future phase)

**JSX (not TypeScript)**:
- **Reason**: Simpler for learning, less configuration
- **Tradeoff**: No compile-time type checking
- **Future**: Easy to migrate to TypeScript later

---

## File-by-File Breakdown

### Root Directory Files

#### `package.json`
**Purpose**: Defines project dependencies and scripts

**Key sections**:
```json
{
  "scripts": {
    "dev": "next dev --webpack",     // Why webpack? Stability during transition
    "build": "next build --webpack",
    "start": "next start",           // Production server
    "lint": "eslint"
  },
  "prisma": {
    "seed": "node prisma/seed.js"    // Runs automatically after migrations
  }
}
```

**Why the `prisma.seed` config?**
- Tells Prisma to run seed file after `npx prisma migrate dev`
- Auto-populates database with sample recipes for development
- Note: There's a deprecation warning (move to `prisma.config.ts` in Prisma 7)

#### `jsconfig.json`
**Purpose**: Configures JavaScript import paths

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]    // Enables: import X from '@/app/components/X'
    }
  }
}
```

**Why use path aliases?**
- Cleaner imports: `@/app/components/X` vs `../../../components/X`
- Easier refactoring: moving files doesn't break imports
- Standard Next.js convention

#### `next.config.mjs`
**Purpose**: Next.js configuration

Currently minimal - mostly defaults. Future use cases:
- Image optimization domains
- Environment variable exposure to client
- Redirect rules
- Custom webpack config

#### `prisma.config.ts`
**Purpose**: Prisma configuration (newer approach)

```typescript
import "dotenv/config";  // CRITICAL: Loads .env file
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),  // Reads from .env
  },
});
```

**Why import dotenv here?**
- Prisma config runs before environment is loaded
- Without this, `DATABASE_URL` would be undefined
- Alternative: Use Bun runtime (has built-in .env support)

#### `.env`
**Purpose**: Environment variables (gitignored for security)

```env
DATABASE_URL="file:./dev.db"
```

**Why file-based SQLite?**
- No server setup needed
- Database is just a file (`prisma/dev.db`)
- Perfect for single-user apps
- Easy backup: just copy the `.db` file

**Security note**: Never commit `.env` to git (already in `.gitignore`)

#### `.gitignore`
**Purpose**: Tells git what NOT to track

Key exclusions:
```
/node_modules              # Dependencies (huge, reproducible from package.json)
/.next/                    # Build output (regenerated)
/app/generated/prisma      # Generated code (from schema)
*.db                       # Database files (personal data)
.env*                      # Secrets and config
```

---

### `/prisma` Directory

#### `schema.prisma`
**Purpose**: Single source of truth for database structure

**Why one file for everything?**
- Prisma's design: easier to see all relationships at once
- Migrations are generated from this file
- Changes here → run `prisma migrate dev` → updates database

**Detailed breakdown**:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"  // Custom location (default is node_modules)
}
```
**Why custom output location?**
- Keeps generated code visible in project structure
- Easier to see what's being generated
- Some prefer `node_modules/.prisma/client` (standard location)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
**Why SQLite?**
- Phase 1: single-user app
- Future: easy to swap to PostgreSQL by changing provider

```prisma
model Recipe {
  id           Int          @id @default(autoincrement())
  title        String
  description  String?      // ? means optional (can be NULL)
  imageUrl     String?
  baseServings Int          @default(4)
  source       String?
  categories   String       // Stored as comma-separated
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt  // Auto-updates on save
  ingredients  Ingredient[] // One-to-many relation
  steps        Step[]       // One-to-many relation
}
```

**Why comma-separated categories instead of a separate Category table?**
- Simpler for Phase 1 (fixed category list)
- No joins needed when querying
- Tradeoff: Can't easily query "all recipes in category X" efficiently
- Future: Migrate to proper many-to-many relation when adding custom categories

```prisma
model Ingredient {
  id       Int     @id @default(autoincrement())
  name     String
  quantity Float   // Decimal quantities (2.5 cups, 1.75 tsp)
  unit     String
  note     String?
  order    Int     // Explicit ordering (1, 2, 3...)
  recipeId Int
  recipe   Recipe  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}
```

**Why `onDelete: Cascade`?**
- When recipe is deleted, ingredients auto-delete
- Prevents orphaned data
- Database enforces referential integrity

**Why explicit `order` field?**
- Array order isn't guaranteed in databases
- User might want to reorder ingredients later (drag-and-drop feature)
- Alternative: Use array positions, but harder to reorder

```prisma
model Step {
  id       Int    @id @default(autoincrement())
  text     String
  order    Int
  recipeId Int
  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}
```

Same principles as Ingredient model.

#### `seed.js`
**Purpose**: Populate database with sample recipes for development

**Structure**:
```javascript
const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.step.deleteMany({});
  await prisma.ingredient.deleteMany({});
  await prisma.recipe.deleteMany({});

  // Create recipes with nested ingredients and steps
  await prisma.recipe.create({
    data: {
      title: 'Classic Spaghetti Carbonara',
      // ... other fields ...
      ingredients: {
        create: [/* array of ingredients */]
      },
      steps: {
        create: [/* array of steps */]
      }
    }
  });
}
```

**Why delete in this order (steps → ingredients → recipes)?**
- Foreign key constraints: can't delete recipe while ingredients exist
- Deleting in reverse dependency order prevents constraint violations
- Alternative: Use `prisma.recipe.deleteMany()` first if cascade is configured

**Why use nested create?**
- Single transaction: all or nothing
- More efficient than separate queries
- Ensures data consistency

---

### `/app` Directory (Next.js App Router)

#### `app/layout.js`
**Purpose**: Root layout wrapping all pages

```javascript
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
```

**Why import fonts this way?**
- Next.js optimizes font loading
- Self-hosted (no external request to Google Fonts)
- FOUT (Flash of Unstyled Text) prevention
- `variable` creates CSS variable `--font-geist-sans`

**Layout vs Page**:
- Layout: Wrapper that persists across navigation
- Page: Content that changes
- Layout renders once, pages swap out

#### `app/page.js` (Home Page)
**Purpose**: Recipe grid with search and filters

**Why Server Component?**
```javascript
import { PrismaClient } from '@/app/generated/prisma';

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <RecipeGrid recipes={recipes} />;
}
```

**Benefits**:
- Data fetching on server (faster, direct database access)
- No loading spinner needed (server waits for data)
- No API route needed (server component can query directly)
- SEO-friendly (full HTML sent to browser)

**Why pass data to Client Component?**
- RecipeGrid needs interactivity (search, filter, sort)
- Server Component fetches data → Client Component makes it interactive
- Serialization: recipes are JSON-serialized and sent to browser

#### `app/recipes/[id]/page.js` (Recipe Detail)
**Purpose**: Show full recipe with scaling

**Dynamic Route Syntax**:
- `[id]` in folder name = dynamic route
- URL `/recipes/1` → `params.id = "1"`
- URL `/recipes/42` → `params.id = "42"`

**Next.js 16 Change**:
```javascript
export default async function RecipePage({ params }) {
  const { id } = await params;  // REQUIRED in Next.js 16+
  const recipe = await prisma.recipe.findUnique({
    where: { id: parseInt(id) },
    include: {
      ingredients: { orderBy: { order: 'asc' } },
      steps: { orderBy: { order: 'asc' } }
    }
  });
}
```

**Why `await params`?**
- Next.js 16 made params async for consistency
- Allows Next.js to prefetch and stream data
- Breaking change from Next.js 15

**Why `include`?**
- Default: Only recipe fields returned
- `include: { ingredients: true }` = join ingredients
- Eager loading: one query vs. N+1 queries

**Why `orderBy`?**
- Explicit ordering by our `order` field
- Without this, order would be random/by ID
- Could also order in JavaScript, but DB is more efficient

**Why `parseInt(id)`?**
- URL params are always strings ("1", "42")
- Database expects integer
- No parseInt = type mismatch error

**Why use `notFound()`?**
```javascript
if (!recipe) {
  notFound();  // Next.js helper
}
```
- Returns 404 page
- Better UX than error page
- Proper HTTP status code

#### `app/recipes/[id]/edit/page.js` (Recipe Edit)
**Purpose**: Edit existing recipe

**Why almost identical to detail page?**
- Same data fetching pattern
- Different component (`RecipeForm` vs `RecipeDetail`)
- Reuses form component with `mode="edit"` prop

**Component reuse**:
```javascript
<RecipeForm mode="edit" initialData={recipe} />
```
- Single form component for create AND edit
- Conditional logic based on mode
- DRY principle (Don't Repeat Yourself)

#### `app/recipes/new/page.js` (Create Recipe)
**Purpose**: Create new recipe

**Why simpler than edit?**
- No data fetching needed
- Just renders form with empty initial state
- Form handles everything

---

### `/app/components` Directory

#### Component Organization Philosophy

**Server vs Client Components**:

| Component | Type | Why? |
|-----------|------|------|
| RecipeCard | Server | Static display, no interaction |
| RecipeGrid | Client | Search, filter, sort state |
| RecipeForm | Client | Form inputs, state management |
| RecipeDetail | Client | Serving size selector (interactive) |
| IngredientList | Server | Could be server, but wrapped by client component |
| StepList | Server | Static list display |
| SearchBar | Client | Input handling, state |
| CategoryFilter | Client | Toggle buttons, state |
| ConfirmModal | Client | Show/hide state, event handlers |

#### `components/RecipeGrid.js`
**Purpose**: Main container for search, filter, and recipe display

**State management**:
```javascript
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategories, setSelectedCategories] = useState([]);
const [sortBy, setSortBy] = useState('newest');
```

**Why three separate state variables?**
- Independent concerns
- Each can update without affecting others
- Easier to reason about

**Computed filtering with useMemo**:
```javascript
const filteredAndSortedRecipes = useMemo(() => {
  let filtered = recipes;

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(recipe =>
      recipe.title.toLowerCase().includes(query) ||
      (recipe.description && recipe.description.toLowerCase().includes(query))
    );
  }

  // Category filter (OR logic)
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(recipe => {
      const recipeCategories = recipe.categories.split(',').map(c => c.trim());
      return selectedCategories.some(cat => recipeCategories.includes(cat));
    });
  }

  // Sort
  return [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
  });
}, [recipes, searchQuery, selectedCategories, sortBy]);
```

**Why useMemo?**
- Performance optimization
- Only recalculates when dependencies change
- Prevents filtering on every render
- Dependency array: `[recipes, searchQuery, selectedCategories, sortBy]`

**Why spread operator in sort?**
```javascript
return [...filtered].sort()  // Good
return filtered.sort()       // Bad! Mutates array
```
- Array.sort() mutates original array
- Spreading creates new array
- Prevents unexpected side effects

**Category filter logic**:
```javascript
selectedCategories.some(cat => recipeCategories.includes(cat))
```
- `.some()` = "at least one match" (OR logic)
- If recipe has ANY selected category, include it
- Alternative: `.every()` would be AND logic (must have ALL selected categories)

#### `components/RecipeCard.js`
**Purpose**: Display recipe in grid

**Why Link component?**
```javascript
import Link from 'next/link';

<Link href={`/recipes/${recipe.id}`}>
  <article>...</article>
</Link>
```

**Benefits of Next.js Link**:
- Client-side navigation (no page reload)
- Prefetching (loads linked page in background)
- Accessibility (proper link semantics)
- Don't use: `<a href>` or `onClick` navigation

**Image handling**:
```javascript
{recipe.imageUrl ? (
  <img src={recipe.imageUrl} alt={recipe.title} />
) : (
  <div>🍽️</div>  // Fallback emoji
)}
```

**Why conditional render?**
- Not all recipes have images
- Graceful degradation
- Future: Use Next.js Image component for optimization

**Date formatting**:
```javascript
const formattedDate = new Date(recipe.createdAt).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});
```
- Converts: `2024-01-15T10:30:00Z` → `Jan 15, 2024`
- Locale-aware formatting
- Alternative: Use library like `date-fns` for more control

#### `components/RecipeForm.js`
**Purpose**: Reusable form for create AND edit

**Why reusable?**
- DRY principle
- Same validation logic
- Same UI
- Mode prop switches behavior

**State structure**:
```javascript
const [ingredients, setIngredients] = useState([
  { name: '', quantity: '', unit: '', note: '', order: 1 }
]);
```

**Why array of objects?**
- Each ingredient is independent
- Order field for sorting
- Easy to add/remove items

**Adding ingredients**:
```javascript
const addIngredient = () => {
  setIngredients([
    ...ingredients,
    { name: '', quantity: '', unit: '', note: '', order: ingredients.length + 1 }
  ]);
};
```
- Spread existing ingredients
- Add new one at end
- Auto-increment order

**Removing ingredients**:
```javascript
const removeIngredient = (index) => {
  const updated = ingredients.filter((_, i) => i !== index);
  updated.forEach((ing, i) => ing.order = i + 1);  // Re-number
  setIngredients(updated);
};
```

**Why re-number orders?**
- Keeps order sequential (1, 2, 3...)
- If you remove #2, #3 becomes #2
- Prevents gaps in numbering

**Updating specific ingredient**:
```javascript
const updateIngredient = (index, field, value) => {
  const updated = [...ingredients];  // Clone array
  updated[index][field] = value;     // Mutate clone
  setIngredients(updated);           // Set new array
};
```

**Why clone first?**
- React state immutability
- Directly mutating `ingredients[index]` won't trigger re-render
- Must create new array for React to detect change

**Form submission**:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();  // Prevent form default (page reload)

  if (!validate()) return;

  const recipeData = {
    title: title.trim(),
    // ... transform form state to API format
    ingredients: validIngredients.map(ing => ({
      name: ing.name.trim(),
      quantity: parseFloat(ing.quantity),
      // ...
    }))
  };

  const response = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData),
  });

  const savedRecipe = await response.json();
  router.push(`/recipes/${savedRecipe.id}`);
};
```

**Why transform data?**
- Form uses strings ("2.5")
- API expects numbers (2.5)
- Trim whitespace
- Convert types

**Why `parseFloat` instead of `parseInt`?**
- Ingredients can be decimals (1.5 cups, 0.25 tsp)
- parseInt("2.5") = 2 (wrong!)
- parseFloat("2.5") = 2.5 (correct!)

#### `components/IngredientList.js`
**Purpose**: Display ingredients with scaled quantities

**Scaling calculation**:
```javascript
function scaleQuantity(baseQuantity, baseServings, selectedServings) {
  const scaleFactor = selectedServings / baseServings;
  const scaledValue = baseQuantity * scaleFactor;

  // Round to 0.25 increments for values < 10
  if (scaledValue < 10) {
    return Math.round(scaledValue * 4) / 4;
  }

  // Round to 1 decimal for larger values
  return Math.round(scaledValue * 10) / 10;
}
```

**Why different rounding strategies?**
- Small amounts: 0.25, 0.5, 0.75 (common cooking fractions)
- Large amounts: 1 decimal (15.5 cups)
- Better readability for cooks

**Examples**:
- Base: 2 cups for 4 servings, Scale to 6 servings
  - Scale factor: 6/4 = 1.5
  - Scaled: 2 × 1.5 = 3 cups

- Base: 1 tsp for 4 servings, Scale to 3 servings
  - Scale factor: 3/4 = 0.75
  - Scaled: 1 × 0.75 = 0.75 tsp (displays as "0.75 tsp" or "¾ tsp")

**"To taste" detection**:
```javascript
function shouldNotScale(ingredient) {
  const toTastePattern = /to taste/i;
  return (
    toTastePattern.test(ingredient.name) ||
    toTastePattern.test(ingredient.unit) ||
    (ingredient.note && toTastePattern.test(ingredient.note))
  );
}
```

**Why check all fields?**
- Could be in name: "Salt to taste"
- Could be in note: "to taste"
- Could be in unit: "to taste"
- Case-insensitive regex (`/i` flag)

**Zero quantity handling**:
```javascript
if (!ingredient.quantity || ingredient.quantity === 0) {
  return {
    quantity: 'As needed',
    unit: '',
    // ...
  };
}
```

**Use cases**:
- "Salt and pepper to taste"
- "Fresh herbs for garnish"
- "Water as needed"

#### `components/StepList.js`
**Purpose**: Display cooking instructions

**Why separate component?**
- Single responsibility
- Could add features later (timers, checkmarks)
- Reusable in different contexts

**Automatic numbering**:
```javascript
{steps.map((step, index) => (
  <li key={step.id}>
    <span>{index + 1}</span>  {/* Step 1, 2, 3... */}
    <p>{step.text}</p>
  </li>
))}
```

**Why index + 1?**
- Array indices start at 0
- Step numbers start at 1
- Alternative: Use step.order from database

#### `components/SearchBar.js`
**Purpose**: Search input and sort controls

**Controlled input pattern**:
```javascript
<input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**Why controlled?**
- React state is source of truth
- Can programmatically set value
- Can clear from outside (X button)
- Predictable behavior

**Clear button**:
```javascript
{searchQuery && (
  <button onClick={() => setSearchQuery('')}>✕</button>
)}
```

**Why conditional render?**
- Only show when there's text to clear
- Better UX (cleaner interface when empty)

#### `components/CategoryFilter.js`
**Purpose**: Horizontal scrolling category chips

**Horizontal scroll**:
```css
className="overflow-x-auto"
```

**Why horizontal scroll?**
- Mobile: saves vertical space
- Prevents wrapping
- All categories visible with scroll
- Native scroll (no JavaScript needed)

**Toggle pattern**:
```javascript
const toggleCategory = (category) => {
  setSelectedCategories(prev =>
    prev.includes(category)
      ? prev.filter(c => c !== category)  // Remove if exists
      : [...prev, category]               // Add if doesn't exist
  );
};
```

**Why use functional update?**
- `prev =>` ensures we have latest state
- Prevents race conditions
- Safe with async updates

#### `components/ConfirmModal.js`
**Purpose**: Confirmation dialog for destructive actions

**Modal pattern**:
```javascript
<div className="fixed inset-0">  {/* Overlay */}
  <div className="absolute inset-0" onClick={onCancel} />  {/* Click outside to close */}
  <div className="relative">  {/* Modal content */}
    {/* ... */}
  </div>
</div>
```

**Why this structure?**
- Fixed positioning: overlays entire viewport
- Absolute overlay: catches clicks outside modal
- Relative content: sits on top of overlay

**ESC key handling**:
```javascript
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && isOpen) {
      onCancel();
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onCancel]);
```

**Why useEffect?**
- Side effect: adding event listener
- Cleanup: remove listener when component unmounts
- Dependencies: re-attach if `onCancel` changes

---

### `/app/api` Directory

#### `api/recipes/route.js` (POST)
**Purpose**: Create new recipe

**API Route anatomy**:
```javascript
export async function POST(request) {
  const data = await request.json();  // Parse body

  // Validation
  if (!data.title) {
    return NextResponse.json(
      { error: 'Title required' },
      { status: 400 }
    );
  }

  // Database operation
  const recipe = await prisma.recipe.create({
    data: {
      title: data.title,
      ingredients: {
        create: data.ingredients  // Nested create
      }
    },
    include: {
      ingredients: true
    }
  });

  return NextResponse.json(recipe, { status: 201 });
}
```

**Why NextResponse?**
- Next.js helper for API responses
- Sets headers automatically
- Handles JSON serialization

**Status codes**:
- 200: Success (general)
- 201: Created (after POST)
- 400: Bad request (validation error)
- 404: Not found
- 500: Server error

**Nested create**:
```javascript
ingredients: {
  create: data.ingredients
}
```

**Why nested instead of separate queries?**
- Single transaction
- All or nothing (if ingredients fail, recipe doesn't get created)
- More efficient (one round-trip to database)

**Error handling**:
```javascript
try {
  // Database operations
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Failed to create' },
    { status: 500 }
  );
}
```

**Why catch errors?**
- Prevent server crashes
- Return user-friendly message
- Log error for debugging

#### `api/recipes/[id]/route.js` (PUT, DELETE)
**Purpose**: Update or delete recipe

**PUT (Update) strategy**:
```javascript
await prisma.$transaction(async (tx) => {
  // Delete all old ingredients
  await tx.ingredient.deleteMany({ where: { recipeId } });

  // Delete all old steps
  await tx.step.deleteMany({ where: { recipeId } });

  // Update recipe with new data
  return await tx.recipe.update({
    where: { id: recipeId },
    data: {
      title: data.title,
      ingredients: { create: data.ingredients },
      steps: { create: data.steps }
    }
  });
});
```

**Why delete-and-recreate instead of update?**
- Simpler: don't need to diff changes
- Handles add/remove/update in one pattern
- No orphaned records
- Tradeoff: Less efficient, but simpler logic

**Alternative approach** (more complex):
```javascript
// Compare existing vs new ingredients
// Update matching ones
// Create new ones
// Delete removed ones
```
- More efficient but much more complex
- Overkill for this use case

**Why transaction?**
- All operations succeed or all fail
- Prevents partial updates (recipe updated but ingredients fail)
- Database consistency guaranteed

**DELETE**:
```javascript
export async function DELETE(request, { params }) {
  const { id } = await params;

  await prisma.recipe.delete({
    where: { id: parseInt(id) }
  });

  return NextResponse.json({ success: true });
}
```

**Why no explicit ingredient deletion?**
- `onDelete: Cascade` in schema
- Database automatically deletes related records
- Simpler code, guaranteed by database

---

## Data Flow & Request Lifecycle

### Example: Viewing a Recipe

```
User clicks recipe card
    ↓
Next.js router navigates to /recipes/1
    ↓
Server Component: app/recipes/[id]/page.js
    ↓
Prisma query: findUnique with includes
    ↓
SQLite database returns recipe + ingredients + steps
    ↓
Server Component renders RecipeDetail
    ↓
HTML sent to browser
    ↓
Client Component hydrates (adds interactivity)
    ↓
User can now interact (change serving size)
```

### Example: Creating a Recipe

```
User fills form in RecipeForm component
    ↓
Clicks "Create Recipe" button
    ↓
Client-side validation runs
    ↓
fetch() POST to /api/recipes
    ↓
API Route: app/api/recipes/route.js
    ↓
Server-side validation
    ↓
Prisma transaction: create recipe with nested ingredients and steps
    ↓
SQLite inserts records
    ↓
API returns created recipe JSON
    ↓
Client receives response
    ↓
Router navigates to /recipes/:id
    ↓
User sees their new recipe
```

### Example: Searching Recipes

```
User types in search input
    ↓
onChange event fires
    ↓
setSearchQuery updates state
    ↓
RecipeGrid re-renders
    ↓
useMemo recalculates filteredAndSortedRecipes
    ↓
RecipeCard components re-render with filtered list
    ↓
User sees updated results (all client-side, no server request)
```

---

## Database Architecture

### Relationships

```
Recipe (1) ─────< Ingredient (many)
       (1) ─────< Step (many)
```

**One-to-Many**:
- One recipe has many ingredients
- One recipe has many steps
- Ingredient/Step cannot exist without recipe (cascade delete)

**Foreign Keys**:
```sql
-- Generated SQL
CREATE TABLE Ingredient (
  id INTEGER PRIMARY KEY,
  recipeId INTEGER NOT NULL,
  FOREIGN KEY (recipeId) REFERENCES Recipe(id) ON DELETE CASCADE
);
```

**Cascade delete behavior**:
```sql
DELETE FROM Recipe WHERE id = 1;
-- Automatically deletes:
--   - All ingredients where recipeId = 1
--   - All steps where recipeId = 1
```

### Querying Patterns

**Find recipe with relations**:
```javascript
const recipe = await prisma.recipe.findUnique({
  where: { id: 1 },
  include: {
    ingredients: { orderBy: { order: 'asc' } },
    steps: { orderBy: { order: 'asc' } }
  }
});
```

**Generated SQL (approximate)**:
```sql
SELECT * FROM Recipe WHERE id = 1;
SELECT * FROM Ingredient WHERE recipeId = 1 ORDER BY order ASC;
SELECT * FROM Step WHERE recipeId = 1 ORDER BY order ASC;
```

**Why three queries?**
- SQLite limitation (no efficient joins)
- Prisma optimizes this
- Alternative: Use `select` instead of `include` for specific fields

**Find all recipes**:
```javascript
const recipes = await prisma.recipe.findMany({
  orderBy: { createdAt: 'desc' }
});
```

**Pagination** (future enhancement):
```javascript
const recipes = await prisma.recipe.findMany({
  take: 10,        // Limit
  skip: 20,        // Offset
  orderBy: { createdAt: 'desc' }
});
```

---

## Component Patterns

### Server Component Pattern

```javascript
// No 'use client' directive
import { PrismaClient } from '@/app/generated/prisma';

export default async function MyPage() {
  const data = await prisma.model.findMany();
  return <div>{data.map(item => ...)}</div>;
}
```

**When to use**:
- Fetching data
- No interactivity needed
- SEO important
- Want to reduce JavaScript bundle

### Client Component Pattern

```javascript
'use client';  // REQUIRED at top

import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState(initialValue);

  return (
    <div onClick={() => setState(newValue)}>
      {state}
    </div>
  );
}
```

**When to use**:
- Forms and inputs
- onClick, onChange handlers
- useState, useEffect, etc.
- Browser APIs (window, localStorage)

### Composition Pattern

```javascript
// Server Component (page)
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// Client Component (interactivity)
'use client';
export default function ClientComponent({ data }) {
  const [filtered, setFiltered] = useState(data);
  // ... interactive logic
  return <div>{filtered.map(...)}</div>;
}
```

**Why this pattern?**
- Best of both worlds
- Server: Fast data fetching
- Client: Interactivity
- Data flows down (props)

---

## Scaling Logic Deep Dive

### The Formula

```javascript
scaledQuantity = baseQuantity × (selectedServings ÷ baseServings)
```

**Example walkthrough**:
```
Recipe: Pasta for 4 people
Base serving: 4
Selected serving: 6

Ingredient: 400g spaghetti

Calculation:
  scaleFactor = 6 ÷ 4 = 1.5
  scaledQuantity = 400 × 1.5 = 600g

Result: "600 g spaghetti"
```

### Rounding Strategy

```javascript
if (scaledValue < 10) {
  // Round to 0.25 increments
  return Math.round(scaledValue * 4) / 4;
}

// Round to 1 decimal
return Math.round(scaledValue * 10) / 10;
```

**Why 0.25 increments for small values?**
- 0.25 = ¼
- 0.5 = ½
- 0.75 = ¾
- Common cooking measurements

**Examples**:
```
Input: 1.37    → 1.25 (rounded to nearest 0.25)
Input: 1.63    → 1.75
Input: 0.42    → 0.5
Input: 15.37   → 15.4 (rounded to 1 decimal, > 10)
```

**How the rounding works**:
```javascript
Math.round(1.37 * 4) / 4
= Math.round(5.48) / 4
= 5 / 4
= 1.25
```

### Special Cases

**"To taste" ingredients**:
```javascript
const shouldNotScale = (ingredient) => {
  const pattern = /to taste/i;
  return pattern.test(ingredient.name) ||
         pattern.test(ingredient.unit) ||
         pattern.test(ingredient.note);
};
```

**Examples**:
- "Salt and pepper to taste" → Don't scale
- "2 tsp salt, to taste" → Don't scale
- "Herbs (to taste)" → Don't scale

**Zero quantities**:
```javascript
if (quantity === 0 || quantity === null) {
  return "As needed";
}
```

**Examples**:
- "Water - as needed"
- "Fresh herbs - for garnish"
- "Oil - for frying"

---

## Adding New Features

### How to Add a New Recipe Field

**Example**: Add "prepTime" (preparation time in minutes)

**Step 1**: Update Prisma schema
```prisma
model Recipe {
  // ... existing fields
  prepTime     Int?         // Minutes, optional
}
```

**Step 2**: Create migration
```bash
npx prisma migrate dev --name add_prep_time
```

**Step 3**: Regenerate Prisma Client
```bash
npx prisma generate
```

**Step 4**: Update seed data
```javascript
await prisma.recipe.create({
  data: {
    title: '...',
    prepTime: 15,  // Add to existing recipes
    // ...
  }
});
```

**Step 5**: Update RecipeForm
```javascript
const [prepTime, setPrepTime] = useState(initialData?.prepTime || 30);

// In form JSX:
<input
  type="number"
  value={prepTime}
  onChange={(e) => setPrepTime(e.target.value)}
/>

// In handleSubmit:
const recipeData = {
  // ... existing fields
  prepTime: parseInt(prepTime),
};
```

**Step 6**: Update RecipeDetail display
```javascript
{recipe.prepTime && (
  <div>Prep time: {recipe.prepTime} minutes</div>
)}
```

**Step 7**: Update API validation (optional)
```javascript
if (data.prepTime && data.prepTime < 0) {
  return NextResponse.json(
    { error: 'Prep time must be positive' },
    { status: 400 }
  );
}
```

### How to Add a New Component

**Example**: Add "RecipeRating" component

**Step 1**: Create component file
```javascript
// app/components/RecipeRating.js
'use client';

import { useState } from 'react';

export default function RecipeRating({ recipeId, initialRating = 0 }) {
  const [rating, setRating] = useState(initialRating);

  const handleRate = async (newRating) => {
    setRating(newRating);

    // Save to database via API
    await fetch(`/api/recipes/${recipeId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating: newRating }),
    });
  };

  return (
    <div>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => handleRate(star)}
          className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
        >
          ★
        </button>
      ))}
    </div>
  );
}
```

**Step 2**: Add to RecipeDetail
```javascript
import RecipeRating from '@/app/components/RecipeRating';

// In RecipeDetail component:
<RecipeRating recipeId={recipe.id} initialRating={recipe.rating} />
```

**Step 3**: Create API route
```javascript
// app/api/recipes/[id]/rating/route.js
export async function POST(request, { params }) {
  const { id } = await params;
  const { rating } = await request.json();

  await prisma.recipe.update({
    where: { id: parseInt(id) },
    data: { rating }
  });

  return NextResponse.json({ success: true });
}
```

### How to Add Database Filtering

**Example**: Filter by ingredient

**Step 1**: Add search to RecipeGrid
```javascript
const filterByIngredient = (recipes, ingredientName) => {
  if (!ingredientName) return recipes;

  return recipes.filter(recipe =>
    recipe.ingredients?.some(ing =>
      ing.name.toLowerCase().includes(ingredientName.toLowerCase())
    )
  );
};
```

**Problem**: Ingredients not loaded in home page!

**Step 2**: Update home page query
```javascript
// app/page.js
const recipes = await prisma.recipe.findMany({
  include: {
    ingredients: true  // NOW ingredients are loaded
  },
  orderBy: { createdAt: 'desc' }
});
```

**Tradeoff**: Larger data transfer, slower query
**Alternative**: Create dedicated search API endpoint

---

## Best Practices Used

### 1. Component Organization

**Principle**: Single Responsibility
- Each component does ONE thing
- RecipeCard: display recipe card
- RecipeGrid: manage grid with filters
- SearchBar: handle search input

**Principle**: Composition over Inheritance
- Build complex UI from simple components
- `RecipeGrid` contains `SearchBar`, `CategoryFilter`, `RecipeCard`
- No class inheritance

### 2. State Management

**Principle**: Lift State Up
- State lives in common ancestor
- Passed down via props
- Example: search state in RecipeGrid, passed to SearchBar

**Principle**: Colocate State
- Keep state close to where it's used
- Modal state in RecipeDetail (only used there)
- Don't lift unnecessarily

### 3. Data Fetching

**Principle**: Server Components for Data
- Fetch on server when possible
- No loading spinners needed
- Better performance

**Principle**: Client Components for Interactivity
- Only use 'use client' when needed
- Minimizes JavaScript bundle

### 4. Database

**Principle**: Transactions for Multi-Step Operations
- Create recipe + ingredients in one transaction
- All or nothing

**Principle**: Cascade Deletes for Referential Integrity
- Database enforces relationships
- No orphaned data

### 5. Error Handling

**Principle**: Fail Gracefully
- Show user-friendly messages
- Log errors for debugging
- Don't crash the app

**Principle**: Validate on Both Sides
- Client: immediate feedback
- Server: security (never trust client)

---

## Common Debugging Scenarios

### Problem: "Prisma Client not found"

**Cause**: Prisma Client not generated after schema change

**Solution**:
```bash
npx prisma generate
```

**Why it happens**:
- Schema changed but client not regenerated
- After pulling new code
- After installing dependencies

**Prevention**: Add to git hooks or package.json postinstall

---

### Problem: "params.id is undefined"

**Cause**: Next.js 16 change - params is now a Promise

**Wrong**:
```javascript
const recipe = await prisma.recipe.findUnique({
  where: { id: parseInt(params.id) }  // params.id is Promise!
});
```

**Right**:
```javascript
const { id } = await params;
const recipe = await prisma.recipe.findUnique({
  where: { id: parseInt(id) }
});
```

---

### Problem: "Component not re-rendering after state change"

**Cause**: Mutating state directly

**Wrong**:
```javascript
const [items, setItems] = useState([1, 2, 3]);

items.push(4);  // WRONG! Direct mutation
setItems(items);  // React doesn't see change
```

**Right**:
```javascript
setItems([...items, 4]);  // New array
```

**Why**:
- React compares references
- Same array reference = no re-render
- New array = re-render

---

### Problem: "Database locked" error

**Cause**: Multiple processes accessing SQLite database

**Common scenario**:
- Prisma Studio open while running migrations
- Multiple dev servers running

**Solution**:
1. Close Prisma Studio
2. Stop all dev servers
3. Try operation again

**Prevention**: Use PostgreSQL for multi-access (production)

---

### Problem: "Module not found" with @/ imports

**Cause**: jsconfig.json not recognized

**Solution**:
1. Restart VS Code / IDE
2. Check jsconfig.json exists
3. Verify paths are correct

**Alternative**: Use relative imports
```javascript
import X from '../components/X'  // Instead of '@/app/components/X'
```

---

### Problem: "Hydration error" in console

**Cause**: Server HTML doesn't match client render

**Common causes**:
1. Dates formatted differently server vs client
2. Random values (Math.random())
3. Browser-only APIs in server component

**Solution for dates**:
```javascript
// Server formats in UTC, client in local time

// Fix: Format on client only
'use client';
const date = new Date(recipe.createdAt).toLocaleDateString();
```

---

### Problem: "Cannot read property of undefined"

**Cause**: Data not loaded yet or relation not included

**Common scenario**:
```javascript
// Forgot to include ingredients
const recipe = await prisma.recipe.findUnique({
  where: { id: 1 }
  // Missing: include: { ingredients: true }
});

recipe.ingredients.map(...)  // Error! ingredients is undefined
```

**Solution**:
```javascript
const recipe = await prisma.recipe.findUnique({
  where: { id: 1 },
  include: { ingredients: true }  // Don't forget!
});
```

---

### Problem: Form submits but nothing happens

**Debugging checklist**:

1. **Check network tab**: Is request being sent?
   - No? Event handler not attached
   - Yes? Proceed to step 2

2. **Check response**: What status code?
   - 400? Validation error (check server logs)
   - 500? Server error (check server logs)
   - 200? Success but no redirect?

3. **Check server logs**: See actual error
   ```bash
   # In terminal where dev server is running
   # Errors appear here
   ```

4. **Check database**: Did record actually save?
   ```bash
   npx prisma studio
   ```

5. **Check redirect**: Is router.push() called?
   ```javascript
   console.log('Redirecting to:', `/recipes/${savedRecipe.id}`);
   router.push(`/recipes/${savedRecipe.id}`);
   ```

---

## Next Steps for Learning

1. **TypeScript Migration**: Add type safety
2. **Testing**: Add Jest + React Testing Library
3. **Performance**: Add React Query for caching
4. **Authentication**: Implement next-auth
5. **Deployment**: Deploy to Vercel
6. **Monitoring**: Add error tracking (Sentry)
7. **Analytics**: Add usage tracking
8. **Accessibility**: Full WCAG audit
9. **Internationalization**: Multiple languages
10. **Progressive Enhancement**: Offline support

---

**You now have a deep understanding of this codebase!**

Start experimenting:
- Modify existing components
- Add new fields to recipes
- Create new features
- Break things and fix them (best way to learn!)

Happy coding! 🚀
