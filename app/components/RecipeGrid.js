'use client';

import { useState, useMemo } from 'react';
import RecipeCard from './RecipeCard';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';

const CATEGORIES = ['Vegetarian', 'Vegan', 'Pasta', 'Curry', 'Sandwiches', 'Breakfast'];

export default function RecipeGrid({ recipes }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        (recipe.description && recipe.description.toLowerCase().includes(query))
      );
    }

    // Apply category filter (OR logic - matches if recipe has ANY selected category)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(recipe => {
        const recipeCategories = recipe.categories.split(',').map(c => c.trim());
        return selectedCategories.some(cat => recipeCategories.includes(cat));
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return sorted;
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
        <div className="text-center py-16">
          <p className="text-neutral-500 text-lg">
            {searchQuery || selectedCategories.length > 0
              ? `No recipes found${searchQuery ? ` for "${searchQuery}"` : ''}`
              : 'No recipes yet. Add your first recipe!'}
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
