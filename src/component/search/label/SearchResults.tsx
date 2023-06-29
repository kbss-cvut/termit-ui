import * as React from "react";
import SearchResult from "../../../model/search/SearchResult";
import { Card, CardBody, Label, Table } from "reactstrap";
import { Link } from "react-router-dom";
import VocabularyUtils from "../../../util/VocabularyUtils";
import TermResultItem from "./TermResultItem";
import VocabularyResultItem from "./VocabularyResultItem";
import { useI18n } from "../../hook/useI18n";
import Routes from "../../../util/Routes";

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

export function mergeDuplicates(results: SearchResult[]) {
  const map = new Map<string, SearchResultItem>();
  results.forEach((r) => {
    if (!map.has(r.iri)) {
      map.set(r.iri, new SearchResultItem(r));
    } else {
      const existing = map.get(r.iri)!;
      existing.totalScore += r.score ? r.score : 0;
      // If the match field is the same there is no need to update other attributes, as the match is already
      // marked in the snippet of the existing item
      if (existing.snippetField !== r.snippetField) {
        if (r.snippetField === "label") {
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

const SearchResults: React.FC<{
  results: SearchResult[] | null;
  withFacetedSearchLink?: boolean;
}> = ({ results, withFacetedSearchLink = false }) => {
  const { i18n, formatMessage } = useI18n();
  if (results === null) {
    return null;
  }
  if (results.length === 0) {
    return (
      <Card className="mb-3">
        <CardBody>
          <Label className="italics small text-gray">
            {i18n("search.no-results")}
            {withFacetedSearchLink && (
              <>
                &nbsp;
                {formatMessage("search.results.facetedLink", {
                  link: (
                    <Link
                      id="search-results-faceted-link"
                      to={Routes.facetedSearch.path}
                      className="font-weight-bold"
                    >
                      {i18n("search.tab.facets").toLowerCase()}
                    </Link>
                  ),
                })}
              </>
            )}
          </Label>
        </CardBody>
      </Card>
    );
  }
  const rows = mergeDuplicates(results).map((r) => (
    <tr key={r.iri} className="search-result-match-row">
      <td className="align-middle">
        {r.hasType(VocabularyUtils.VOCABULARY) ? (
          <VocabularyResultItem result={r} />
        ) : (
          <TermResultItem result={r} />
        )}
      </td>
    </tr>
  ));

  return (
    <Card className="mb-3">
      <CardBody>
        <div className="italics small text-gray mb-3">
          {formatMessage("search.results.countInfo", {
            matches: results.length,
            assets: rows.length,
          })}
        </div>
        <Table
          responsive={true}
          bordered={false}
          borderless={true}
          className="search-results"
        >
          <tbody>{rows}</tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default SearchResults;
