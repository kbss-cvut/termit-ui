import React from "react";
import SearchResult from "../../../model/search/SearchResult";
import { useI18n } from "../../hook/useI18n";
import FTSMatch from "./FTSMatch";

/**
 * If the match is in one of these, it is not rendered by the result row by default
 */
const HIDDEN_FIELDS = ["altLabel", "hiddenLabel"];

const FIELD_NAME_MAPPING: Record<string, string> = {
  prefLabel: "asset.label",
  altLabel: "term.metadata.altLabels.label",
  hiddenLabel: "term.metadata.hiddenLabels.label",
  title: "asset.label",
  scopeNote: "term.metadata.comment",
  definition: "term.metadata.definition",
  description: "description",
};

const MatchInfo: React.FC<{ result: SearchResult }> = ({ result }) => {
  const { i18n } = useI18n();
  const fieldTranslationKey = FIELD_NAME_MAPPING[result.snippetField];

  // Do not render anything if the field is not recognized
  if (!result.snippetField || !fieldTranslationKey) {
    return null;
  }

  return (
    <span className="italics">
      {i18n("search.results.field")} <b>{i18n(fieldTranslationKey)}</b>
      {HIDDEN_FIELDS.includes(result.snippetField) ? (
        <>
          &nbsp;(
          <FTSMatch match={result.snippetText} />)
        </>
      ) : null}
    </span>
  );
};

export default MatchInfo;
