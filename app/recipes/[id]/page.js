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
    <div className="min-h-screen" style={{ background: 'var(--dark-bg)' }}>
      {/* Animated Aurora Background */}
      <div className="aurora-background">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>
      </div>

      {/* Glass Header with back button */}
      <header className="glass-header sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
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

      {/* Pass recipe data to client component for interactive features */}
      <RecipeDetail recipe={recipe} />
    </div>
  );
}
