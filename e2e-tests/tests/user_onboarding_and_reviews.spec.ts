import { test, expect } from '@playwright/test';

test.describe('User Onboarding and First Review', () => {
  const sharedUser = {
    email: 'test-user@example.com',
    password: 'password123',
    name: 'Test User'
  };

  test('(#1, #2, #16) should allow a new user to sign up', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Name').fill(sharedUser.name);
    await page.getByLabel('Email').fill(sharedUser.email);
    await page.getByLabel('Password').fill(sharedUser.password);
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByRole('heading', { name: `Welcome, ${sharedUser.name}` })).toBeVisible();
  });

  test('(#1) should allow the new user to create their first book', async ({ page }) => {
    await page.getByRole('link', { name: 'Add a book' }).click();
    await page.getByLabel('Title').fill('The Lord of the Rings');
    await page.getByLabel('Author').fill('J.R.R. Tolkien');
    await page.getByRole('button', { name: 'Create Book' }).click();
    await expect(page.getByText('The Lord of the Rings')).toBeVisible();
  });

  test('(#1) should allow the user to add a review to their new book', async ({ page }) => {
    await page.getByText('The Lord of the Rings').click();
    await page.getByLabel('Rating').selectOption('5');
    await page.getByLabel('Comment').fill('An epic masterpiece!');
    await page.getByRole('button', { name: 'Add Review' }).click();
    await expect(page.getByText('An epic masterpiece!')).toBeVisible();
  });

  test('(#21) should filter reviews submitted today', async ({ page }) => {
    await page.goto('/reviews');
    await page.getByLabel('Filter by date').selectOption('today');
    await expect(page.getByText('An epic masterpiece!')).toBeVisible();
  });

  test('(#4) should prevent the user from reviewing the same book twice', async ({ page }) => {
      await page.goto('/');
      await page.getByText('The Lord of the Rings').click();
      await page.getByLabel('Rating').selectOption('3');
      await page.getByLabel('Comment').fill('A second thought.');
      await page.getByRole('button', { name: 'Add Review' }).click();
      await expect(page.getByText("You have already reviewed this book.")).toBeVisible();
  });
});

