// Helper function to scale ingredient quantities
function scaleQuantity(baseQuantity, baseServings, selectedServings) {
  // Calculate the scale factor
  const scaleFactor = selectedServings / baseServings;
  const scaledValue = baseQuantity * scaleFactor;

  // Round to reasonable increments for cooking measurements
  // Use 0.25 increments for values under 10 (common fractions: 1/4, 1/2, 3/4)
  if (scaledValue < 10) {
    return Math.round(scaledValue * 4) / 4;  // Rounds to nearest 0.25
  }

  // For larger values, round to 1 decimal place
  return Math.round(scaledValue * 10) / 10;
}

// Check if ingredient should not be scaled (contains "to taste" phrase)
function shouldNotScale(ingredient) {
  const toTastePattern = /to taste/i;
  return (
    toTastePattern.test(ingredient.name) ||
    toTastePattern.test(ingredient.unit) ||
    (ingredient.note && toTastePattern.test(ingredient.note))
  );
}

// Format ingredient display
function formatIngredient(ingredient, baseServings, selectedServings) {
  // Handle zero or null quantity (e.g., "as needed" items)
  if (!ingredient.quantity || ingredient.quantity === 0) {
    return {
      quantity: 'As needed',
      unit: '',
      name: ingredient.name,
      note: ingredient.note
    };
  }

  // Check if this ingredient should be scaled
  const noScale = shouldNotScale(ingredient);

  // Calculate scaled quantity (or use original if not scaling)
  const displayQuantity = noScale
    ? ingredient.quantity
    : scaleQuantity(ingredient.quantity, baseServings, selectedServings);

  return {
    quantity: displayQuantity,
    unit: ingredient.unit,
    name: ingredient.name,
    note: ingredient.note
  };
}

export default function IngredientList({ ingredients, baseServings, selectedServings }) {
  return (
    <div className="editorial-card p-8">
      <h2 className="heading-section" style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
        Ingredients
      </h2>

      <ul className="space-y-3">
        {ingredients.map((ingredient) => {
          const formatted = formatIngredient(ingredient, baseServings, selectedServings);

          return (
            <li key={ingredient.id} className="flex items-start body-text">
              {/* Bullet point */}
              <span className="mr-3 mt-1 text-lg" style={{ color: 'var(--accent-rust)' }}>
                •
              </span>

              {/* Ingredient details */}
              <div className="flex-1">
                <span>
                  {/* Quantity and unit */}
                  {formatted.quantity !== 'As needed' && (
                    <span className="font-medium" style={{ color: 'var(--charcoal)' }}>
                      {formatted.quantity} {formatted.unit}{' '}
                    </span>
                  )}
                  {formatted.quantity === 'As needed' && (
                    <span className="font-medium italic" style={{ color: 'var(--accent-rust)' }}>As needed — </span>
                  )}

                  {/* Ingredient name */}
                  {formatted.name}
                </span>

                {/* Optional note */}
                {formatted.note && (
                  <span className="text-sm ml-1" style={{ color: 'var(--medium-gray)', fontStyle: 'italic' }}>
                    ({formatted.note})
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
