import { test, expect } from '@playwright/test';

test.describe('Admin, Permissions, and Configuration', () => {

    test('(#6, #23) should show a new user on the admin dashboard', async ({ page, request }) => {
        const name = `New User`;
        await request.post('/api/users', { data: { name, email: `${name}@test.com`, password: 'password' } });
        await expect(page.getByText(name)).toBeVisible();
    });

    test('(#8) should see the new button from the A/B test', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'Submit Review v2' })).toBeVisible();
    });

    test('(#13) should prevent standard users from accessing the admin page', async ({ page, request }) => {
        const email = `std-user@test.com`;
        await request.post('/api/users', { data: { name: 'Std User', email, password: 'password' } });
        await page.goto('/login');
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password').fill('password');
        await page.getByRole('button', { name: 'Log In' }).click();

        await page.goto('/admin');
        await expect(page.getByText('Forbidden')).toBeVisible();
    });

test('(#14) should reject a review when the profanity filter is enabled', async({ page, request }) => {
        await request.post('/api/settings/profanity-filter', { data: { enabled: true }});
        
        const userResponse = await request.post('/api/users', {
            data: { name: 'Profanity Tester', email: `profanity-${Date.now()}@test.com`, password: 'password' }
        });
        await userResponse.json();

        const bookResponse = await request.post('/api/books', {
            data: { title: 'A Book to Review', author: 'Some Author' }
        });
        const book = await bookResponse.json();

        await page.goto(`/books/${book.id}`);
        await page.getByLabel('Rating').selectOption('1');
        await page.getByLabel('Comment').fill('This book is absolute garbage.');
        await page.getByRole('button', { name: 'Add Review' }).click();

        await expect(page.getByText('Your review contains inappropriate language.')).toBeVisible();
    });
});
