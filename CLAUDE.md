# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Family Recipe Manager is a mobile-first web application for storing, managing, and scaling family recipes. Built with Next.js 16 (App Router), React 19, Prisma ORM with SQLite, and Tailwind CSS 4.

### Key Features
- Store recipes with ingredients, steps, categories, and images
- Dynamic portion scaling (2-6 servings) with real-time quantity calculations
- Simultaneous ingredient and instruction display
- Recipe search and category filtering
- Mobile-first responsive design
- Single-user application (no authentication in phase 1)

## Development Commands

### Running the Application
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database Management with Prisma
The project uses Prisma with SQLite and a custom client output location.

**Important Paths:**
- Schema: `prisma/schema.prisma`
- Generated client: `app/generated/prisma` (gitignored)
- Database file: `prisma/dev.db` (gitignored)
- Seed file: `prisma/seed.js`

**Prisma Commands:**
- `npx prisma generate` - Generate Prisma Client to `app/generated/prisma`
- `npx prisma migrate dev --name description` - Create and apply migration
- `npx prisma migrate reset` - Reset database and run seed
- `npx prisma db push` - Push schema changes without migration (prototyping)
- `npx prisma studio` - Open Prisma Studio GUI
- `npx prisma db seed` - Run seed file only

**Importing Prisma Client:**
```javascript
import { PrismaClient } from '@/app/generated/prisma'
```

## Architecture

### Database Schema
- **Recipe**: Core entity with title, description, imageUrl, baseServings, source, categories (array), timestamps
- **Ingredient**: Belongs to Recipe; includes name, quantity, unit, note, order
- **Step**: Belongs to Recipe; includes text, order

### Project Structure
```
/app
  /generated/prisma     - Generated Prisma Client (gitignored)
  /api                  - API routes for mutations (create, update, delete)
    /recipes
  /recipes              - Recipe-related pages
    /[id]               - Recipe detail page
    /[id]/edit          - Recipe edit page
    /new                - Recipe creation page
  /components           - Reusable React components
  layout.js             - Root layout
  page.js               - Home page (recipe grid, search, filters)
  globals.css           - Global Tailwind styles
/prisma
  schema.prisma         - Database schema
  seed.js               - Seed data with sample recipes
/public                 - Static assets (placeholder images)
```

### Key Technical Decisions

**Next.js App Router Patterns:**
- Server Components by default for data fetching
- Client Components ('use client') only when needed for interactivity
- Server Actions for mutations where appropriate
- Dynamic routes for recipe pages: `/recipes/[id]`

**Data Fetching:**
- Prisma queries in Server Components
- API routes for client-side mutations (POST, PUT, DELETE)
- No external state management library (use React state + server components)

**Styling Approach:**
- Tailwind CSS 4 utility classes
- Mobile-first responsive design
- Custom color palette (warm neutrals, single accent color)
- Avoid generic Tailwind appearance - use custom spacing and rounded corners

**Client-Side Logic:**
- Portion scaling calculations (scaledQuantity = baseQuantity × selectedServings ÷ baseServings)
- Search filtering
- Category filtering (OR logic - matches ANY selected category)
- Form state management

### Business Logic

**Portion Scaling:**
- Calculated client-side for instant feedback
- Ingredients with "to taste" in any field are NOT scaled
- Ingredients with quantity 0 or null display "As needed"
- Round to 1 decimal place or use 0.25/0.5 increments

**Search & Filters:**
- Search: case-insensitive, matches title and description
- Category filter: OR logic (recipe shows if it has ANY selected category)
- Combined search + category: AND logic

**Validation:**
- Title required (min 1 char)
- Base servings must be positive integer (min 1)
- At least 1 ingredient required
- At least 1 step required
- Ingredient name and quantity required
- Step text required

## Development Guidelines

### Code Style
- Use JSX (not TypeScript)
- Functional components with hooks
- Descriptive variable and function names
- Comments for complex business logic only
- Keep components focused and single-purpose

### Component Organization
- Server Components for data fetching and static content
- Client Components for forms, interactive controls, search
- Extract reusable UI elements (buttons, cards, inputs)
- Co-locate related components when appropriate

### Database Operations
- Always regenerate Prisma Client after schema changes: `npx prisma generate`
- Include relations in queries when needed: `include: { ingredients: true, steps: true }`
- Order ingredients and steps: `orderBy: { order: 'asc' }`
- Use transactions for multi-model operations

### Accessibility
- Semantic HTML (header, nav, main, article, section)
- ARIA labels for icon-only buttons
- Alt text for images (use recipe title as fallback)
- Form labels and error associations
- Keyboard navigation support
- 44×44px minimum touch targets on mobile

## Environment Variables

Create a `.env` file (gitignored):
```
DATABASE_URL="file:./dev.db"
```

## Seed Data

The database includes sample recipes with:
- Initial categories: Vegetarian, Vegan, Pasta, Curry, Sandwiches, Breakfast
- 6-8 diverse sample recipes
- Each with complete ingredients and steps
- Various base serving sizes to demonstrate scaling

Run seed: `npx prisma db seed` or `npx prisma migrate reset`

## Common Tasks

**Add a new recipe field:**
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_field_name`
3. Run `npx prisma generate`
4. Update forms and display components

**Debug database:**
- Use `npx prisma studio` for visual interface
- Check `prisma/dev.db` exists
- Verify DATABASE_URL in `.env`

**Reset everything:**
```bash
npx prisma migrate reset  # Drops DB, runs migrations, runs seed
```

## Future Enhancements (Phase 2+)

Documented in requirements but out of scope for phase 1:
- Authentication & multi-user support
- Image upload (currently uses URLs)
- Wishlist/favorites
- Recipe sharing
- Import from URLs
- Nutritional information
