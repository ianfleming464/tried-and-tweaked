function getRecipeCategories(categories) {
  return categories
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean);
}

export function filterAndSortRecipes(recipes, searchQuery, selectedCategories, sortBy) {
  let filtered = recipes;

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(query) ||
        (recipe.description && recipe.description.toLowerCase().includes(query))
    );
  }

  if (selectedCategories.length > 0) {
    filtered = filtered.filter((recipe) => {
      const recipeCategories = getRecipeCategories(recipe.categories);
      return selectedCategories.every((category) => recipeCategories.includes(category));
    });
  }

  return [...filtered].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }

    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }

    return 0;
  });
}
