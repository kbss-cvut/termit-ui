import { InfiniteData } from "@tanstack/react-query";
import { ResultPage } from "../../model/ResultPage";

/**
 * Moves the item at fromIndex to toIndex while preserving the size of each page
 */
export function moveInPages<T>(
  data: InfiniteData<ResultPage<T>>,
  fromIndex: number,
  toIndex: number
): InfiniteData<ResultPage<T>> {
  const flatData = data.pages.flatMap((page) => page.pageContent);
  const [moved] = flatData.splice(fromIndex, 1);
  flatData.splice(toIndex, 0, moved);
  let offset = 0;
  return {
    ...data,
    pages: data.pages.map((page) => {
      const pageContent = flatData.slice(
        offset,
        offset + page.pageContent.length
      );
      offset += page.pageContent.length;
      return { ...page, pageContent };
    }),
  };
}
