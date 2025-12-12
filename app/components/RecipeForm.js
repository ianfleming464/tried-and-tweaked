'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Vegetarian', 'Vegan', 'Pasta', 'Curry', 'Sandwiches', 'Breakfast'];

export default function RecipeForm({ mode = 'create', initialData = null }) {
  const router = useRouter();

  // Initialize form state - either empty (create) or from initialData (edit)
  // Convert null values to empty strings for controlled inputs
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? '');
  const [baseServings, setBaseServings] = useState(initialData?.baseServings ?? 4);
  const [source, setSource] = useState(initialData?.source ?? '');
  const [selectedCategories, setSelectedCategories] = useState(
    initialData?.categories ? initialData.categories.split(',').map(c => c.trim()) : []
  );

  // Dynamic ingredients array - each has name, quantity, unit, note, and order
  // Convert null values to empty strings to avoid React controlled input warnings
  const [ingredients, setIngredients] = useState(
    initialData?.ingredients
      ? initialData.ingredients.map(ing => ({
          ...ing,
          name: ing.name ?? '',
          unit: ing.unit ?? '',
          note: ing.note ?? '',
          quantity: ing.quantity ?? ''
        }))
      : [{ name: '', quantity: '', unit: '', note: '', order: 1 }]
  );

  // Dynamic steps array - each has text and order
  const [steps, setSteps] = useState(
    initialData?.steps
      ? initialData.steps.map(step => ({
          ...step,
          text: step.text ?? ''
        }))
      : [{ text: '', order: 1 }]
  );

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle category selection
  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Add new ingredient to the list
  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: '', quantity: '', unit: '', note: '', order: ingredients.length + 1 }
    ]);
  };

  // Remove ingredient from the list
  const removeIngredient = (index) => {
    const updated = ingredients.filter((_, i) => i !== index);
    // Re-order remaining ingredients
    updated.forEach((ing, i) => ing.order = i + 1);
    setIngredients(updated);
  };

  // Update a specific ingredient field
  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  // Add new step to the list
  const addStep = () => {
    setSteps([
      ...steps,
      { text: '', order: steps.length + 1 }
    ]);
  };

  // Remove step from the list
  const removeStep = (index) => {
    const updated = steps.filter((_, i) => i !== index);
    // Re-order remaining steps
    updated.forEach((step, i) => step.order = i + 1);
    setSteps(updated);
  };

  // Update a specific step field
  const updateStep = (index, value) => {
    const updated = [...steps];
    updated[index].text = value;
    setSteps(updated);
  };

  // Form validation
  const validate = () => {
    if (!title.trim()) {
      setError('Recipe title is required');
      return false;
    }

    if (baseServings < 1) {
      setError('Base servings must be at least 1');
      return false;
    }

    if (selectedCategories.length === 0) {
      setError('Please select at least one category');
      return false;
    }

    const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.quantity);
    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient');
      return false;
    }

    const validSteps = steps.filter(step => step.text.trim());
    if (validSteps.length === 0) {
      setError('Please add at least one cooking step');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty ingredients and steps
      const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.quantity);
      const validSteps = steps.filter(step => step.text.trim());

      // Prepare data for API
      const recipeData = {
        title: title.trim(),
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        baseServings: parseInt(baseServings),
        source: source.trim() || null,
        categories: selectedCategories.join(','),
        ingredients: validIngredients.map(ing => ({
          name: ing.name.trim(),
          quantity: parseFloat(ing.quantity),
          unit: ing.unit.trim(),
          note: ing.note?.trim() || null,
          order: ing.order
        })),
        steps: validSteps.map(step => ({
          text: step.text.trim(),
          order: step.order
        }))
      };

      // Make API request
      const url = mode === 'create' ? '/api/recipes' : `/api/recipes/${initialData.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save recipe');
      }

      const savedRecipe = await response.json();

      // Redirect to the recipe detail page
      router.push(`/recipes/${savedRecipe.id}`);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Recipe Details Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">Recipe Details</h2>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Grandma's Apple Pie"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Story, context, or notes about this recipe..."
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Base Servings */}
        <div>
          <label htmlFor="baseServings" className="block text-sm font-medium text-neutral-700 mb-2">
            Base Servings *
          </label>
          <input
            type="number"
            id="baseServings"
            value={baseServings}
            onChange={(e) => setBaseServings(e.target.value)}
            min="1"
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-neutral-700 mb-2">
            Source
          </label>
          <input
            type="text"
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Book, website, or person"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Categories *
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <label
                key={category}
                className={`
                  px-4 py-2 rounded-full border cursor-pointer transition-colors
                  ${selectedCategories.includes(category)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-orange-500'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="sr-only"
                />
                {category}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Ingredients</h2>

        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
              {/* Ingredient name */}
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="sm:col-span-4 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              {/* Quantity */}
              <input
                type="number"
                step="0.01"
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                placeholder="Qty"
                className="sm:col-span-2 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              {/* Unit */}
              <input
                type="text"
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                placeholder="Unit"
                className="sm:col-span-2 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              {/* Note */}
              <input
                type="text"
                value={ingredient.note}
                onChange={(e) => updateIngredient(index, 'note', e.target.value)}
                placeholder="Note (optional)"
                className="sm:col-span-4 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Remove ingredient"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addIngredient}
          className="w-full px-4 py-2 border-2 border-dashed border-neutral-300 text-neutral-600 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors"
        >
          + Add Ingredient
        </button>
      </div>

      {/* Steps Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-bold text-neutral-900">Cooking Steps</h2>

        {steps.map((step, index) => (
          <div key={index} className="flex gap-2 items-start">
            {/* Step number */}
            <div className="flex-shrink-0 w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-700 mt-1">
              {index + 1}
            </div>

            {/* Step text */}
            <textarea
              value={step.text}
              onChange={(e) => updateStep(index, e.target.value)}
              placeholder="Describe this step..."
              rows={2}
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeStep(index)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Remove step"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addStep}
          className="w-full px-4 py-2 border-2 border-dashed border-neutral-300 text-neutral-600 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors"
        >
          + Add Step
        </button>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-neutral-300 transition-colors font-medium"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Recipe' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
