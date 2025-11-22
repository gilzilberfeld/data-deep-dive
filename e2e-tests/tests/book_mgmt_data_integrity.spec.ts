import { test, expect } from '@playwright/test';

test.describe('Book Management and Data Integrity', () => {
  
  test('(#3) should allow adding a review to a pre-existing bestseller', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Pride and Prejudice')).toBeVisible();
    await page.getByLabel('Rating').selectOption('5');
    await page.getByLabel('Comment').fill('A timeless classic!');
    await page.getByRole('button', { name: 'Add Review' }).click();
    await expect(page.getByText('A timeless classic!')).toBeVisible();
  });
  
  test('(#17) should handle long book titles', async ({ page, request }) => {
    const veryLongTitle = 'This Title Is Intentionally Made Very Long To Test The Hypothesis That The Backend API Might Silently Truncate It Without Returning An Error Which Could Lead To Subtle Bugs In The User Interface When Searching For The Full Title Later On And Finding No Results ' + 'a'.repeat(200);
    const response = await request.post('/api/books', {
        data: { title: veryLongTitle, author: 'Dr. Edge Case' },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('(#25) should reflect API-driven title updates in the UI', async ({ page, request }) => {
    const bookResponse = await request.post('/api/books', {
      data: { title: 'Original Title', author: 'State Tester' },
    });
    const book = await bookResponse.json();
    await page.goto(`/books/${book.id}`);
    await expect(page.getByRole('heading', { name: 'Original Title' })).toBeVisible();

    const bookResponse2 = await request.post('/api/books', {
      data: { title: 'Updated Title', author: 'State Tester' },
    });
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByLabel('Title')).toHaveValue('Updated Title');
  });

  test('(#9, #11, #24) should correctly delete a user and their data', async ({ page, request }) => {
    const userRes = await request.post('/api/users', { data: { name: 'Temp User', email: `temp-${Date.now()}@test.com`, password: 'password' } });
    const user = await userRes.json();
    
    const delResponse = await request.delete(`/api/users/${user.id}`);
    expect(delResponse.ok()).toBeTruthy();

    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page.getByText('Invalid username or password')).toBeVisible();
  });
});

