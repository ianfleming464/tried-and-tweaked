'use client';

import { useState, useMemo } from 'react';
import RecipeCard from './RecipeCard';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import { filterAndSortRecipes } from '@/app/lib/recipeFilters';

const CATEGORIES = ['Vegetarian', 'Vegan', 'Pasta', 'Curry', 'Sandwiches', 'Breakfast'];

export default function RecipeGrid({ recipes }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedRecipes = useMemo(() => {
    return filterAndSortRecipes(recipes, searchQuery, selectedCategories, sortBy);
  }, [recipes, searchQuery, selectedCategories, sortBy]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-6">
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <CategoryFilter
        categories={CATEGORIES}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
      />

      {filteredAndSortedRecipes.length === 0 ? (
        <div className="text-center py-24 px-4">
          <div className="text-7xl mb-6 filter drop-shadow-lg">🍽️</div>
          <p
            className="text-xl mb-3"
            style={{
              color: 'var(--glass-white)',
              fontFamily: 'var(--font-outfit)',
              textShadow: '0 2px 12px rgba(107, 45, 255, 0.6)'
            }}
          >
            {searchQuery || selectedCategories.length > 0
              ? `No recipes found${searchQuery ? ` for "${searchQuery}"` : ''}`
              : 'No recipes yet'}
          </p>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {!(searchQuery || selectedCategories.length > 0) && 'Start by adding your first recipe'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
