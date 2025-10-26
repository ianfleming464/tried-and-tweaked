import Link from 'next/link';
import RecipeForm from '@/app/components/RecipeForm';

export default function NewRecipePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to recipes
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Add New Recipe</h1>
        <RecipeForm mode="create" />
      </main>
    </div>
  );
}
