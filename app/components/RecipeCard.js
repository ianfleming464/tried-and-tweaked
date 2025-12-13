'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RecipeCard({ recipe }) {
  const categories = recipe.categories.split(',').map(c => c.trim());
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(new Date(recipe.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }));
  }, [recipe.createdAt]);

  return (
    <Link href={`/recipes/${recipe.id}`} className="block group">
      <article className="editorial-card overflow-hidden">
        {/* Recipe image */}
        <div className="relative h-64 overflow-hidden" style={{ background: 'var(--off-white)', borderBottom: '1px solid var(--border-subtle)' }}>
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ fontSize: '5rem', opacity: 0.4 }}>🍽️</span>
            </div>
          )}
        </div>

        {/* Card content */}
        <div className="p-8">
          <h3 className="heading-section" style={{ fontSize: '1.75rem', marginBottom: '1rem', lineHeight: '1.3' }}>
            {recipe.title}
          </h3>

          {/* Category tags */}
          <div className="divider-subtle divider-subtle" style={{ paddingTop: '1rem', paddingBottom: '1rem', margin: '1.5rem 0' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {categories.map((category) => (
                <span key={category} className="category-tag">
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Meta information */}
          <div className="body-text" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.938rem', color: 'var(--medium-gray)' }}>
            <span>Serves {recipe.baseServings}</span>
            <span suppressHydrationWarning>{formattedDate}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
