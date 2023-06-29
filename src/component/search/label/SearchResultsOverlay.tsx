import * as React from "react";
import SearchResult from "../../../model/search/SearchResult";
import { Popover, PopoverBody } from "reactstrap";
import TermBadge from "../../badge/TermBadge";
import { mergeDuplicates } from "./SearchResults";
import AssetLinkFactory from "../../factory/AssetLinkFactory";
import AssetFactory from "../../../util/AssetFactory";
import AssetLabel from "../../misc/AssetLabel";
import VocabularyUtils from "../../../util/VocabularyUtils";
import VocabularyBadge from "../../badge/VocabularyBadge";
import { useI18n } from "../../hook/useI18n";

interface SearchResultsOverlayProps {
  show: boolean;
  searchResults: SearchResult[];
  targetId: string;
  onClose: () => void;
  onOpenSearch: () => void;
  onOpenFacetedSearch: () => void;
}

export const MAX_RENDERED_RESULTS = 10;

const SearchResultsOverlay: React.FC<SearchResultsOverlayProps> = (
  props: SearchResultsOverlayProps
) => {
  const { i18n, formatMessage } = useI18n();
  const items = [];
  if (props.searchResults.length === 0) {
    items.push(
      <li
        id="search-results-link"
        key="full-info"
        className="btn-link search-result-no-results"
        onClick={props.onOpenFacetedSearch}
        title={i18n("main.search.tooltip")}
      >
        {i18n("main.search.no-results")}
      </li>
    );
  } else {
    const mergedResults = mergeDuplicates(props.searchResults);
    let i = 0;
    for (i; i < mergedResults.length && i < MAX_RENDERED_RESULTS; i++) {
      const item = mergedResults[i];
      const view = (
        <li
          key={item.iri}
          id={`fts-overlay-item-${item.iri}`}
          className="search-result-link border-bottom"
        >
          {item.hasType(VocabularyUtils.VOCABULARY) ? (
            <VocabularyBadge />
          ) : (
            <TermBadge />
          )}
          &nbsp;
          <span onClick={props.onClose}>
            {AssetLinkFactory.createAssetLink(AssetFactory.createAsset(item))}
            <br />
            {item.vocabulary ? (
              <span className="small text-muted" style={{ marginLeft: "1em" }}>
                {i18n("search.results.vocabulary.from")}{" "}
                <AssetLabel iri={item.vocabulary.iri} />
              </span>
            ) : (
              <span />
            )}
          </span>
        </li>
      );

      items.push(view);
    }
    if (i < mergedResults.length) {
      items.push(
        <li
          id="search-results-link"
          key="full-info"
          className="btn-link search-result-info"
          onClick={props.onOpenSearch}
        >
          {formatMessage("main.search.count-info-and-link", {
            displayed: MAX_RENDERED_RESULTS,
            count: mergedResults.length,
          })}
        </li>
      );
    }
  }

  return (
    <Popover
      isOpen={props.show}
      toggle={props.onClose}
      target={props.targetId}
      placement="bottom-start"
      hideArrow={true}
      className="search-results-overlay"
    >
      <PopoverBody>
        <ul>{items}</ul>
      </PopoverBody>
    </Popover>
  );
};

export default SearchResultsOverlay;
