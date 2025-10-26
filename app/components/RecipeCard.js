import Link from 'next/link';

export default function RecipeCard({ recipe }) {
  const categories = recipe.categories.split(',').map(c => c.trim());
  const formattedDate = new Date(recipe.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link href={`/recipes/${recipe.id}`} className="block group">
      <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-48 bg-neutral-200 overflow-hidden">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100">
              <span className="text-neutral-400 text-4xl">🍽️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-neutral-900 mb-2 line-clamp-2">
            {recipe.title}
          </h3>

          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map(category => (
              <span
                key={category}
                className="inline-block px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded"
              >
                {category}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-neutral-500">
            <span>{recipe.baseServings} servings</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
