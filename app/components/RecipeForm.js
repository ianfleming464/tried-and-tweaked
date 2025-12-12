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
        <div className="glass-card px-6 py-4" style={{
          background: 'rgba(255, 0, 80, 0.15)',
          border: '1px solid rgba(255, 0, 80, 0.4)',
          borderRadius: '16px',
          color: 'rgba(255, 100, 150, 1)',
          boxShadow: '0 0 20px rgba(255, 0, 80, 0.3)'
        }}>
          {error}
        </div>
      )}

      {/* Recipe Details Section */}
      <div className="glass-card p-6 space-y-6" style={{ borderRadius: '20px' }}>
        <h2 className="text-xl font-bold" style={{
          fontFamily: 'var(--font-outfit)',
          color: 'var(--glass-white)',
          textShadow: '0 2px 8px rgba(107, 45, 255, 0.5)'
        }}>Recipe Details</h2>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: 'var(--glass-white)' }}>
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 glass-card focus:outline-none transition-all duration-300"
            style={{ borderRadius: '12px', color: 'var(--glass-white)' }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 24px rgba(107, 45, 255, 0.5)';
              e.target.style.borderColor = 'rgba(107, 45, 255, 0.6)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '';
              e.target.style.borderColor = 'var(--glass-border)';
            }}
            placeholder="e.g., Grandma's Apple Pie"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: 'var(--glass-white)' }}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 glass-card focus:outline-none transition-all duration-300"
            style={{ borderRadius: '12px', color: 'var(--glass-white)' }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 24px rgba(107, 45, 255, 0.5)';
              e.target.style.borderColor = 'rgba(107, 45, 255, 0.6)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '';
              e.target.style.borderColor = 'var(--glass-border)';
            }}
            placeholder="Story, context, or notes about this recipe..."
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium mb-2" style={{ color: 'var(--glass-white)' }}>
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-4 py-3 glass-card focus:outline-none transition-all duration-300"
            style={{ borderRadius: '12px', color: 'var(--glass-white)' }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 24px rgba(107, 45, 255, 0.5)';
              e.target.style.borderColor = 'rgba(107, 45, 255, 0.6)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '';
              e.target.style.borderColor = 'var(--glass-border)';
            }}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Base Servings */}
        <div>
          <label htmlFor="baseServings" className="block text-sm font-medium mb-2" style={{ color: 'var(--glass-white)' }}>
            Base Servings *
          </label>
          <input
            type="number"
            id="baseServings"
            value={baseServings}
            onChange={(e) => setBaseServings(e.target.value)}
            min="1"
            className="w-full px-4 py-3 glass-card focus:outline-none transition-all duration-300"
            style={{ borderRadius: '12px', color: 'var(--glass-white)' }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 24px rgba(107, 45, 255, 0.5)';
              e.target.style.borderColor = 'rgba(107, 45, 255, 0.6)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '';
              e.target.style.borderColor = 'var(--glass-border)';
            }}
            required
          />
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium mb-2" style={{ color: 'var(--glass-white)' }}>
            Source
          </label>
          <input
            type="text"
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-4 py-3 glass-card focus:outline-none transition-all duration-300"
            style={{ borderRadius: '12px', color: 'var(--glass-white)' }}
            onFocus={(e) => {
              e.target.style.boxShadow = '0 0 24px rgba(107, 45, 255, 0.5)';
              e.target.style.borderColor = 'rgba(107, 45, 255, 0.6)';
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = '';
              e.target.style.borderColor = 'var(--glass-border)';
            }}
            placeholder="Book, website, or person"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--glass-white)' }}>
            Categories *
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category, index) => (
              <label
                key={category}
                className="px-4 py-2 cursor-pointer transition-all duration-300 hover:scale-105 glass-card"
                style={selectedCategories.includes(category) ? {
                  background: index % 3 === 0
                    ? 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))'
                    : index % 3 === 1
                    ? 'linear-gradient(135deg, var(--cyan-glow), var(--royal-purple))'
                    : 'linear-gradient(135deg, var(--emerald-glow), var(--cyan-glow))',
                  color: 'var(--glass-white)',
                  borderRadius: '14px',
                  boxShadow: '0 0 20px rgba(107, 45, 255, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                } : {
                  background: 'var(--glass-bg)',
                  color: 'var(--glass-white)',
                  borderRadius: '14px',
                  border: '1px solid var(--glass-border)',
                }}
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
      <div className="glass-card p-6 space-y-4" style={{ borderRadius: '20px' }}>
        <h2 className="text-xl font-bold" style={{
          fontFamily: 'var(--font-outfit)',
          color: 'var(--glass-white)',
          textShadow: '0 2px 8px rgba(0, 212, 255, 0.5)'
        }}>Ingredients</h2>

        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
              {/* Ingredient name */}
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="sm:col-span-4 px-3 py-2 glass-card focus:outline-none transition-all duration-300"
                style={{ borderRadius: '10px', color: 'var(--glass-white)' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 16px rgba(0, 255, 157, 0.4)'}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />

              {/* Quantity */}
              <input
                type="number"
                step="0.01"
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                placeholder="Qty"
                className="sm:col-span-2 px-3 py-2 glass-card focus:outline-none transition-all duration-300"
                style={{ borderRadius: '10px', color: 'var(--glass-white)' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 16px rgba(0, 255, 157, 0.4)'}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />

              {/* Unit */}
              <input
                type="text"
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                placeholder="Unit"
                className="sm:col-span-2 px-3 py-2 glass-card focus:outline-none transition-all duration-300"
                style={{ borderRadius: '10px', color: 'var(--glass-white)' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 16px rgba(0, 255, 157, 0.4)'}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />

              {/* Note */}
              <input
                type="text"
                value={ingredient.note}
                onChange={(e) => updateIngredient(index, 'note', e.target.value)}
                placeholder="Note (optional)"
                className="sm:col-span-4 px-3 py-2 glass-card focus:outline-none transition-all duration-300"
                style={{ borderRadius: '10px', color: 'var(--glass-white)' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 16px rgba(0, 255, 157, 0.4)'}
                onBlur={(e) => e.target.style.boxShadow = ''}
              />
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="px-3 py-2 glass-card transition-all duration-300 hover:scale-110"
              style={{
                borderRadius: '10px',
                color: 'rgba(255, 100, 150, 1)',
                boxShadow: '0 0 12px rgba(255, 0, 80, 0.3)'
              }}
              aria-label="Remove ingredient"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addIngredient}
          className="w-full px-4 py-3 glass-card border-2 border-dashed transition-all duration-300 hover:scale-[1.02]"
          style={{
            borderRadius: '12px',
            borderColor: 'var(--glass-border)',
            color: 'var(--glass-white)'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'rgba(0, 255, 157, 0.5)';
            e.target.style.boxShadow = '0 0 20px rgba(0, 255, 157, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--glass-border)';
            e.target.style.boxShadow = '';
          }}
        >
          + Add Ingredient
        </button>
      </div>

      {/* Steps Section */}
      <div className="glass-card p-6 space-y-4" style={{ borderRadius: '20px' }}>
        <h2 className="text-xl font-bold" style={{
          fontFamily: 'var(--font-outfit)',
          color: 'var(--glass-white)',
          textShadow: '0 2px 8px rgba(0, 212, 255, 0.5)'
        }}>Cooking Steps</h2>

        {steps.map((step, index) => (
          <div key={index} className="flex gap-2 items-start">
            {/* Step number */}
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold mt-1"
              style={{
                background: 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))',
                color: 'var(--glass-white)',
                boxShadow: '0 0 12px rgba(107, 45, 255, 0.5)'
              }}
            >
              {index + 1}
            </div>

            {/* Step text */}
            <textarea
              value={step.text}
              onChange={(e) => updateStep(index, e.target.value)}
              placeholder="Describe this step..."
              rows={2}
              className="flex-1 px-3 py-2 glass-card focus:outline-none transition-all duration-300"
              style={{ borderRadius: '12px', color: 'var(--glass-white)' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 16px rgba(0, 255, 157, 0.4)'}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeStep(index)}
              className="px-3 py-2 glass-card transition-all duration-300 hover:scale-110"
              style={{
                borderRadius: '10px',
                color: 'rgba(255, 100, 150, 1)',
                boxShadow: '0 0 12px rgba(255, 0, 80, 0.3)'
              }}
              aria-label="Remove step"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addStep}
          className="w-full px-4 py-3 glass-card border-2 border-dashed transition-all duration-300 hover:scale-[1.02]"
          style={{
            borderRadius: '12px',
            borderColor: 'var(--glass-border)',
            color: 'var(--glass-white)'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'rgba(0, 212, 255, 0.5)';
            e.target.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--glass-border)';
            e.target.style.boxShadow = '';
          }}
        >
          + Add Step
        </button>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed neon-glow-purple"
          style={{
            background: isSubmitting
              ? 'rgba(255, 255, 255, 0.1)'
              : 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))',
            color: 'var(--glass-white)',
            borderRadius: '14px',
          }}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Recipe' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 glass-card font-medium transition-all duration-300 hover:scale-105"
          style={{
            color: 'var(--glass-white)',
            borderRadius: '14px',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
