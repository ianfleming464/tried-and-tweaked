import { PrismaClient } from '@/app/generated/prisma';
import { notFound } from 'next/navigation';
import RecipeDetail from '@/app/components/RecipeDetail';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function RecipePage({ params }) {
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

  // Show 404 page if recipe doesn't exist
  if (!recipe) {
    notFound();
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--warm-white)' }}>
      {/* Header with back button */}
      <header className="divider-subtle" style={{ background: 'var(--white)', padding: '1.5rem 0' }}>
        <div className="max-w-5xl mx-auto px-8">
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

      {/* Pass recipe data to client component for interactive features */}
      <RecipeDetail recipe={recipe} />
    </div>
  );
}
