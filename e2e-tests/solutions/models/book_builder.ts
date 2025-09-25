export interface BookData {
  title: string;
  author: string;
}

export class BookBuilder {
  private title = 'A Default Book Title';
  private author = 'Default Author';

  withTitle(title: string) {
    this.title = title;
    return this;
  }

  withAuthor(author: string) {
    this.author = author;
    return this;
  }

  build() : BookData {
    return {
      title: this.title,
      author: this.author,
    };
  }
}