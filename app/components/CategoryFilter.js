export default function CategoryFilter({ categories, selectedCategories, toggleCategory }) {
  return (
    <div className="overflow-x-auto pb-3">
      {/* Horizontal scrolling container for glass category chips */}
      <div className="flex gap-3 min-w-max">
        {categories.map((category, index) => {
          const isSelected = selectedCategories.includes(category);

          const getGradient = (idx) => {
            const gradients = [
              'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))',
              'linear-gradient(135deg, var(--cyan-glow), var(--royal-purple))',
              'linear-gradient(135deg, var(--emerald-glow), var(--cyan-glow))',
            ];
            return gradients[idx % 3];
          };

          return (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className="px-5 py-2.5 font-medium transition-all duration-300 whitespace-nowrap hover:scale-105 active:scale-95 glass-card"
              style={isSelected ? {
                background: getGradient(index),
                color: 'var(--glass-white)',
                borderRadius: '14px',
                boxShadow: '0 0 20px rgba(107, 45, 255, 0.6), 0 4px 16px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              } : {
                background: 'var(--glass-bg)',
                color: 'var(--glass-white)',
                borderRadius: '14px',
                border: '1px solid var(--glass-border)',
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
