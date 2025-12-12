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
            href={`/recipes/${recipe.id}`}
            className="inline-flex items-center transition-all duration-300 hover:scale-105"
            style={{
              color: 'var(--glass-white)',
              textShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
            }}
          >
            <span className="mr-2 text-xl">←</span>
            <span className="font-medium">Back to recipe</span>
          </Link>
        </div>
      </header>

      {/* Form with initial data */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1
          className="text-3xl font-bold mb-8"
          style={{
            fontFamily: 'var(--font-outfit)',
            color: 'var(--glass-white)',
            textShadow: '0 0 30px rgba(107, 45, 255, 0.5)'
          }}
        >
          Edit Recipe
        </h1>
        <RecipeForm mode="edit" initialData={recipe} />
      </main>
    </div>
  );
}
