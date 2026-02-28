import React from "react";
import { Card, CardBody } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import VocabularyUtils from "../../util/VocabularyUtils";
import SearchResult from "../../model/search/SearchResult";
import { SearchResultItem } from "./label/SearchResults";
import TermResultItem from "./label/TermResultItem";
import VocabularyResultItem from "./label/VocabularyResultItem";
import SimplePagination from "../dashboard/widget/lastcommented/SimplePagination";

export const RESULT_PAGE_SIZE = 20;

interface AdvancedSearchResultsProps {
  results: SearchResult[] | null;
  finalResults: SearchResultItem[] | null;
  page: number;
  onPageChange: (page: number) => void;
}

const AdvancedSearchResults: React.FC<AdvancedSearchResultsProps> = ({
  results,
  finalResults,
  page,
  onPageChange,
}) => {
  const { i18n, formatMessage } = useI18n();

  const renderContent = () => {
    if (results === null) {
      return (
        <div className="italics small text-gray">{i18n("search.help")}</div>
      );
    }
    if (!finalResults || finalResults.length === 0) {
      return (
        <div className="italics small text-gray">
          {i18n("search.no-results")}
        </div>
      );
    }

    const rows = finalResults.map((r) => (
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
      <>
        <div className="italics small text-gray mb-3">
          {formatMessage("search.results.countInfo", {
            matches: results.length,
            assets: rows.length,
          })}
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
        {results !== null && (page > 0 || results.length > 0) && (
          <SimplePagination
            page={page}
            setPage={onPageChange}
            pageSize={RESULT_PAGE_SIZE}
            itemCount={results.length}
            className="mt-3"
          />
        )}
      </CardBody>
    </Card>
  );
};

export default AdvancedSearchResults;
