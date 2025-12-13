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
    <div className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      {/* Header */}
      <header className="divider-subtle" style={{ background: 'var(--white)', padding: '1.5rem 0' }}>
        <div className="max-w-4xl mx-auto px-8">
          <Link
            href={`/recipes/${recipe.id}`}
            className="inline-flex items-center transition-all duration-300 hover:-translate-x-1"
            style={{
              color: 'var(--charcoal)',
              textDecoration: 'none',
            }}
          >
            <span className="mr-2 text-xl">←</span>
            <span className="body-text" style={{ fontWeight: '500' }}>Back to recipe</span>
          </Link>
        </div>
      </header>

      {/* Form with initial data */}
      <main className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="heading-display" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
          Edit Recipe
        </h1>
        <RecipeForm mode="edit" initialData={recipe} />
      </main>
    </div>
  );
}
