import { PrismaClient } from '@/app/generated/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RecipeForm from '@/app/components/RecipeForm';

const prisma = new PrismaClient();

export default async function EditRecipePage({ params }) {
  // In Next.js 16+, params is a Promise and must be awaited
  const { id } = await params;

  // Fetch recipe with all ingredients and steps
  const recipe = await prisma.recipe.findUnique({
    where: {
      id: parseInt(id)
    },
    include: {
      ingredients: {
        orderBy: {
          order: 'asc'
        }
      },
      steps: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  // Show 404 if recipe doesn't exist
  if (!recipe) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/recipes/${recipe.id}`}
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to recipe
          </Link>
        </div>
      </header>

      {/* Form with initial data */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Edit Recipe</h1>
        <RecipeForm mode="edit" initialData={recipe} />
      </main>
    </div>
  );
}
