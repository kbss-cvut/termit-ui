import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../../hoc/withI18n";
import SearchResult from "../../../model/SearchResult";
import { Label, Table } from "reactstrap";
import VocabularyUtils from "../../../util/VocabularyUtils";
import TermResultItem from "./TermResultItem";
import VocabularyResultItem from "./VocabularyResultItem";

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

interface SearchResultsProps extends HasI18n {
  results: SearchResult[];
}

/**
 * Comparator for sorting search results.
 *
 * Sorts items by total score, descending.
 */
function scoreSort(a: SearchResultItem, b: SearchResultItem) {
  return b.totalScore - a.totalScore;
}

export class SearchResults extends React.Component<SearchResultsProps> {
  public render() {
    const i18n = this.props.i18n;
    if (this.props.results.length === 0) {
      return (
        <Label className="italics small text-gray">
          {i18n("main.search.no-results")}
        </Label>
      );
    }
    const rows = this.renderResults();
    return (
      <div>
        <div className="italics small text-gray mb-3">
          {this.props.formatMessage("search.results.countInfo", {
            matches: this.props.results.length,
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
      </div>
    );
  }

  private renderResults() {
    const items = SearchResults.mergeDuplicates(this.props.results);
    return items.map((r) => {
      return (
        <tr key={r.iri} className="search-result-match-row">
          <td className="align-middle">{SearchResults.renderMatch(r)}</td>
        </tr>
      );
    });
  }

  public static mergeDuplicates(results: SearchResult[]) {
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

  private static renderMatch(item: SearchResultItem) {
    return item.hasType(VocabularyUtils.VOCABULARY) ? (
      <VocabularyResultItem result={item} />
    ) : (
      <TermResultItem result={item} />
    );
  }
}

export default injectIntl(withI18n(SearchResults));
