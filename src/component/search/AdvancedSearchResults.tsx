import React from "react";
import { Card, CardBody } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import VocabularyUtils from "../../util/VocabularyUtils";
import SearchResult from "../../model/search/SearchResult";
import { SearchResultItem } from "./label/SearchUtil";
import TermResultItem from "./label/TermResultItem";
import VocabularyResultItem from "./label/VocabularyResultItem";
import SimplePagination from "../dashboard/widget/lastcommented/SimplePagination";
import { getShortLocale } from "../../util/IntlUtil";
import { ResultPage } from "../../model/ResultPage";

interface AdvancedSearchResultsProps {
  results: ResultPage<SearchResult> | null;
  finalResults: SearchResultItem[] | null;
  language?: string;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  noFts: boolean;
}

const AdvancedSearchResults: React.FC<AdvancedSearchResultsProps> = ({
  results,
  finalResults,
  page,
  pageSize,
  onPageChange,
  language,
  noFts,
}) => {
  const { i18n, formatMessage, locale } = useI18n();

  const renderContent = () => {
    if (results === null) {
      return (
        <div className="italics small text-gray">{i18n("search.help")}</div>
      );
    }
    if (!finalResults || finalResults.length === 0) {
      return (
        <div className="italics small text-gray">
          {i18n(page > 0 ? "search.noMoreResults" : "search.no-results")}
        </div>
      );
    }
    const actualLanguage = language || getShortLocale(locale);

    const rows = finalResults.map((r) => (
      <tr key={r.iri} className="search-result-match-row">
        <td className="align-middle">
          {r.hasType(VocabularyUtils.VOCABULARY) ? (
            <VocabularyResultItem result={r} language={actualLanguage} />
          ) : (
            <TermResultItem result={r} language={actualLanguage} />
          )}
        </td>
      </tr>
    ));

    return (
      <>
        <div className="italics small text-gray mb-3">
          {formatMessage(
            noFts
              ? "search.results.countInfo.noFts"
              : "search.results.countInfo",
            {
              count: results.totalCount,
            }
          )}
        </div>
        <table className="table-borderless search-results table">
          <tbody>{rows}</tbody>
        </table>
      </>
    );
  };

  return (
    <Card>
      <CardBody>
        {renderContent()}
        {results !== null && (page > 0 || results.totalCount > 0) && (
          <SimplePagination
            page={page}
            setPage={onPageChange}
            pageSize={pageSize}
            itemCount={results.pageContent.length}
            totalItemCount={results.totalCount}
            className="mt-3"
          />
        )}
      </CardBody>
    </Card>
  );
};

export default AdvancedSearchResults;
