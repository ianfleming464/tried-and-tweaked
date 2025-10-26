export default function CategoryFilter({ categories, selectedCategories, toggleCategory }) {
  return (
    <div className="overflow-x-auto pb-2">
      {/* Horizontal scrolling container for category chips */}
      <div className="flex gap-2 min-w-max">
        {categories.map(category => {
          const isSelected = selectedCategories.includes(category);

          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`
                px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap
                ${isSelected
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-neutral-700 border border-neutral-300 hover:border-orange-500'
                }
              `}
              aria-pressed={isSelected}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
