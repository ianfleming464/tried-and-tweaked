import prisma from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

// PUT /api/recipes/[id] - Update an existing recipe
export async function PUT(request, { params }) {
  try {
    // In Next.js 16+, params is a Promise and must be awaited
    const { id } = await params;
    const recipeId = parseInt(id);
    const data = await request.json();

    // Server-side validation (same as create)
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

    if (!data.steps || data.steps.length === 0) {
      return NextResponse.json(
        { error: 'At least one step is required' },
        { status: 400 }
      );
    }

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Update recipe using transaction
    // Strategy: Delete all old ingredients and steps, then create new ones
    // This is simpler than trying to diff and update individual items
    const recipe = await prisma.$transaction(async (tx) => {
      // Delete all existing ingredients and steps
      await tx.ingredient.deleteMany({
        where: { recipeId }
      });

      await tx.step.deleteMany({
        where: { recipeId }
      });

      // Update recipe and create new ingredients and steps
      return await tx.recipe.update({
        where: { id: recipeId },
        data: {
          title: data.title,
          description: data.description,
          imageUrl: data.imageUrl,
          baseServings: data.baseServings,
          source: data.source,
          categories: data.categories,
          // Create new ingredients
          ingredients: {
            create: data.ingredients.map(ing => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              note: ing.note,
              order: ing.order
            }))
          },
          // Create new steps
          steps: {
            create: data.steps.map(step => ({
              text: step.text,
              order: step.order
            }))
          }
        },
        include: {
          ingredients: true,
          steps: true
        }
      });
    });

    return NextResponse.json(recipe);

  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete a recipe
export async function DELETE(request, { params }) {
  try {
    // In Next.js 16+, params is a Promise and must be awaited
    const { id } = await params;
    const recipeId = parseInt(id);

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    });

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Delete recipe (ingredients and steps are cascade deleted)
    await prisma.recipe.delete({
      where: { id: recipeId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
