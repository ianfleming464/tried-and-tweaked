'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RecipeCard({ recipe }) {
  const categories = recipe.categories.split(',').map(c => c.trim());
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // Format date only on client to avoid hydration mismatch
    setFormattedDate(new Date(recipe.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }));
  }, [recipe.createdAt]);

  return (
    <Link href={`/recipes/${recipe.id}`} className="block group">
      <article
        className="overflow-hidden glass-card transition-all duration-500 group-hover:glass-card-hover"
        style={{
          borderRadius: '20px'
        }}
      >
        {/* Recipe image with aurora overlay */}
        <div className="relative h-56 overflow-hidden" style={{ background: 'var(--dark-surface)' }}>
          {recipe.imageUrl ? (
            <>
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(107, 45, 255, 0.3), rgba(0, 212, 255, 0.2))'
                }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--dark-surface)' }}>
              <span className="text-7xl filter drop-shadow-lg">🍽️</span>
            </div>
          )}
        </div>

        {/* Card content with glass effect */}
        <div className="p-5">
          <h3
            className="font-bold text-lg mb-3 line-clamp-2"
            style={{
              fontFamily: 'var(--font-outfit)',
              color: 'var(--glass-white)',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)'
            }}
          >
            {recipe.title}
          </h3>

          {/* Category tags with neon accents */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category, index) => (
              <span
                key={category}
                className="inline-block px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: index % 3 === 0
                    ? 'linear-gradient(135deg, rgba(107, 45, 255, 0.3), rgba(139, 92, 246, 0.3))'
                    : index % 3 === 1
                    ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 255, 157, 0.3))'
                    : 'linear-gradient(135deg, rgba(0, 255, 157, 0.3), rgba(107, 45, 255, 0.3))',
                  color: 'var(--glass-white)',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                {category}
              </span>
            ))}
          </div>

          {/* Meta information */}
          <div className="flex items-center justify-between text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            <span className="flex items-center gap-1.5">
              <span>👥</span>
              {recipe.baseServings} servings
            </span>
            <span suppressHydrationWarning>{formattedDate}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
