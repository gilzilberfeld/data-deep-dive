/*
 * WELCOME! This file is a simple example to help you understand the test code.
 * The tests for the workshop are written in Playwright, but you don't need to be an expert.
 * The style is simple and should be easy to read.
*/

import { test, expect } from '@playwright/test';
import { ReviewData } from '../models/review_builder';

test.describe('Simple Example Suite', () => {

  test('should navigate to the homepage and see the title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Software Quality Books' })).toBeVisible();
  });

  test('should be able to fill a form field', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await expect(page.getByLabel('Email')).toHaveValue('user@example.com');
    await page.getByRole('button', { name: 'Log In' }).click();
  });

  test('api calling using playwright', async ({ request }) => {
    const reviewData : ReviewData = {
      rating: 1,
      comment: 'Great book!',
      userId: 'myId',
      bookId: 'bookId'
    }
      const response = await request.post(`/api/reviews`, { data: reviewData });
      const review = await response.json();
      
       
  })
});