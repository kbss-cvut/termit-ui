import SearchResult from "../../../model/search/SearchResult";

export class SearchResultItem extends SearchResult {
  public totalScore: number;
  public snippets: string[];
  public snippetFields: string[];

  constructor(data: SearchResult) {
    super(data);
    this.totalScore = data.score ? data.score : 0;
    this.snippets = [data.snippetText];
    this.snippetFields = [data.snippetField];
  }
}

/**
 * Comparator for sorting search results.
 *
 * Sorts items by total score, descending.
 */
function scoreSort(a: SearchResultItem, b: SearchResultItem) {
  return b.totalScore - a.totalScore;
}

export function mergeDuplicates(
  results: SearchResult[],
  resultFilter: (r: SearchResult) => boolean = () => true
) {
  const map = new Map<string, SearchResultItem>();
  results.forEach((r) => {
    if (!resultFilter(r)) {
      return;
    }
    if (!map.has(r.iri)) {
      map.set(r.iri, new SearchResultItem(r));
    } else {
      const existing = map.get(r.iri)!;
      existing.totalScore += r.score ? r.score : 0;
      // If the match field is the same there is no need to update other attributes, as the match is already
      // marked in the snippet of the existing item
      if (existing.snippetField !== r.snippetField) {
        if (r.snippetField === "prefLabel") {
          // Render label match first
          existing.snippets.unshift(r.snippetText);
          existing.snippetFields.unshift(r.snippetField);
        } else {
          existing.snippets.push(r.snippetText);
          existing.snippetFields.push(r.snippetField);
        }
      }
    }
  });
  const arr = Array.from(map.values());
  arr.sort(scoreSort);
  return arr;
}
