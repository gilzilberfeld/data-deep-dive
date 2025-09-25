import { test, expect } from '@playwright/test';
import { TestStateFactory } from './models/test_state_factory';
import { BookBuilder } from './models/book_builder';

test.describe('Atomic Review Management', () => {
    let factory: TestStateFactory;
    const createdIds = {
        users: [],
        books: []
    };

    test.beforeEach(async ({ request }) => {
        factory = new TestStateFactory(request);
    });

    test.afterEach(async ({ request }) => {
        for(const bookId of createdIds.books.reverse()) await request.delete(`/api/books/${bookId}`);
        for(const userId of createdIds.users.reverse()) await request.delete(`/api/users/${userId}`);
        createdIds.books = [];
        createdIds.users = [];
    });

    test('should allow a user to add a review to a book', async ({ page }) => {
        const { user, book } = await factory.createUserWithBook();
        createdIds.users.push(user.id);
        createdIds.books.push(book.id);

        await page.goto(`/books/${book.id}`);
        await page.getByLabel('Rating').selectOption('5');
        await page.getByLabel('Comment').fill('A fantastic read!');
        await page.getByRole('button', { name: 'Add Review' }).click();

        await expect(page.getByText('A fantastic read!')).toBeVisible();
    });
    
    test('should prevent a user from reviewing the same book twice', async ({ page, request }) => {
        const { user, book } = await factory.createUserWithBook(undefined, new BookBuilder().withTitle('Single Review Book'));
        createdIds.users.push(user.id);
        createdIds.books.push(book.id);

        await request.post('/api/reviews', { data: { bookId: book.id, userId: user.id, rating: 5, comment: 'First review' } });

        await page.goto(`/books/${book.id}`);
        await page.getByLabel('Rating').selectOption('3');
        await page.getByLabel('Comment').fill('My second review');
        await page.getByRole('button', { name: 'Add Review' }).click();

        await expect(page.getByText("You have already reviewed this book.")).toBeVisible();
    });
});
