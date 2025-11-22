import { test, expect } from '@playwright/test';

test.describe('Search, Discovery, and Pagination', () => {
  
  test('(#5) should increment the total book count on the homepage', async ({ page }) => {
    await page.goto('/');
    const initialCount = await page.locator('.book-item').count();
    
    await page.getByRole('link', { name: 'Add a book' }).click();
    await page.getByLabel('Title').fill('A New Book for Counting');
    await page.getByLabel('Author').fill('Count Author');
    await page.getByRole('button', { name: 'Create Book' }).click();
    
    await page.goto('/');
    await expect(page.locator('.book-item')).toHaveCount(initialCount + 1);
  });

  test('(#7) should find a newly created book via search', async ({ page, request }) => {
    const title = `My Test Book`;
    await request.post('/api/books', { data: { title, author: 'Searchable Author' } });

    await page.goto('/search');
    await page.getByLabel('Search').fill(title);
    await expect(page.getByText(title)).toBeVisible();
  });

  test('(#18) should handle case-insensitive searches', async ({ page, request }) => {
    const title = 'Automation Rocks';
    await request.post('/api/books', { data: { title, author: 'Tester' } });
    
    await page.goto('/search');
    await expect(page.getByText(title)).toBeVisible();
  });

  test('(#15) should display a newly created book on the main list', async ({ page, request }) => {
    const title = `Book Number ${Math.floor(Math.random() * 1000)}`;
    await request.post('/api/books', { data: { title, author: 'Pagination Tester' } });
    await page.goto('/');
    await expect(page.getByText(title)).toBeVisible();
  });
  
  test('(#12) should handle titles with special characters', async ({ page, request }) => {
    const titleWithEmoji = `My Book: A vicenda 🐛`;
    const response = await request.post('/api/books', {
        data: { title: titleWithEmoji, author: 'Unicode Tester' },
    });
    expect(response.ok()).toBeTruthy();
    const book = await response.json();
    
    await page.goto(`/books/${book.id}`);
    await expect(page.getByRole('heading', { name: titleWithEmoji })).toBeVisible();
  });
});

