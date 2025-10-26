import { PrismaClient } from '@/app/generated/prisma';
import { notFound } from 'next/navigation';
import RecipeDetail from '@/app/components/RecipeDetail';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function RecipePage({ params }) {
  // Fetch recipe with all ingredients and steps
  const recipe = await prisma.recipe.findUnique({
    where: {
      id: parseInt(params.id)
    },
    include: {
      ingredients: {
        orderBy: {
          order: 'asc'  // Sort ingredients by their order field
        }
      },
      steps: {
        orderBy: {
          order: 'asc'  // Sort steps by their order field
        }
      }
    }
  });

  // Show 404 page if recipe doesn't exist
  if (!recipe) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with back button */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to recipes
          </Link>
        </div>
      </header>

      {/* Pass recipe data to client component for interactive features */}
      <RecipeDetail recipe={recipe} />
    </div>
  );
}
