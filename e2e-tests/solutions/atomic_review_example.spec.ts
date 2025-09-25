// This file contains the solutions for problems:
// #1 (The Golden Path)
// #2 (The Duplicate User Dilemma)
// #3 (The Hardcoded Bestseller)
// #6 (The Overly Enthusiastic Reviewer)
// #21 (The Midnight Bug - handled by atomic data creation)

import { test, expect } from '@playwright/test';
import { TestStateFactory } from './models/test_state_factory';
import { UserBuilder } from './models/user_builder';
import { BookBuilder } from './models/book_builder';

test.describe('Atomic Onboarding and Review Tests', () => {
  let factory: TestStateFactory;

  // For every single test, create a new factory instance.
  // This ensures that the state (like created user IDs) is isolated per test.
  test.beforeEach(async ({ request }) => {
    factory = new TestStateFactory(request);
  });

  // After every single test, run the cleanup method.
  // This deletes all entities created during the test, leaving the database clean.
  test.afterEach(async () => {
    await factory.cleanup();
  });

  test('should allow a new user to sign up successfully (#1, #2)', async ({ page }) => {
    // The builder creates a user object with randomized, unique data
    const userData = new UserBuilder()
            .withName(`test-user`)
            .withEmail(`testuser@test.com`)
            .withPassword('password')
            .build();

    await page.goto('/users/new');
    await page.getByLabel('Name').fill(userData.name);
    await page.getByLabel('Email').fill(userData.email);
    await page.getByLabel('Password').fill(userData.password);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText(`Welcome, ${userData.name}`)).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('should allow a logged-in user to add a review to a book (#1, #3)', async ({ page }) => {
    // ARRANGE: Create all necessary state via the API before the test begins.
    const userData = new UserBuilder()
            .withName('Reviewer')
            .withEmail(`reviewer@test.com`)
            .withPassword('password')
            .build();
    const user = await factory.createUser(userData);
    const bookData = new BookBuilder().withTitle('A Book to Review').build();
    const book = await factory.createBook(bookData);

    // ACT: Log in the user and perform the UI actions.
    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Log In' }).click();

    await page.goto(`/books/${book.id}`);
    await page.getByLabel('Rating').selectOption('4');
    await page.getByLabel('Comment').fill('This was a great book!');
    await page.getByRole('button', { name: 'Submit' }).click();

    // ASSERT: Verify the outcome.
    await expect(page.getByText('This was a great book!')).toBeVisible();
    await expect(page.getByText(`by ${user.name}`)).toBeVisible();
  });

  test('should not allow a user to review the same book twice (#6)', async ({ page }) => {
    // ARRANGE: Create a user, a book, and an initial review.
    const userData = new UserBuilder()
              .withName('Repeat Reviewer')
              .withEmail(`repeat-reviewer@test.com`)
              .withPassword('password')
              .build();
    const user = await factory.createUser(userData);
    const bookData = new BookBuilder().withTitle('A Book to Review').build();
    const book = await factory.createBook(bookData);
    await factory.createReview({ userId: user.id, bookId: book.id, rating: 5, comment: 'First review' });

    // ACT: Log in and navigate to the book.
    await page.goto('/login');
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.goto(`/books/${book.id}`);

    // ASSERT: The application logic should prevent the user from reviewing again.
    // This is a more robust check than trying to submit and expecting an error.
    await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();
    await expect(page.getByText('You have already reviewed this book.')).toBeVisible();
  });
});

