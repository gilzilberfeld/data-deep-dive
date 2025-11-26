export interface BookData {
  title: string;
  author: string;
  createdAt?: string;
}

export class BookBuilder {
  
  private title = 'A Default Book Title';
  private author = 'Default Author';
  private createdAt = '';

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withAuthor(author: string) {
    this.author = author;
    return this;
  }


  withCreatedAt(specificDate: string) {
    this.createdAt = specificDate;
    return this;
  }

  build() : BookData {
    return {
      title: this.title,
      author: this.author,
      createdAt: this.createdAt,
    };
  }
}