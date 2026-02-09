'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import IngredientList from './IngredientList';
import StepList from './StepList';
import ConfirmModal from './ConfirmModal';

export default function RecipeDetail({ recipe }) {
  const router = useRouter();

  // State for selected serving size - defaults to recipe's base serving size
  const [selectedServings, setSelectedServings] = useState(recipe.baseServings);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for formatted date
  const [formattedDate, setFormattedDate] = useState('');

  const categories = recipe.categories.split(',').map(c => c.trim());

  useEffect(() => {
    // Format date only on client to avoid hydration mismatch
    setFormattedDate(new Date(recipe.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }));
  }, [recipe.createdAt]);

  // Serving size options (2-6 people)
  const servingOptions = [2, 3, 4, 5, 6];

  // Handle recipe deletion
  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      // Redirect to home page after successful deletion
      router.push('/');
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-8 py-12">
      {/* Recipe header */}
      <div className="editorial-card p-10 mb-8">
        {recipe.imageUrl && (
          <div className="w-full h-64 md:h-96 overflow-hidden mb-8" style={{ border: '1px solid var(--border-subtle)' }}>
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="heading-display" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="body-text" style={{ fontSize: '1.125rem', lineHeight: '1.8', marginBottom: '2rem', color: 'var(--medium-gray)' }}>
            {recipe.description}
          </p>
        )}

        <div className="divider-subtle" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {categories.map((category) => (
              <span key={category} className="category-tag">
                {category}
              </span>
            ))}
          </div>
        </div>

        <div className="body-text" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.938rem', color: 'var(--medium-gray)' }}>
          {recipe.source && (
            <div>
              <span style={{ fontWeight: '600' }}>Source:</span> {recipe.source}
            </div>
          )}
          <div suppressHydrationWarning>
            <span style={{ fontWeight: '600' }}>Added:</span> {formattedDate}
          </div>
        </div>
      </div>

      {/* Serving size selector */}
      <div className="editorial-card p-8 mb-8">
        <label className="label-text block mb-4">
          Servings
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {servingOptions.map(size => (
            <button
              key={size}
              onClick={() => setSelectedServings(size)}
              className="px-6 py-3 transition-all duration-300 min-w-[60px] hover:scale-105"
              style={selectedServings === size ? {
                background: 'var(--charcoal)',
                color: 'var(--white)',
                border: '2px solid var(--charcoal)',
                borderRadius: '7px',
                fontFamily: 'var(--font-crimson)',
                fontWeight: '600',
                fontSize: '1.125rem'
              } : {
                background: 'transparent',
                color: 'var(--charcoal)',
                border: '2px solid var(--border-subtle)',
                borderRadius: '7px',
                fontFamily: 'var(--font-crimson)',
                fontWeight: '500',
                fontSize: '1.125rem'
              }}
              aria-pressed={selectedServings === size}
              aria-label={`${size} servings`}
            >
              {size}
            </button>
          ))}
        </div>
        {selectedServings !== recipe.baseServings && (
          <p className="body-text" style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--medium-gray)', fontStyle: 'italic' }}>
            Scaled from {recipe.baseServings} servings
          </p>
        )}
      </div>

      {/* Two-column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      <div className="mt-12 flex gap-4 flex-wrap">
        <Link
          href={`/recipes/${recipe.id}/edit`}
          className="btn-secondary"
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          Edit Recipe
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="transition-all duration-300 hover:scale-105"
          style={{
            background: '#b5533d',
            color: 'var(--white)',
            padding: '0.875rem 2rem',
            border: '2px solid #b5533d',
            borderRadius: '7px',
            fontFamily: 'var(--font-crimson)',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Delete Recipe
        </button>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        title="Delete Recipe?"
        message="This will permanently delete this recipe. This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
      />
    </main>
  );
}
