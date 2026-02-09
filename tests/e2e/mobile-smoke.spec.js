import { test, expect } from '@playwright/test';

test('mobile CRUD smoke with upload + search/tag filtering', async ({ page }) => {
  const suffix = Date.now();
  const recipeTitle = `E2E Recipe ${suffix}`;
  const updatedTitle = `${recipeTitle} Updated`;

  await page.route('**/api/upload', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        url: `https://blob.vercel-storage.com/recipes/${suffix}.jpg`,
        pathname: `recipes/${suffix}.jpg`,
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Add new recipe').click();

  await expect(page.getByRole('heading', { name: 'Add New Recipe' })).toBeVisible();
  await expect(page.getByRole('button', { name: '+ Add Ingredient' })).toBeVisible();
  await expect(page.getByRole('button', { name: '+ Add Step' })).toBeVisible();

  await page.locator('#imageFile').setInputFiles({
    name: 'dish.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('mock-image'),
  });

  await page.locator('#title').fill(recipeTitle);
  await page.locator('label', { hasText: 'Vegan' }).first().click();

  await page.getByRole('button', { name: '+ Add Ingredient' }).click();
  await page
    .getByPlaceholder('Amount (e.g. 450g, 1 sachet, pinch)')
    .first()
    .fill('2 pcs');
  await page.getByPlaceholder('Ingredient name').first().fill('Tomato');

  await page.getByRole('button', { name: '+ Add Step' }).click();
  await page.getByPlaceholder('Describe this step...').first().fill('Mix and serve.');

  await page.getByRole('button', { name: 'Create Recipe' }).click();
  await expect(page).toHaveURL(/\/recipes\/\d+$/);
  await expect(page.getByRole('heading', { name: recipeTitle })).toBeVisible();

  await page.getByRole('link', { name: 'Edit Recipe' }).click();
  await expect(page).toHaveURL(/\/recipes\/\d+\/edit$/);
  await page.locator('#title').fill(updatedTitle);
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('heading', { name: updatedTitle })).toBeVisible();

  await page.getByRole('link', { name: 'Back to recipes' }).click();
  await expect(page).toHaveURL('/');

  await page.getByPlaceholder('Search recipes...').fill(updatedTitle);
  const updatedRecipeCardTitle = page.locator('h3', { hasText: updatedTitle });
  await expect(updatedRecipeCardTitle).toHaveCount(1);

  await page.getByRole('button', { name: 'Vegan', exact: true }).click();
  await expect(updatedRecipeCardTitle).toHaveCount(1);

  await page.getByRole('button', { name: 'Pasta', exact: true }).click();
  await expect(updatedRecipeCardTitle).toHaveCount(0);

  await page.getByRole('button', { name: 'Pasta', exact: true }).click();
  await expect(updatedRecipeCardTitle).toHaveCount(1);
  await updatedRecipeCardTitle.first().click();

  await page.getByRole('button', { name: 'Delete Recipe' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page).toHaveURL('/');

  await page.getByPlaceholder('Search recipes...').fill(updatedTitle);
  await expect(page.locator('h3', { hasText: updatedTitle })).toHaveCount(0);
});
