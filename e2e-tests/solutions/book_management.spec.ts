// This file contains the solutions for problems:
// #11 (Ghost in the Machine)
// #12 (Special Character Surprise)
// #17 (Silent Truncation)
// #18 (Case-Sensitive Search)
// #25 (Stale UI State - although this is a systemic problem, its fix is often here)

import { test, expect } from '@playwright/test';
import { TestStateFactory } from '../models/test_state_factory';
import { BookBuilder } from '../models/book_builder';
import { ReviewBuilder } from '../models/review_builder';
import { UserBuilder } from '../models/user_builder';

test.describe('Atomic Book Management Tests', () => {
  let factory: TestStateFactory;

  test.beforeEach(async ({ request }) => {
    factory = new TestStateFactory(request);
  });

test.afterEach(async () => {
    await factory.cleanup();
  });
 
  test('should correctly save a book with a very long title (#17)', async ({ page }) => {
    const longTitle = 'a'.repeat(300);
    const expectedTruncatedTitle = 'a'.repeat(255);
    const bookData = new BookBuilder().withTitle(longTitle).build();
    const book = await factory.createBook(bookData);

    // The test isn't just about creating, but verifying the result.
    // The original test would have passed on creation but failed later.
    expect(book.title).toBe(expectedTruncatedTitle);

    await page.goto(`/books/${book.id}`);
    await expect(page.locator('h1')).toHaveText(expectedTruncatedTitle);
  });

  test('should correctly handle and display a book with special characters (#12)', async ({ page }) => {
    const specialTitle = 'My Book: A vicenda 🐛';
    const bookData = new BookBuilder().withTitle(specialTitle).build();
    const book = await factory.createBook(bookData);

    await page.goto(`/books/${book.id}`);
    await expect(page.locator('h1')).toHaveText(specialTitle);

    // Also verify it doesn't break the main list page
    await page.goto('/books');
    await expect(page.getByRole('heading', { name: specialTitle })).toBeVisible();
  });

  test('should handle case-sensitive searches correctly (#18)', async ({ page }) => {
    const bookData = new BookBuilder().withTitle('Automation Rocks').build();
    await factory.createBook(bookData);

    await page.goto('/');
    await page.getByPlaceholder('Search for a book').fill('automation rocks');
    await page.getByRole('button', { name: 'Search' }).click();

    // This robustly checks that the specific book appears, regardless of others.
    await expect(page.getByRole('heading', { name: 'Automation Rocks' })).toBeVisible();
  });

  test('should delete a book and all its associated reviews (#11)', async ({ page, request }) => {
      // For simple, default entities, using the factory directly is still a clean approach.
      const userData = new UserBuilder()
                      .withName('Review User')
                      .withEmail(`reviewuser@test.com`)
                      .withPassword('password').build();
      const user = await factory.createUser(userData);
      const bookData = new BookBuilder().withTitle("book title").build();
      const book = await factory.createBook(bookData);
      const reviewData = new ReviewBuilder()
                      .withUserId(user.id)
                      .withBookId(book.id)
                      .withRating(5)
                      .withComment('To be deleted').build();
      const review = await factory.createReview(reviewData);

      // Delete the book via API
      await request.delete(`/api/books/${book.id}`);

      // Verify book is gone
      const bookResponse = await request.get(`/api/books/${book.id}`);
      expect(bookResponse.status()).toBe(404);

      // The critical part: verify the associated review is also gone (cascade delete)
      const reviewResponse = await request.get(`/api/reviews/${review.id}`);
      expect(reviewResponse.status()).toBe(404);
  });
});

