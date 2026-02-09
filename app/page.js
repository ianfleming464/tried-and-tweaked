import prisma from '@/app/lib/prisma';
import RecipeGrid from './components/RecipeGrid';
import Link from 'next/link';

export default async function Home() {
  const recipes = await prisma.recipe.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      {/* Header */}
      <header className="divider-emphasis" style={{ background: 'var(--warm-white)', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div style={{ textAlign: 'center' }}>
            <h1 className="heading-display" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              Tried & Tweaked
            </h1>
            <p className="body-text" style={{ fontSize: '1.125rem', color: 'var(--medium-gray)', fontStyle: 'italic' }}>
              Our family cookbook
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <RecipeGrid recipes={recipes} />
      </main>

      {/* Floating action button */}
      <Link
        href="/recipes/new"
        className="fixed bottom-8 right-8 w-16 h-16 flex items-center justify-center text-3xl font-light transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'var(--charcoal)',
          color: 'var(--white)',
          borderRadius: '50%',
          boxShadow: '0 4px 16px rgba(42, 42, 42, 0.2)',
          textDecoration: 'none',
        }}
        aria-label="Add new recipe"
      >
        +
      </Link>
    </div>
  );
}
