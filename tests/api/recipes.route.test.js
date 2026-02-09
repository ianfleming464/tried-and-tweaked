import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    recipe: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/app/lib/prisma', () => ({
  default: mockPrisma,
}));

import { POST } from '@/app/api/recipes/route';

function buildRequest(body) {
  return new Request('http://localhost/api/recipes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validPayload() {
  return {
    title: 'Test Recipe',
    description: 'A test recipe',
    imageUrl: 'https://example.com/test.jpg',
    baseServings: 4,
    source: 'Test Kitchen',
    categories: 'Vegan,Pasta',
    ingredients: [
      {
        name: 'Flour',
        amountText: '2 cups',
        order: 0,
      },
    ],
    steps: [
      {
        text: 'Mix ingredients',
        order: 0,
      },
    ],
  };
}

describe('POST /api/recipes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when title is missing', async () => {
    const payload = validPayload();
    payload.title = ' ';

    const response = await POST(buildRequest(payload));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Recipe title is required');
    expect(mockPrisma.recipe.create).not.toHaveBeenCalled();
  });

  it('creates a recipe and returns 201', async () => {
    const payload = validPayload();
    const createdRecipe = {
      id: 1,
      ...payload,
      ingredients: payload.ingredients,
      steps: payload.steps,
    };

    mockPrisma.recipe.create.mockResolvedValue(createdRecipe);

    const response = await POST(buildRequest(payload));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe(1);
    expect(mockPrisma.recipe.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.recipe.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: payload.title,
          categories: payload.categories,
          ingredients: expect.objectContaining({
            create: expect.arrayContaining([
              expect.objectContaining({
                name: 'Flour',
                amountText: '2 cups',
                quantity: 2,
                unit: 'cups',
              }),
            ]),
          }),
        }),
        include: { ingredients: true, steps: true },
      })
    );
  });
});
