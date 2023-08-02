import React from "react";
import { FacetedSearchResult } from "../../../model/search/FacetedSearchResult";
import { useI18n } from "../../hook/useI18n";
import TermBadge from "../../badge/TermBadge";
import AssetLink from "../../misc/AssetLink";
import { getTermPath } from "../../term/TermLink";
import Term from "../../../model/Term";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import AssetLabel from "../../misc/AssetLabel";
import { getLocalized } from "../../../model/MultilingualString";
import Utils from "../../../util/Utils";
import OutgoingLink from "../../misc/OutgoingLink";
import TermStateBadge from "../../term/TermStateBadge";

const FacetedSearchResultItem: React.FC<{ item: FacetedSearchResult }> = ({
  item,
}) => {
  const { i18n, locale } = useI18n();
  const { user, types } = useSelector((state: TermItState) => state);

  const t = {
    iri: item.iri,
    label: (
      <>
        <span className="search-result-title">
          {getLocalized(item.label, locale)}
          {Utils.sanitizeArray(item.notations).length > 0
            ? ` (${Utils.sanitizeArray(item.notations).join(",")})`
            : null}
        </span>
        &nbsp;
        <>
          {i18n("search.results.vocabulary.from")}&nbsp;
          <AssetLabel iri={item.vocabulary!.iri} />
        </>
      </>
    ),
  };
  const def = getLocalized(item.definition, locale);

  return (
    <tr className="search-result-match-row">
      <td>
        <TermBadge className="search-result-badge" />
        <TermStateBadge state={item.state} />
        <AssetLink
          asset={t}
          path={getTermPath(item as Term, user)}
          tooltip={i18n("asset.link.tooltip")}
        />
        <br />
        {def && <div className="faceted-term-definition">{def}</div>}
        <ul className="mb-0">
          {Object.keys(types)
            .filter((t) => Utils.sanitizeArray(item.types).indexOf(t) !== -1)
            .map((t) => (
              <li key={t}>
                <OutgoingLink
                  iri={t}
                  label={getLocalized(types[t].label, locale)}
                />
              </li>
            ))}
        </ul>
      </td>
    </tr>
  );
};

export default FacetedSearchResultItem;
