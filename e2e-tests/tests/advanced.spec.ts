import { test, expect, Page } from '@playwright/test';

test.describe('Systemic and Advanced Scenarios', () => {

    const login = async (page : Page, email : string, password : string) => {
        await page.goto('/login');
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password').fill(password);
    };

    test('(#22) should login successfully using a helper', async ({ page, request }) => {
        const email = `helper-user@test.com`;
        await request.post('/api/users', { data: { name: 'Helper User', email, password: 'password' } });
        
        await login(page, email, 'password');
        await expect(page.getByRole('heading', { name: 'Welcome, Helper User' })).toBeVisible();
    });

    for (let i = 0; i < 5; i++) {
        test(`(#10, #20) should allow creating multiple books quickly #${i}`, async ({ request }) => {
            const response = await request.post('/api/books', {
                data: { title: `Rate Limit Test Book ${i}`, author: 'Load Tester' },
            });
            expect(response.ok()).toBeTruthy();
        });
    }

    test('(#19) should verify book creation with an external service', async ({ page, request }) => {
        // This test relies on an external ISBN service
        await page.goto('/add-book');
        await page.getByLabel('Title').fill('A Book with ISBN');
        await page.getByLabel('Author').fill('External Service');
        await page.getByRole('button', { name: 'Create Book' }).click();
        await expect(page.getByText('Book created and ISBN verified!')).toBeVisible();
    });
});

