'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Vegetarian', 'Vegan', 'Pasta', 'Curry', 'Sandwiches', 'Breakfast'];

export default function RecipeForm({ mode = 'create', initialData = null }) {
  const router = useRouter();

  // Initialize form state - either empty (create) or from initialData (edit)
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [existingImageUrl, setExistingImageUrl] = useState(initialData?.imageUrl ?? '');
  const [baseServings, setBaseServings] = useState(initialData?.baseServings ?? 4);
  const [source, setSource] = useState(initialData?.source ?? '');
  const [selectedCategories, setSelectedCategories] = useState(
    initialData?.categories ? initialData.categories.split(',').map(c => c.trim()) : []
  );

  // Dynamic ingredients array
  const [ingredients, setIngredients] = useState(
    initialData?.ingredients
      ? initialData.ingredients.map(ing => ({
          ...ing,
          name: ing.name ?? '',
          unit: ing.unit ?? '',
          note: ing.note ?? '',
          quantity: ing.quantity ?? ''
        }))
      : []
  );

  // Dynamic steps array
  const [steps, setSteps] = useState(
    initialData?.steps
      ? initialData.steps.map(step => ({
          ...step,
          text: step.text ?? ''
        }))
      : []
  );

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const maxImageSizeBytes = 5 * 1024 * 1024;

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

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setImageFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > maxImageSizeBytes) {
      setError('Image must be 5MB or smaller.');
      event.target.value = '';
      return;
    }

    setError('');
    setImageFile(file);
  };

  const uploadSelectedImage = async () => {
    if (!imageFile) {
      return existingImageUrl?.trim() || null;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to upload image');
      }

      setExistingImageUrl(responseData.url);
      return responseData.url;
    } finally {
      setIsUploadingImage(false);
    }
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
      const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.quantity);
      const validSteps = steps.filter(step => step.text.trim());
      const resolvedImageUrl = await uploadSelectedImage();

      const recipeData = {
        title: title.trim(),
        description: description.trim() || null,
        imageUrl: resolvedImageUrl,
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
        <div style={{
          background: 'rgba(181, 83, 61, 0.1)',
          border: '2px solid var(--accent-rust)',
          borderRadius: '4px',
          color: 'var(--accent-rust)',
          padding: '1rem 1.5rem'
        }}>
          {error}
        </div>
      )}

      {/* Recipe Details Section */}
      <div className="editorial-card p-8 space-y-6">
        <h2 className="heading-section" style={{ fontSize: '1.5rem' }}>Recipe Details</h2>

        {/* Title */}
        <div>
          <label htmlFor="title" className="label-text block mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 body-text focus:outline-none transition-all duration-300"
            style={{
              border: '2px solid var(--border-subtle)',
              borderRadius: '4px',
              background: 'var(--white)'
            }}
            placeholder="e.g., Grandma's Apple Pie"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="label-text block mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 body-text focus:outline-none transition-all duration-300"
            style={{
              border: '2px solid var(--border-subtle)',
              borderRadius: '4px',
              background: 'var(--white)'
            }}
            placeholder="Story, context, or notes about this recipe..."
          />
        </div>

        {/* Image upload */}
        <div>
          <label htmlFor="imageFile" className="label-text block mb-3">
            Upload Image
          </label>
          <input
            type="file"
            id="imageFile"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageFileChange}
            ref={fileInputRef}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
          >
            {imageFile ? 'Change File' : 'Choose File'}
          </button>
          <p className="body-text mt-2" style={{ fontSize: '0.875rem', color: 'var(--medium-gray)' }}>
            JPG, PNG, WEBP, or GIF up to 5MB.
          </p>
          {imageFile && (
            <p className="body-text mt-2" style={{ fontSize: '0.875rem', color: 'var(--charcoal)' }}>
              Selected: {imageFile.name}
            </p>
          )}
          {existingImageUrl && !imageFile && (
            <p className="body-text mt-2" style={{ fontSize: '0.875rem', color: 'var(--medium-gray)' }}>
              Existing image will be kept unless you choose a new file.
            </p>
          )}
        </div>

        {/* Base Servings */}
        <div>
          <label htmlFor="baseServings" className="label-text block mb-2">
            Base Servings *
          </label>
          <input
            type="number"
            id="baseServings"
            value={baseServings}
            onChange={(e) => setBaseServings(e.target.value)}
            min="1"
            className="w-full px-4 py-3 body-text focus:outline-none transition-all duration-300"
            style={{
              border: '2px solid var(--border-subtle)',
              borderRadius: '4px',
              background: 'var(--white)'
            }}
            required
          />
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className="label-text block mb-2">
            Source
          </label>
          <input
            type="text"
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-4 py-3 body-text focus:outline-none transition-all duration-300"
            style={{
              border: '2px solid var(--border-subtle)',
              borderRadius: '4px',
              background: 'var(--white)'
            }}
            placeholder="Book, website, or person"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="label-text block mb-3">
            Categories *
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {CATEGORIES.map((category) => (
              <label
                key={category}
                className="px-4 py-2 cursor-pointer transition-all duration-300 hover:scale-105"
                style={selectedCategories.includes(category) ? {
                  background: 'var(--charcoal)',
                  color: 'var(--white)',
                  border: '2px solid var(--charcoal)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-crimson)',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.875rem'
                } : {
                  background: 'transparent',
                  color: 'var(--charcoal)',
                  border: '2px solid var(--border-subtle)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-crimson)',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.875rem'
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
      <div className="editorial-card p-8 space-y-4">
        <h2 className="heading-section" style={{ fontSize: '1.5rem' }}>Ingredients</h2>

        {ingredients.map((ingredient, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }} className="sm:grid-cols-12">
              {/* Ingredient name */}
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="sm:col-span-4 px-3 py-2 body-text focus:outline-none transition-all duration-300"
                style={{
                  border: '2px solid var(--border-subtle)',
                  borderRadius: '4px',
                  background: 'var(--white)'
                }}
              />

              {/* Quantity */}
              <input
                type="number"
                step="0.01"
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                placeholder="Qty"
                className="sm:col-span-2 px-3 py-2 body-text focus:outline-none transition-all duration-300"
                style={{
                  border: '2px solid var(--border-subtle)',
                  borderRadius: '4px',
                  background: 'var(--white)'
                }}
              />

              {/* Unit */}
              <input
                type="text"
                value={ingredient.unit}
                onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                placeholder="Unit"
                className="sm:col-span-2 px-3 py-2 body-text focus:outline-none transition-all duration-300"
                style={{
                  border: '2px solid var(--border-subtle)',
                  borderRadius: '4px',
                  background: 'var(--white)'
                }}
              />

              {/* Note */}
              <input
                type="text"
                value={ingredient.note}
                onChange={(e) => updateIngredient(index, 'note', e.target.value)}
                placeholder="Note (optional)"
                className="sm:col-span-4 px-3 py-2 body-text focus:outline-none transition-all duration-300"
                style={{
                  border: '2px solid var(--border-subtle)',
                  borderRadius: '4px',
                  background: 'var(--white)'
                }}
              />
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeIngredient(index)}
              className="px-3 py-2 transition-all duration-300 hover:scale-110"
              style={{
                border: '2px solid var(--accent-rust)',
                borderRadius: '4px',
                color: 'var(--accent-rust)',
                background: 'var(--white)',
                cursor: 'pointer'
              }}
              aria-label="Remove ingredient"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addIngredient}
          className="w-full px-4 py-3 transition-all duration-300 hover:scale-[1.01]"
          style={{
            border: '2px dashed var(--border-subtle)',
            borderRadius: '4px',
            background: 'transparent',
            color: 'var(--charcoal)',
            fontFamily: 'var(--font-crimson)',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          + Add Ingredient
        </button>
      </div>

      {/* Steps Section */}
      <div className="editorial-card p-8 space-y-4">
        <h2 className="heading-section" style={{ fontSize: '1.5rem' }}>Cooking Steps</h2>

        {steps.map((step, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'start' }}>
            {/* Step number */}
            <div
              style={{
                flexShrink: 0,
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginTop: '0.25rem',
                background: 'var(--charcoal)',
                color: 'var(--white)',
                fontFamily: 'var(--font-crimson)',
                fontSize: '0.875rem'
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
              className="flex-1 px-3 py-2 body-text focus:outline-none transition-all duration-300"
              style={{
                border: '2px solid var(--border-subtle)',
                borderRadius: '4px',
                background: 'var(--white)'
              }}
            />

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeStep(index)}
              className="px-3 py-2 transition-all duration-300 hover:scale-110"
              style={{
                border: '2px solid var(--accent-rust)',
                borderRadius: '4px',
                color: 'var(--accent-rust)',
                background: 'var(--white)',
                cursor: 'pointer'
              }}
              aria-label="Remove step"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addStep}
          className="w-full px-4 py-3 transition-all duration-300 hover:scale-[1.01]"
          style={{
            border: '2px dashed var(--border-subtle)',
            borderRadius: '4px',
            background: 'transparent',
            color: 'var(--charcoal)',
            fontFamily: 'var(--font-crimson)',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          + Add Step
        </button>
      </div>

      {/* Form Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? isUploadingImage ? 'Uploading image...' : 'Saving...'
            : mode === 'create' ? 'Create Recipe' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
