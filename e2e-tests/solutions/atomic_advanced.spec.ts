// This file contains the solutions for problems:
// #9 (Pessimistic Lock)
// #10 (API Rate Limiter)
// #16 (Unvalidated Email)
// #21 (Midnight Bug)
// #23 (Stale Cache Read)

import { test, expect } from '@playwright/test';
import { TestStateFactory } from './models/test_state_factory';
import { BookBuilder } from './models/book_builder';

test.describe('Atomic Systemic and Advanced Tests', () => {
  let factory: TestStateFactory;

  test.beforeEach(async ({ request }) => {
    factory = new TestStateFactory(request);
  });

  test.afterEach(async () => {
    await factory.cleanup();
  });

  test('should reflect API updates in the UI after a reload (#23)', async ({ page, request }) => {
    const book = await factory.createBook({ title: 'Original Title' });
    await page.goto(`/books/${book.id}`);
    await expect(page.locator('h1')).toHaveText('Original Title');

    // Simulate a background update
    await request.patch(`/api/books/${book.id}`, { data: { title: 'Updated Title' } });

    // The key step: reload the page to get fresh state from the server
    await page.reload();

    await expect(page.locator('h1')).toHaveText('Updated Title');
  });

  test('should handle API rate limiting gracefully (#10)', async () => {
    // This is more of a test suite design pattern. The solution is not to have
    // one test that fails, but to design tests that respect the limits.
    // The factory pattern can be extended to include a delay.
    for (let i = 0; i < 5; i++) {
        await factory.createBook({ title: `Rate Limit Test Book ${i}` });
        // In a real scenario, the factory could have a built-in delay
        // await new Promise(res => setTimeout(res, 250));
    }
    // The test passes by not triggering the rate limit.
  });

  test('should pass regardless of when it is run (#21 - Midnight Bug)', async ({ page }) => {
    // The solution is to not rely on relative terms like "today".
    // Instead, create data with a specific timestamp and query for that timestamp.
    const specificDate = '2025-09-24T12:00:00.000Z';
    const book = await factory.createBook({ createdAt: specificDate });

    // The test would then navigate to a page that allows filtering by date
    // and assert the book is present when that specific date is chosen.
    await page.goto(`/books/${book.id}`);
    await expect(page.locator('h1')).toHaveText(book.title);
  });

   test('a user should be forced to an active state for testing (#16)', async ({ request, page }) => {
    // Create a user in the default "pending validation" state
    const user = await factory.createUser({ validated: false });
    
    // Force the state change via a special API endpoint for tests
    await request.post(`/api/users/${user.id}/force-validation`);
    
    // Now, the login will succeed
    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByText(`Logged in as ${user.name}`)).toBeVisible();
  });

  test('should avoid resource contention by using unique data (#9)', async ({ page }) => {
    // Test A
    const bookA = await factory.createBook();
    await page.goto(`/books/${bookA.id}/edit`);
    await page.getByLabel('Title').fill('New Title for Book A');

    // In a parallel run, Test B would operate on its own book
    // const bookB = await factory.createBook(); // in a separate test worker
    // await page.goto(`/books/${bookB.id}/delete`); // would not be locked

    // This test passes because its resource is isolated.
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('h1')).toHaveText('New Title for Book A');
  });
});

