import { describe, expect, it } from 'vitest';
import { parseAmountText, toIngredientRecord } from '@/app/lib/ingredientAmount';

describe('parseAmountText', () => {
  it('parses compact number and unit (e.g., 450g)', () => {
    expect(parseAmountText('450g')).toEqual({ quantity: 450, unit: 'g' });
  });

  it('parses spaced number and unit (e.g., 1 sachet)', () => {
    expect(parseAmountText('1 sachet')).toEqual({ quantity: 1, unit: 'sachet' });
  });

  it('returns null quantity for non-numeric amount', () => {
    expect(parseAmountText('pinch')).toEqual({ quantity: null, unit: null });
  });
});

describe('toIngredientRecord', () => {
  it('stores amountText and parsed numeric fields when possible', () => {
    expect(
      toIngredientRecord({
        name: 'Flour',
        amountText: '450g',
        order: 1,
      })
    ).toEqual({
      name: 'Flour',
      amountText: '450g',
      quantity: 450,
      unit: 'g',
      note: null,
      order: 1,
    });
  });

  it('keeps legacy numeric payload compatible', () => {
    expect(
      toIngredientRecord({
        name: 'Yeast',
        quantity: 7,
        unit: 'g',
        order: 1,
      })
    ).toEqual({
      name: 'Yeast',
      amountText: '7 g',
      quantity: 7,
      unit: 'g',
      note: null,
      order: 1,
    });
  });
});
