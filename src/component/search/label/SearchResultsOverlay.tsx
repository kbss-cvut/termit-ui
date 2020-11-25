import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import SearchResult from "../../../model/SearchResult";
import {Popover, PopoverBody} from "reactstrap";
import TermBadge from "../../badge/TermBadge";
import {SearchResults} from "./SearchResults";
import AssetLinkFactory from "../../factory/AssetLinkFactory";
import AssetFactory from "../../../util/AssetFactory";
import AssetLabel from "../../misc/AssetLabel";
import VocabularyUtils from "../../../util/VocabularyUtils";
import VocabularyBadge from "../../badge/VocabularyBadge";

interface SearchResultsOverlayProps extends HasI18n {
    show: boolean;
    searchResults: SearchResult[];
    targetId: string;
    onClose: () => void;
    onOpenSearch: () => void;
}

export const MAX_RENDERED_RESULTS = 10;

export const SearchResultsOverlay: React.FC<SearchResultsOverlayProps> = (props: SearchResultsOverlayProps) => {
    const items = [];
    if (props.searchResults.length === 0) {
        items.push(<li id="search-results-link" key="full-info" className="btn-link search-result-no-results"
                       onClick={props.onOpenSearch}
                       title={props.i18n("main.search.tooltip")}>
            {props.i18n("main.search.no-results")}
        </li>);
    } else {
        const mergedResults = SearchResults.mergeDuplicates(props.searchResults);
        let i = 0;
        for (i; i < mergedResults.length && i < MAX_RENDERED_RESULTS; i++) {
            const item = mergedResults[i];
            const view = <li key={item.iri} id={`fts-overlay-item-${item.iri}`}
                             className="search-result-link border-bottom">
                {item.hasType(VocabularyUtils.VOCABULARY) ? <VocabularyBadge/> : <TermBadge/>}&nbsp;
                <span onClick={props.onClose}>{AssetLinkFactory.createAssetLink(AssetFactory.createAsset(item))}<br/>
                    {item.vocabulary ?
                        <span className="small text-muted"
                              style={{marginLeft: "1em"}}>{props.i18n("search.results.vocabulary.from")} <AssetLabel
                            iri={item.vocabulary.iri}/></span> :
                        <span/>}
                </span>
            </li>;

            items.push(view);
        }
        if (i < mergedResults.length) {
            items.push(<li id="search-results-link" key="full-info" className="btn-link search-result-info"
                           onClick={props.onOpenSearch}>
                {props.formatMessage("main.search.count-info-and-link", {
                    displayed: MAX_RENDERED_RESULTS,
                    count: mergedResults.length
                })}
            </li>);
        }
    }

    return <Popover isOpen={props.show} toggle={props.onClose} target={props.targetId} placement="bottom-start"
                    hideArrow={true} className="search-results-overlay">
        <PopoverBody>
            <ul>
                {items}
            </ul>
        </PopoverBody>
    </Popover>;
};

export default injectIntl(withI18n(SearchResultsOverlay));
