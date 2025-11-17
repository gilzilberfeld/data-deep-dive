import { APIRequestContext } from '@playwright/test';
import { UserBuilder, UserData } from './user_builder';
import { BookBuilder, BookData } from './book_builder';
import { ReviewBuilder, ReviewData } from './review_builder';

export class TestStateFactory {
    private request: APIRequestContext;
    private createdUsers: any[] = [];
    private createdBooks: any[] = [];
    private createdReviews: any[] = [];
    private configWasDirtied: boolean = false;

    constructor(request: APIRequestContext) {
        this.request = request;
    }

    async createUser(userData: UserData) {
        const response = await this.request.post('/api/users', { data: userData });
        const user = await response.json();
        this.createdUsers.push(user);
        return user;
    }

    async createBook(bookData : BookData) {
        const response = await this.request.post('/api/books', { data: bookData });
        const book = await response.json();
        this.createdBooks.push(book);
        return book;
    }

    async createReview(reviewData : ReviewData) {
        const response = await this.request.post(`/api/reviews`, { data: reviewData });
        const review = await response.json();
        this.createdReviews.push(review);
        return review;
    }

    markConfigDirty() {
        this.configWasDirtied = true;
    }

    async cleanup() {
        // Cleanup in reverse order of creation to respect foreign key constraints
        await Promise.all(this.createdReviews.map(review => this.request.delete(`/api/reviews/${review.id}`)));
        await Promise.all(this.createdBooks.map(book => this.request.delete(`/api/books/${book.id}`)));
        await Promise.all(this.createdUsers.map(user => this.request.delete(`/api/users/${user.id}`)));
        
        if (this.configWasDirtied) {
            // Reset any global config that was changed, e.g., the profanity filter
            await this.request.post('/api/config/profanity-filter', { data: { enabled: false } });
        }
    }
}

