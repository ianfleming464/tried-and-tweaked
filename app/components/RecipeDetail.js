'use client';

import { useState } from 'react';
import IngredientList from './IngredientList';
import StepList from './StepList';

export default function RecipeDetail({ recipe }) {
  // State for selected serving size - defaults to recipe's base serving size
  const [selectedServings, setSelectedServings] = useState(recipe.baseServings);

  const categories = recipe.categories.split(',').map(c => c.trim());
  const formattedDate = new Date(recipe.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Serving size options (2-6 people)
  const servingOptions = [2, 3, 4, 5, 6];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Recipe header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {recipe.imageUrl && (
          <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="text-lg text-neutral-600 mb-4 leading-relaxed">
            {recipe.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <span
              key={category}
              className="inline-block px-3 py-1 text-sm font-medium bg-orange-100 text-orange-700 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
          {recipe.source && (
            <div>
              <span className="font-medium">Source:</span> {recipe.source}
            </div>
          )}
          <div>
            <span className="font-medium">Added:</span> {formattedDate}
          </div>
        </div>
      </div>

      {/* Serving size selector - prominent placement */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Servings
        </label>
        <div className="flex gap-2">
          {servingOptions.map(size => (
            <button
              key={size}
              onClick={() => setSelectedServings(size)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors min-w-[60px]
                ${selectedServings === size
                  ? 'bg-orange-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }
              `}
              aria-pressed={selectedServings === size}
              aria-label={`${size} servings`}
            >
              {size}
            </button>
          ))}
        </div>
        {selectedServings !== recipe.baseServings && (
          <p className="mt-2 text-sm text-neutral-500">
            Scaled from {recipe.baseServings} servings
          </p>
        )}
      </div>

      {/* Two-column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients - sticky on desktop */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <IngredientList
            ingredients={recipe.ingredients}
            baseServings={recipe.baseServings}
            selectedServings={selectedServings}
          />
        </div>

        {/* Steps - scrollable column */}
        <div>
          <StepList steps={recipe.steps} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex gap-4">
        <a
          href={`/recipes/${recipe.id}/edit`}
          className="px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
        >
          Edit Recipe
        </a>
        <button
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Delete Recipe
        </button>
      </div>
    </main>
  );
}
