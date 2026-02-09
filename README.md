# Family Recipe Manager 🍳

A mobile-first web application for storing, managing, and scaling family recipes. Keep track of your personalised recipe modifications with precise ingredient quantities and cooking instructions. The unique feature: view ingredients and instructions simultaneously with dynamic portion scaling.

## ✨ Features

### Recipe Management
- **Create & Edit Recipes**: Full-featured forms for adding new recipes or updating existing ones
- **Rich Recipe Details**: Store title, description, image, categories, source, and base serving size
- **Delete with Confirmation**: Safe deletion with a confirmation modal to prevent accidents

### Dynamic Portion Scaling
- **Real-time Scaling**: Instantly adjust ingredient quantities for 2-6 people
- **Smart Rounding**: Automatic rounding to common cooking fractions (1/4, 1/2, 3/4)
- **"To Taste" Detection**: Ingredients marked "to taste" don't scale
- **Zero Quantity Handling**: Display "As needed" for ingredients without specific quantities

### Search & Discovery
- **Live Search**: Instant filtering as you type, searches titles and descriptions
- **Category Filtering**: Filter by multiple categories (Vegetarian, Vegan, Pasta, Curry, Sandwiches, Breakfast)
- **Flexible Sorting**: Sort recipes by newest, oldest, or alphabetically
- **Empty States**: Helpful messages when no recipes exist or search returns no results

### User Experience
- **Mobile-First Design**: Optimized for cooking while using your phone
- **Simultaneous View**: See ingredients and steps at the same time (desktop: side-by-side, mobile: sticky ingredients panel)
- **Clean Interface**: Warm neutral colors with orange accent, generous white space
- **Accessible**: Semantic HTML, ARIA labels, keyboard navigation, 44×44px touch targets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd family-recipes

# Install dependencies
npm install

# Set up environment variables
echo 'DATABASE_URL="file:./dev.db"' > .env

# Initialize database and seed with sample data
npx prisma migrate dev

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app!

## 🛠️ Tech Stack

### Core Framework
- **Next.js 16** (App Router) - React framework for server-side rendering and routing
- **React 19** - UI component library
- **JavaScript (JSX)** - Language choice for simplicity and learning

### Database
- **Prisma** - Type-safe database ORM
- **SQLite** - Lightweight file-based database (perfect for single-user apps)

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Custom Design System** - Warm neutrals with orange accent color

### Development Tools
- **ESLint** - Code linting
- **dotenv** - Environment variable management

## 📁 Project Structure

```
family-recipes/
├── app/                          # Next.js App Router directory
│   ├── components/               # Reusable React components
│   │   ├── RecipeCard.js         # Recipe card for grid display
│   │   ├── RecipeDetail.js       # Full recipe view with scaling
│   │   ├── RecipeForm.js         # Form for create/edit (reusable)
│   │   ├── RecipeGrid.js         # Grid with search & filters
│   │   ├── SearchBar.js          # Search input and sort dropdown
│   │   ├── CategoryFilter.js     # Category filter chips
│   │   ├── IngredientList.js     # Ingredients with scaling logic
│   │   ├── StepList.js           # Cooking instructions
│   │   └── ConfirmModal.js       # Confirmation dialog
│   ├── api/recipes/              # API routes for mutations
│   │   ├── route.js              # POST /api/recipes (create)
│   │   └── [id]/route.js         # PUT, DELETE /api/recipes/:id
│   ├── recipes/                  # Recipe-related pages
│   │   ├── [id]/page.js          # Recipe detail page (dynamic route)
│   │   ├── [id]/edit/page.js     # Recipe edit page
│   │   └── new/page.js           # Recipe creation page
│   ├── generated/prisma/         # Generated Prisma Client (gitignored)
│   ├── page.js                   # Home page with recipe grid
│   ├── layout.js                 # Root layout with fonts
│   └── globals.css               # Global Tailwind styles
│
├── prisma/
│   ├── schema.prisma             # Database schema definition
│   ├── seed.js                   # Sample data for development
│   └── migrations/               # Database migration history
│       └── 20251026101900_initial_schema/
│
├── public/                       # Static assets
│
├── .env                          # Environment variables (gitignored)
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies and scripts
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS configuration
├── eslint.config.mjs             # ESLint configuration
├── jsconfig.json                 # JavaScript path aliases
├── prisma.config.ts              # Prisma configuration
├── CLAUDE.md                     # AI assistant guidance
└── README.md                     # This file
```

## 📝 Common Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database (Prisma)
```bash
# Development workflow
npx prisma migrate dev --name description    # Create and apply migration
npx prisma generate                          # Regenerate Prisma Client
npx prisma studio                            # Open visual database editor
npx prisma db seed                           # Run seed file only

# Reset everything
npx prisma migrate reset                     # Drop DB, run migrations, run seed

# Production workflow
npx prisma migrate deploy                    # Apply migrations in production
npx prisma db push                           # Push schema without migration (prototyping)
```

