import React from "react";
import { FacetedSearchResult } from "../../../model/search/FacetedSearchResult";
import FacetedSearchResultItem from "./FacetedSearchResultItem";
import { Table } from "reactstrap";

const FacetedSearchResults: React.FC<{ results: FacetedSearchResult[] }> = ({
  results,
}) => {
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
