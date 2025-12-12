'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Recipe header with glass effect */}
      <div className="glass-card p-6 mb-6" style={{ borderRadius: '24px' }}>
        {recipe.imageUrl && (
          <div className="w-full h-64 md:h-96 overflow-hidden mb-6 relative" style={{ borderRadius: '20px' }}>
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, rgba(10, 1, 24, 0.3), transparent)',
              }}
            />
          </div>
        )}

        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{
            fontFamily: 'var(--font-outfit)',
            color: 'var(--glass-white)',
            textShadow: '0 0 30px rgba(107, 45, 255, 0.6)',
          }}
        >
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="text-lg mb-4 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            {recipe.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category, index) => (
            <span
              key={category}
              className="inline-block px-3 py-1.5 text-sm font-medium"
              style={{
                background: index % 3 === 0
                  ? 'linear-gradient(135deg, rgba(107, 45, 255, 0.3), rgba(139, 92, 246, 0.3))'
                  : index % 3 === 1
                  ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 255, 157, 0.3))'
                  : 'linear-gradient(135deg, rgba(0, 255, 157, 0.3), rgba(107, 45, 255, 0.3))',
                color: 'var(--glass-white)',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              {category}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {recipe.source && (
            <div>
              <span className="font-medium">Source:</span> {recipe.source}
            </div>
          )}
          <div suppressHydrationWarning>
            <span className="font-medium">Added:</span> {formattedDate}
          </div>
        </div>
      </div>

      {/* Serving size selector with glass effect */}
      <div className="glass-card p-6 mb-6" style={{ borderRadius: '20px' }}>
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--glass-white)' }}>
          Servings
        </label>
        <div className="flex gap-2">
          {servingOptions.map(size => (
            <button
              key={size}
              onClick={() => setSelectedServings(size)}
              className="px-4 py-2 font-medium transition-all duration-300 min-w-[60px] hover:scale-105"
              style={selectedServings === size ? {
                background: 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))',
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
              aria-pressed={selectedServings === size}
              aria-label={`${size} servings`}
            >
              {size}
            </button>
          ))}
        </div>
        {selectedServings !== recipe.baseServings && (
          <p className="mt-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
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

      {/* Action buttons with glass effect */}
      <div className="mt-8 flex gap-4">
        <a
          href={`/recipes/${recipe.id}/edit`}
          className="px-6 py-3 font-medium transition-all duration-300 hover:scale-105 glass-card"
          style={{
            color: 'var(--glass-white)',
            borderRadius: '14px',
            display: 'inline-block',
          }}
        >
          Edit Recipe
        </a>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-6 py-3 font-medium transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 80, 0.7), rgba(255, 50, 100, 0.7))',
            color: 'var(--glass-white)',
            borderRadius: '14px',
            boxShadow: '0 0 20px rgba(255, 0, 80, 0.4)',
            border: '1px solid rgba(255, 100, 150, 0.3)',
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
