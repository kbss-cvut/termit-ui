export interface ResultPage<T> {
  totalCount: number;
  pageContent: T[];
}

export const EMPTY_PAGE: ResultPage<any> = Object.freeze({
  totalCount: 0,
  pageContent: [],
});
