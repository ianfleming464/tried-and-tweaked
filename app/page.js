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
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-semibold text-neutral-900">Family Recipes</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecipeGrid recipes={recipes} />
      </main>

      <a
        href="/recipes/new"
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-light transition-colors"
        aria-label="Add new recipe"
      >
        +
      </a>
    </div>
  );
}
