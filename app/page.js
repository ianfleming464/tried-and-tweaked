import { PrismaClient } from '@/app/generated/prisma';
import RecipeGrid from './components/RecipeGrid';

const prisma = new PrismaClient();

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      {/* Animated Aurora Background */}
      <div className="aurora-background">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>
      </div>

      {/* Glass Header */}
      <header className="glass-header sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🍽️</span>
            <h1
              className="text-3xl font-bold"
              style={{
                fontFamily: 'var(--font-outfit)',
                color: 'var(--glass-white)',
                textShadow: '0 0 30px rgba(107, 45, 255, 0.5)'
              }}
            >
              Family Recipes
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RecipeGrid recipes={recipes} />
      </main>

      {/* Floating action button with neon glow */}
      <a
        href="/recipes/new"
        className="fixed bottom-8 right-8 w-16 h-16 glass-card neon-glow-purple flex items-center justify-center text-4xl font-light transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))',
          color: 'var(--glass-white)',
          borderRadius: '20px',
        }}
        aria-label="Add new recipe"
      >
        +
      </a>
    </div>
  );
}
