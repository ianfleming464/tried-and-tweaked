import Link from 'next/link';
import RecipeForm from '@/app/components/RecipeForm';

export default function NewRecipePage() {
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link
            href="/"
            className="inline-flex items-center transition-all duration-300 hover:scale-105"
            style={{
              color: 'var(--glass-white)',
              textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
            }}
          >
            <span className="mr-2 text-xl">←</span>
            <span className="font-medium">Back to recipes</span>
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1
          className="text-3xl font-bold mb-8"
          style={{
            fontFamily: 'var(--font-outfit)',
            color: 'var(--glass-white)',
            textShadow: '0 0 30px rgba(107, 45, 255, 0.5)'
          }}
        >
          Add New Recipe
        </h1>
        <RecipeForm mode="create" />
      </main>
    </div>
  );
}
