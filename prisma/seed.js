const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.step.deleteMany({});
  await prisma.ingredient.deleteMany({});
  await prisma.recipe.deleteMany({});

  console.log('Creating sample recipes...');

  // Recipe 1: Classic Spaghetti Carbonara
  await prisma.recipe.create({
    data: {
      title: 'Classic Spaghetti Carbonara',
      description: 'An authentic Italian pasta dish with eggs, cheese, pancetta, and black pepper. Simple ingredients, incredible flavor.',
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80',
      baseServings: 4,
      source: 'Nonna\'s kitchen',
      categories: 'Pasta',
      ingredients: {
        create: [
          { name: 'Spaghetti', quantity: 400, unit: 'g', order: 1 },
          { name: 'Pancetta or guanciale', quantity: 200, unit: 'g', note: 'diced', order: 2 },
          { name: 'Eggs', quantity: 4, unit: 'whole', order: 3 },
          { name: 'Pecorino Romano cheese', quantity: 100, unit: 'g', note: 'grated', order: 4 },
          { name: 'Black pepper', quantity: 0, unit: '', note: 'to taste, freshly ground', order: 5 },
          { name: 'Salt', quantity: 0, unit: '', note: 'to taste', order: 6 }
        ]
      },
      steps: {
        create: [
          { text: 'Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.', order: 1 },
          { text: 'While pasta cooks, fry pancetta in a large pan over medium heat until crispy, about 5-7 minutes.', order: 2 },
          { text: 'In a bowl, whisk together eggs and grated Pecorino Romano cheese.', order: 3 },
          { text: 'Reserve 1 cup of pasta cooking water, then drain pasta.', order: 4 },
          { text: 'Remove pan from heat. Add hot pasta to pancetta and toss to combine.', order: 5 },
          { text: 'Quickly pour egg mixture over pasta, tossing constantly. Add reserved pasta water a little at a time until creamy.', order: 6 },
          { text: 'Season generously with black pepper and serve immediately with extra cheese.', order: 7 }
        ]
      }
    }
  });

  // Recipe 2: Chickpea Tikka Masala
  await prisma.recipe.create({
    data: {
      title: 'Chickpea Tikka Masala',
      description: 'A vegetarian twist on the classic Indian curry. Rich, creamy, and full of warm spices.',
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
      baseServings: 6,
      source: 'Adapted from Meera Sodha',
      categories: 'Curry,Vegetarian',
      ingredients: {
        create: [
          { name: 'Chickpeas', quantity: 800, unit: 'g', note: 'cooked or 2 cans', order: 1 },
          { name: 'Onion', quantity: 2, unit: 'medium', note: 'diced', order: 2 },
          { name: 'Garlic', quantity: 6, unit: 'cloves', note: 'minced', order: 3 },
          { name: 'Ginger', quantity: 30, unit: 'g', note: 'grated', order: 4 },
          { name: 'Tomato paste', quantity: 70, unit: 'g', order: 5 },
          { name: 'Crushed tomatoes', quantity: 400, unit: 'g', order: 6 },
          { name: 'Coconut milk', quantity: 400, unit: 'ml', note: 'full-fat', order: 7 },
          { name: 'Garam masala', quantity: 2, unit: 'tsp', order: 8 },
          { name: 'Cumin', quantity: 1, unit: 'tsp', order: 9 },
          { name: 'Paprika', quantity: 1, unit: 'tsp', order: 10 },
          { name: 'Vegetable oil', quantity: 2, unit: 'tbsp', order: 11 },
          { name: 'Fresh cilantro', quantity: 0, unit: '', note: 'for garnish', order: 12 }
        ]
      },
      steps: {
        create: [
          { text: 'Heat oil in a large pot over medium heat. Add onions and cook until softened, about 5 minutes.', order: 1 },
          { text: 'Add garlic and ginger, cook for 1 minute until fragrant.', order: 2 },
          { text: 'Stir in garam masala, cumin, and paprika. Cook for 30 seconds.', order: 3 },
          { text: 'Add tomato paste and cook for 2 minutes, stirring frequently.', order: 4 },
          { text: 'Pour in crushed tomatoes and coconut milk. Stir well and bring to a simmer.', order: 5 },
          { text: 'Add chickpeas and simmer for 15-20 minutes until sauce thickens.', order: 6 },
          { text: 'Taste and adjust seasoning with salt. Garnish with fresh cilantro and serve with rice or naan.', order: 7 }
        ]
      }
    }
  });

  // Recipe 3: Perfect Breakfast Scramble
  await prisma.recipe.create({
    data: {
      title: 'Perfect Breakfast Scramble',
      description: 'Creamy, fluffy scrambled eggs with a secret technique. Ready in 5 minutes.',
      imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
      baseServings: 2,
      source: 'https://www.seriouseats.com/perfect-scrambled-eggs',
      categories: 'Breakfast',
      ingredients: {
        create: [
          { name: 'Eggs', quantity: 6, unit: 'large', order: 1 },
          { name: 'Butter', quantity: 30, unit: 'g', order: 2 },
          { name: 'Heavy cream', quantity: 30, unit: 'ml', note: 'optional', order: 3 },
          { name: 'Chives', quantity: 0, unit: '', note: 'chopped, for garnish', order: 4 },
          { name: 'Salt and pepper', quantity: 0, unit: '', note: 'to taste', order: 5 }
        ]
      },
      steps: {
        create: [
          { text: 'Crack eggs into a bowl and whisk vigorously until completely uniform in color.', order: 1 },
          { text: 'Melt butter in a non-stick pan over medium-low heat until foaming.', order: 2 },
          { text: 'Pour in eggs and let sit for 20 seconds without stirring.', order: 3 },
          { text: 'Using a spatula, gently push eggs from edge to center, tilting pan to let uncooked egg flow to edges.', order: 4 },
          { text: 'When eggs are mostly set but still slightly runny, remove from heat. Stir in cream if using.', order: 5 },
          { text: 'Season with salt and pepper. Garnish with chives and serve immediately.', order: 6 }
        ]
      }
    }
  });

  // Recipe 4: Mediterranean Veggie Sandwich
  await prisma.recipe.create({
    data: {
      title: 'Mediterranean Veggie Sandwich',
      description: 'Grilled vegetables with hummus, feta, and fresh herbs in a crusty baguette. Perfect for lunch.',
      imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&q=80',
      baseServings: 4,
      source: 'Family favorite',
      categories: 'Sandwiches,Vegetarian',
      ingredients: {
        create: [
          { name: 'Baguette or ciabatta', quantity: 1, unit: 'large', note: 'sliced horizontally', order: 1 },
          { name: 'Zucchini', quantity: 2, unit: 'medium', note: 'sliced lengthwise', order: 2 },
          { name: 'Red bell pepper', quantity: 2, unit: 'large', note: 'quartered', order: 3 },
          { name: 'Eggplant', quantity: 1, unit: 'small', note: 'sliced', order: 4 },
          { name: 'Hummus', quantity: 200, unit: 'g', order: 5 },
          { name: 'Feta cheese', quantity: 150, unit: 'g', note: 'crumbled', order: 6 },
          { name: 'Fresh basil', quantity: 20, unit: 'g', order: 7 },
          { name: 'Olive oil', quantity: 0, unit: '', note: 'for grilling', order: 8 },
          { name: 'Balsamic glaze', quantity: 0, unit: '', note: 'to taste', order: 9 }
        ]
      },
      steps: {
        create: [
          { text: 'Brush vegetable slices with olive oil and season with salt and pepper.', order: 1 },
          { text: 'Grill vegetables on a grill pan or outdoor grill until charred and tender, about 3-4 minutes per side.', order: 2 },
          { text: 'Toast the baguette halves until lightly crispy.', order: 3 },
          { text: 'Spread hummus generously on both cut sides of bread.', order: 4 },
          { text: 'Layer grilled vegetables on bottom half of bread.', order: 5 },
          { text: 'Top with crumbled feta and fresh basil leaves.', order: 6 },
          { text: 'Drizzle with balsamic glaze, close sandwich, and cut into portions.', order: 7 }
        ]
      }
    }
  });

  // Recipe 5: Vegan Buddha Bowl
  await prisma.recipe.create({
    data: {
      title: 'Vegan Buddha Bowl',
      description: 'A nourishing bowl with roasted chickpeas, quinoa, and tahini dressing. Healthy and delicious.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
      baseServings: 3,
      source: '',
      categories: 'Vegan,Vegetarian',
      ingredients: {
        create: [
          { name: 'Quinoa', quantity: 225, unit: 'g', note: 'uncooked', order: 1 },
          { name: 'Chickpeas', quantity: 400, unit: 'g', note: '1 can, drained', order: 2 },
          { name: 'Sweet potato', quantity: 2, unit: 'medium', note: 'cubed', order: 3 },
          { name: 'Kale', quantity: 150, unit: 'g', note: 'chopped', order: 4 },
          { name: 'Avocado', quantity: 1.5, unit: 'whole', note: 'sliced', order: 5 },
          { name: 'Tahini', quantity: 60, unit: 'ml', order: 6 },
          { name: 'Lemon juice', quantity: 30, unit: 'ml', order: 7 },
          { name: 'Maple syrup', quantity: 15, unit: 'ml', order: 8 },
          { name: 'Olive oil', quantity: 30, unit: 'ml', order: 9 },
          { name: 'Cumin', quantity: 1, unit: 'tsp', order: 10 }
        ]
      },
      steps: {
        create: [
          { text: 'Preheat oven to 400°F (200°C). Cook quinoa according to package directions.', order: 1 },
          { text: 'Toss sweet potato cubes and chickpeas with olive oil and cumin. Spread on baking sheet.', order: 2 },
          { text: 'Roast for 25-30 minutes, stirring halfway, until sweet potatoes are tender and chickpeas are crispy.', order: 3 },
          { text: 'Massage kale with a little olive oil until softened.', order: 4 },
          { text: 'Make dressing: whisk together tahini, lemon juice, maple syrup, and 2-3 tbsp water until smooth.', order: 5 },
          { text: 'Divide quinoa among bowls. Top with roasted vegetables, chickpeas, kale, and avocado.', order: 6 },
          { text: 'Drizzle with tahini dressing and serve.', order: 7 }
        ]
      }
    }
  });

  // Recipe 6: Margherita Pizza
  await prisma.recipe.create({
    data: {
      title: 'Margherita Pizza',
      description: 'Simple and classic Neapolitan pizza with fresh mozzarella, basil, and tomato sauce.',
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
      baseServings: 2,
      source: 'Traditional recipe',
      categories: 'Vegetarian',
      ingredients: {
        create: [
          { name: 'Pizza dough', quantity: 500, unit: 'g', note: 'store-bought or homemade', order: 1 },
          { name: 'Tomato sauce', quantity: 200, unit: 'ml', order: 2 },
          { name: 'Fresh mozzarella', quantity: 250, unit: 'g', note: 'torn into pieces', order: 3 },
          { name: 'Fresh basil', quantity: 20, unit: 'g', note: 'leaves', order: 4 },
          { name: 'Olive oil', quantity: 0, unit: '', note: 'for drizzling', order: 5 },
          { name: 'Salt', quantity: 0, unit: '', note: 'to taste', order: 6 }
        ]
      },
      steps: {
        create: [
          { text: 'Preheat oven to maximum temperature (500°F/260°C or higher) with a pizza stone or baking steel inside.', order: 1 },
          { text: 'Divide dough in half. On a floured surface, stretch each piece into a 10-12 inch circle.', order: 2 },
          { text: 'Transfer dough to a piece of parchment paper. Spread tomato sauce evenly, leaving a border.', order: 3 },
          { text: 'Distribute mozzarella pieces over sauce.', order: 4 },
          { text: 'Slide pizza (with parchment) onto preheated stone. Bake 8-10 minutes until crust is golden and cheese bubbles.', order: 5 },
          { text: 'Remove from oven, top with fresh basil leaves and a drizzle of olive oil.', order: 6 },
          { text: 'Repeat with second pizza. Slice and serve immediately.', order: 7 }
        ]
      }
    }
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
