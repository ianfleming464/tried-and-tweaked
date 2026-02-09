import prisma from '@/app/lib/prisma';
import { toIngredientRecord } from '@/app/lib/ingredientAmount';
import { NextResponse } from 'next/server';

// POST /api/recipes - Create a new recipe
export async function POST(request) {
  try {
    // Parse request body
    const data = await request.json();

    // Server-side validation
    if (!data.title || !data.title.trim()) {
      return NextResponse.json(
        { error: 'Recipe title is required' },
        { status: 400 }
      );
    }

    if (!data.baseServings || data.baseServings < 1) {
      return NextResponse.json(
        { error: 'Base servings must be at least 1' },
        { status: 400 }
      );
    }

    if (!data.categories) {
      return NextResponse.json(
        { error: 'At least one category is required' },
        { status: 400 }
      );
    }

    if (!data.ingredients || data.ingredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    const validIngredients = data.ingredients
      .map(toIngredientRecord)
      .filter((ingredient) => ingredient.name);

    if (validIngredients.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    if (!data.steps || data.steps.length === 0) {
      return NextResponse.json(
        { error: 'At least one step is required' },
        { status: 400 }
      );
    }

    // Create recipe with nested ingredients and steps in a single transaction
    const recipe = await prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        baseServings: data.baseServings,
        source: data.source,
        categories: data.categories,
        // Nested create for ingredients
        ingredients: {
          create: validIngredients.map((ingredient, index) => ({
            ...ingredient,
            order: index + 1,
          }))
        },
        // Nested create for steps
        steps: {
          create: data.steps.map(step => ({
            text: step.text,
            order: step.order
          }))
        }
      },
      // Include the created ingredients and steps in the response
      include: {
        ingredients: true,
        steps: true
      }
    });

    // Return the created recipe
    return NextResponse.json(recipe, { status: 201 });

  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
