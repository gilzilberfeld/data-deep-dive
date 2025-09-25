// This file contains the solutions for problems:
// #3 (Hardcoded Bestseller)
// #7 (Search Index Lag)
// #15 (Ever-Growing List / Pagination)
// #19 (Unreliable Third-Party Mock)

import { test, expect } from '@playwright/test';
import { TestStateFactory } from './models/test_state_factory';
import { BookBuilder } from './models/book_builder';
import { UserBuilder } from './models/user_builder';

test.describe('Atomic Search and Discovery Tests', () => {
  let factory: TestStateFactory;

  test.beforeEach(async ({ request }) => {
    factory = new TestStateFactory(request);
  });

  test.afterEach(async () => {
    await factory.cleanup();
  });

  test('should find a newly created book in the search results (#7)', async ({ page }) => {
    const bookTitle = `The Singular Quest of ${Date.now()}`;
    const bookData = new BookBuilder().withTitle(bookTitle).withAuthor('John Doe').build();
    await factory.createBook(bookData);

    await page.goto('/');

    // Use polling to handle potential search index lag
    await expect.poll(async () => {
      await page.getByPlaceholder('Search for a book').fill(bookTitle);
      await page.getByRole('button', { name: 'Search' }).click();
      return await page.getByRole('heading', { name: bookTitle }).isVisible();
    }, {
      message: `Book "${bookTitle}" did not appear in search results within the timeout.`,
      timeout: 10000,
    }).toBe(true);
  });

  test('should display a newly created book on the second page of the book list (#15)', async ({ page }) => {
    // Create 11 books to force pagination (assuming 10 per page)
    for (let i = 0; i < 11; i++) {
      const bookData = new BookBuilder().withTitle(`Book ${i}`).build();
      await factory.createBook(bookData);
    }
    const newTargetBook = new BookBuilder().withTitle('The Twelfth Book').build();
    const targetBook = await factory.createBook(newTargetBook);

    await page.goto('/books');
    await page.getByText('Next').click();

    await expect(page.getByRole('heading', { name: targetBook.title })).toBeVisible();
  });

  test('should be able to find and review a specific book, regardless of other data (#3)', async ({ page }) => {
    // This test creates its own data, it does not rely on "Pride and Prejudice" existing.
    const userData = new UserBuilder()
              .withName('Test User')
              .withEmail(`testuser@test.com`)
              .withPassword('password').build();
    const user = await factory.createUser(userData);
    const bookData = new BookBuilder().withTitle('A Tale of Two Automations').build();
    const book = await factory.createBook(bookData);

    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill('password'); // Assume default password
    await page.getByRole('button', { name: 'Log In' }).click();

    await page.goto(`/books/${book.id}`);
    await page.getByText('Add a review').click();
    await page.getByLabel('Rating').selectOption('5');
    await page.getByLabel('Comment').fill('A truly atomic experience!');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('A truly atomic experience!')).toBeVisible();
  });

  test('should handle unreliable third party services deterministically (#19)', async ({ page }) => {
    const bookData = new BookBuilder().withTitle('Service Reliability in Testing').build();
    const book = await factory.createBook(bookData);

    // Solution: Instead of one flaky test, create two deterministic tests.
    // Test 1: Mock the service to always succeed.
    await page.route('**/api/isbn-validation/**', route => route.fulfill({ status: 200, json: { valid: true } }));
      await page.goto(`/books/${book.id}/validate`);
      await expect(page.getByText('ISBN is valid!')).toBeVisible();

      // Test 2: Mock the service to always fail.
      await page.route('**/api/isbn-validation/**', route => route.fulfill({ status: 503, json: { error: 'Service Unavailable' } }));
      await page.goto(`/books/${book.id}/validate`);
      await expect(page.getByText('Could not validate ISBN.')).toBeVisible();
  });
});