### Git Workflow
```bash
git status                                   # Check what's changed
git add .                                    # Stage all changes
git commit -m "Description of changes"       # Commit with message
git push                                     # Push to remote
```

## 🗄️ Database Schema

### Recipe
- `id` - Auto-incrementing integer primary key
- `title` - Recipe name (required)
- `description` - Long-form text for context/story
- `imageUrl` - URL to recipe image
- `baseServings` - Number of servings this recipe makes (default: 4)
- `source` - Where the recipe came from (book, website, person)
- `categories` - Comma-separated category tags
- `createdAt` - Timestamp of creation
- `updatedAt` - Timestamp of last update

### Ingredient
- `id` - Auto-incrementing integer primary key
- `name` - Ingredient name (e.g., "All-purpose flour")
- `quantity` - Numeric amount (e.g., 2.5)
- `unit` - Unit of measurement (e.g., "cups", "g", "tbsp")
- `note` - Optional note (e.g., "room temperature", "divided")
- `order` - Integer for sorting ingredients in display order
- `recipeId` - Foreign key to Recipe (cascade delete)

### Step
- `id` - Auto-incrementing integer primary key
- `text` - Instruction text
- `order` - Integer for sorting steps in display order
- `recipeId` - Foreign key to Recipe (cascade delete)

## 🐛 Troubleshooting

### Database Issues

**Problem**: `Argument 'id' is missing` error
- **Cause**: Prisma Client not generated after schema changes
- **Solution**: Run `npx prisma generate`

**Problem**: Migration fails
- **Solution**: Delete `prisma/dev.db` and run `npx prisma migrate reset`

**Problem**: Can't connect to database
- **Solution**: Check `.env` file exists with `DATABASE_URL="file:./dev.db"`

### Next.js Issues

**Problem**: `params is a Promise` error
- **Cause**: Next.js 16 changed dynamic route params to Promises
- **Solution**: Use `const { id } = await params;` in page components

**Problem**: Component not updating
- **Solution**: Check if component needs `'use client'` directive for interactivity

**Problem**: Import path errors
- **Solution**: Use `@/` prefix (e.g., `@/app/components/RecipeCard`) - defined in `jsconfig.json`

### Development Server Issues

**Problem**: Port 3000 already in use
- **Solution**: Kill the process using port 3000 or use `npm run dev -- -p 3001`

**Problem**: Changes not reflecting
- **Solution**: Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

## 🎯 Future Enhancements

### Phase 2 (Authentication & Multi-User)
- [ ] Add next-auth for user authentication
- [ ] User registration and login
- [ ] Recipe ownership and permissions
- [ ] User profile management

### Phase 3 (Enhanced Features)
- [ ] Image upload (replace URL with actual file upload via UploadThing/Cloudinary)
- [ ] Wishlist/favorites feature
- [ ] Recipe sharing (public URLs)
- [ ] Import recipes from URLs (web scraping)
- [ ] Drag-and-drop reordering of steps and ingredients
- [ ] Print-optimized recipe view
- [ ] Grocery/shopping list mode
- [ ] Recipe ratings and personal notes
- [ ] Difficulty levels and tags
- [ ] Cooking/prep time tracking
- [ ] Ingredient substitution suggestions
- [ ] Nutritional information
- [ ] Meal planning integration

### Technical Improvements
- [ ] TypeScript migration for type safety
- [ ] Unit and integration tests
- [ ] Performance monitoring
- [ ] Image optimization with Next.js Image component
- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Search performance optimization with full-text search
- [ ] Custom category management (user-defined categories)

## 📖 Learning Resources

### Next.js
- [Official Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

### Prisma
- [Prisma Documentation](https://www.prisma.io/docs)
- [Data Modeling Guide](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

### React
- [React Documentation](https://react.dev)
- [Hooks Reference](https://react.dev/reference/react)
- [Thinking in React](https://react.dev/learn/thinking-in-react)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Utility-First Fundamentals](https://tailwindcss.com/docs/utility-first)

## 🤝 Contributing

This is a personal learning project, but suggestions and improvements are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Initial requirements and design by requirements document
- Built as a learning project to master Next.js App Router, Prisma, and modern React patterns
- Sample recipes inspired by classic and contemporary cooking resources

---

**Need Help?** Check the [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for a deep dive into the codebase architecture and implementation details.

Useful command ref : 

# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production build

# Database
npx prisma studio        # Visual DB editor
npx prisma migrate dev   # Create migration after schema changes
npx prisma migrate reset # Reset DB and re-seed
npx prisma generate      # Regenerate Prisma Client

# Git
git status               # See what's changed
git diff                 # See specific changes
git log --oneline        # See commit history