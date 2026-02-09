import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPrisma, tx } = vi.hoisted(() => ({
  tx: {
    ingredient: {
      deleteMany: vi.fn(),
    },
    step: {
      deleteMany: vi.fn(),
    },
    recipe: {
      update: vi.fn(),
    },
  },
  mockPrisma: {
    recipe: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/app/lib/prisma', () => ({
  default: mockPrisma,
}));

import { DELETE, PUT } from '@/app/api/recipes/[id]/route';

function buildPutRequest(body) {
  return new Request('http://localhost/api/recipes/1', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function buildDeleteRequest() {
  return new Request('http://localhost/api/recipes/1', { method: 'DELETE' });
}

function validPayload() {
  return {
    title: 'Updated Recipe',
    description: 'Updated description',
    imageUrl: 'https://example.com/new.jpg',
    baseServings: 5,
    source: 'Updated Source',
    categories: 'Vegan,Pasta',
    ingredients: [
      {
        name: 'Olive oil',
        quantity: 1,
        unit: 'tbsp',
        note: '',
        order: 0,
      },
    ],
    steps: [
      {
        text: 'Cook everything',
        order: 0,
      },
    ],
  };
}

describe('PUT /api/recipes/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback) => callback(tx));
  });

  it('returns 404 when recipe does not exist', async () => {
    mockPrisma.recipe.findUnique.mockResolvedValue(null);

    const response = await PUT(buildPutRequest(validPayload()), {
      params: Promise.resolve({ id: '1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Recipe not found');
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('updates recipe using transaction', async () => {
    const payload = validPayload();
    const updatedRecipe = { id: 1, ...payload };

    mockPrisma.recipe.findUnique.mockResolvedValue({ id: 1 });
    tx.recipe.update.mockResolvedValue(updatedRecipe);

    const response = await PUT(buildPutRequest(payload), {
      params: Promise.resolve({ id: '1' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe(1);
    expect(tx.ingredient.deleteMany).toHaveBeenCalledWith({ where: { recipeId: 1 } });
    expect(tx.step.deleteMany).toHaveBeenCalledWith({ where: { recipeId: 1 } });
    expect(tx.recipe.update).toHaveBeenCalledTimes(1);
  });
});

describe('DELETE /api/recipes/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when recipe does not exist', async () => {
    mockPrisma.recipe.findUnique.mockResolvedValue(null);

    const response = await DELETE(buildDeleteRequest(), {
      params: Promise.resolve({ id: '123' }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Recipe not found');
    expect(mockPrisma.recipe.delete).not.toHaveBeenCalled();
  });

  it('deletes recipe and returns success', async () => {
    mockPrisma.recipe.findUnique.mockResolvedValue({ id: 123 });
    mockPrisma.recipe.delete.mockResolvedValue({ id: 123 });

    const response = await DELETE(buildDeleteRequest(), {
      params: Promise.resolve({ id: '123' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(mockPrisma.recipe.delete).toHaveBeenCalledWith({ where: { id: 123 } });
  });
});
