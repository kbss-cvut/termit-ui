import React from "react";
import { FacetedSearchResult } from "../../../model/search/FacetedSearchResult";
import FacetedSearchResultItem from "./FacetedSearchResultItem";
import { Label, Table } from "reactstrap";
import { useI18n } from "../../hook/useI18n";

const FacetedSearchResults: React.FC<{ results: FacetedSearchResult[] }> = ({
  results,
}) => {
  const { i18n } = useI18n();
  if (results.length === 0) {
    return (
      <Label className="italics small text-gray">
        {i18n("search.faceted.no-results")}
      </Label>
    );
  }
  return (
    <Table
      id="faceted-search-results"
      responsive={true}
      bordered={false}
      borderless={true}
      className="search-results"
    >
      <tbody>
        {results.map((r) => (
          <FacetedSearchResultItem key={r.iri} item={r} />
        ))}
      </tbody>
    </Table>
  );
};

export default FacetedSearchResults;
