import Link from 'next/link';
import RecipeForm from '@/app/components/RecipeForm';

export default function NewRecipePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      {/* Header */}
      <header className="divider-subtle" style={{ background: 'var(--white)', padding: '1.5rem 0' }}>
        <div className="max-w-4xl mx-auto px-8">
          <Link
            href="/"
            className="inline-flex items-center transition-all duration-300 hover:-translate-x-1"
            style={{
              color: 'var(--charcoal)',
              textDecoration: 'none',
            }}
          >
            <span className="mr-2 text-xl">←</span>
            <span className="body-text" style={{ fontWeight: '500' }}>Back to recipes</span>
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="heading-display" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
          Add New Recipe
        </h1>
        <RecipeForm mode="create" />
      </main>
    </div>
  );
}
