import { describe, expect, it } from 'vitest';
import { filterAndSortRecipes } from '@/app/lib/recipeFilters';

const recipes = [
  {
    id: 1,
    title: 'Vegan Pasta',
    description: 'Creamy cashew sauce',
    categories: 'Vegan, Pasta',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'Pasta Alfredo',
    description: 'Classic comfort food',
    categories: 'Pasta, Vegetarian',
    createdAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 3,
    title: 'Tofu Curry',
    description: 'Vegan curry',
    categories: 'Vegan, Curry',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('filterAndSortRecipes', () => {
  it('filters by search query across title and description', () => {
    const result = filterAndSortRecipes(recipes, 'cashew', [], 'newest');
    expect(result.map((recipe) => recipe.id)).toEqual([1]);
  });

  it('matches recipes with a single selected category', () => {
    const result = filterAndSortRecipes(recipes, '', ['Pasta'], 'alphabetical');
    expect(result.map((recipe) => recipe.id)).toEqual([2, 1]);
  });

  it('requires recipes to match all selected categories (AND logic)', () => {
    const result = filterAndSortRecipes(recipes, '', ['Vegan', 'Pasta'], 'newest');
    expect(result.map((recipe) => recipe.id)).toEqual([1]);
  });

  it('sorts by oldest first when requested', () => {
    const result = filterAndSortRecipes(recipes, '', [], 'oldest');
    expect(result.map((recipe) => recipe.id)).toEqual([3, 1, 2]);
  });
});
