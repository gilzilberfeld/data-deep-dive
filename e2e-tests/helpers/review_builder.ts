export interface ReviewData {
    rating: number;
    comment: string;
    userId: string;
    bookId: string;
}


export class ReviewBuilder {
    private rating: number;
    private comment: string;
    private userId: string;
    private bookId: string;

    constructor() {
        this.rating = 5;
        this.comment = `A default review comment written at ${new Date().toISOString()}`;
        this.userId = '';
        this.bookId = '';
    }
    
    withUserId(id: any) {
        this.userId = id;
        return this;
    }
    withBookId(id: any) {
        this.bookId = id;
        return this;
    }

    withRating(rating: number): this {
        this.rating = rating;
        return this;
    }

    withComment(comment: string): this {
        this.comment = comment;
        return this;
    }

    build() : ReviewData {
        return      {
            rating: this.rating,
            comment: this.comment,
            userId: this.userId,
            bookId: this.bookId,
        };
    }
}