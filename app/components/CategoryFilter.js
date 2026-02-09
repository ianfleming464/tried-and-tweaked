export default function CategoryFilter({ categories, selectedCategories, toggleCategory }) {
  return (
    <div className="overflow-x-auto pb-3">
      {/* Horizontal scrolling container for category chips */}
      <div className="flex gap-3 min-w-max">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);

          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className="px-5 py-2.5 transition-all duration-300 whitespace-nowrap hover:scale-105 active:scale-95"
              style={isSelected ? {
                background: 'var(--charcoal)',
                color: 'var(--white)',
                border: '2px solid var(--charcoal)',
                borderRadius: '7px',
                fontFamily: 'var(--font-crimson)',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.875rem'
              } : {
                background: 'transparent',
                color: 'var(--charcoal)',
                border: '2px solid var(--border-subtle)',
                borderRadius: '7px',
                fontFamily: 'var(--font-crimson)',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.875rem'
              }}
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
