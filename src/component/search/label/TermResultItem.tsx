import * as React from "react";
import AssetLink from "../../misc/AssetLink";
import Term from "../../../model/Term";
import { useSelector } from "react-redux";
import { SearchResultItem } from "./SearchUtil";
import AssetLabel from "../../misc/AssetLabel";
import AssetFactory from "../../../util/AssetFactory";
import TermItState from "../../../model/TermItState";
import FTSMatch from "./FTSMatch";
import TermBadge from "../../badge/TermBadge";
import { getTermPath } from "../../term/TermLink";
import TermStateBadge from "../../term/state/TermStateBadge";
import { useI18n } from "../../hook/useI18n";
import { getResultDescription } from "./VocabularyResultItem";
import MatchInfo from "./MatchInfo";
import { getLocalized } from "../../../model/MultilingualString";

interface TermResultItemProps {
  result: SearchResultItem;
  language?: string;
}

const TermResultItem: React.FC<TermResultItemProps> = ({
  result,
  language,
}) => {
  const { i18n } = useI18n();
  const user = useSelector((state: TermItState) => state.user);
  const label = getLocalized(result.label, language);

  const t = {
    iri: result.iri,
    label: (
      <>
        <span className="search-result-title">{label}</span>
        &nbsp;
        {result.vocabulary ? (
          <>
            {i18n("search.results.vocabulary.from")}&nbsp;
            <AssetLabel iri={result.vocabulary!.iri} />
          </>
        ) : (
          <></>
        )}
      </>
    ),
  };
  const fields = ["definition", "scopeNote"];

  const description = getResultDescription(result, fields, language);

  const asset = AssetFactory.createAsset(result);
  return (
    <>
      <TermBadge className="search-result-badge" />
      <TermStateBadge state={result.state} />
      <AssetLink
        asset={t}
        path={getTermPath(asset as Term, user)}
        tooltip={i18n("asset.link.tooltip")}
      />
      <div className="search-result-snippet">
        <FTSMatch match={description} />
      </div>
      <MatchInfo result={result} />
    </>
  );
};

export default TermResultItem;
