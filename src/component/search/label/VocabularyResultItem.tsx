import * as React from "react";
import { SearchResultItem } from "./SearchResults";
import FTSMatch from "./FTSMatch";
import Vocabulary from "../../../model/Vocabulary";
import VocabularyLink from "../../vocabulary/VocabularyLink";
import AssetFactory from "../../../util/AssetFactory";
import VocabularyBadge from "../../badge/VocabularyBadge";

interface VocabularyResultItemProps {
  result: SearchResultItem;
}

export function getSnippetFieldIndex(
  result: SearchResultItem,
  fieldName: string
) {
  return result.snippetFields.indexOf(fieldName);
}

export function getResultDescription(
  result: SearchResultItem,
  fieldNames: string[]
) {
  let snippetFieldIndex = -1;
  for (let i = 0; i < fieldNames.length; i++) {
    snippetFieldIndex = getSnippetFieldIndex(result, fieldNames[i]);
    if (snippetFieldIndex >= 0) {
      break;
    }
  }
  let text;
  if (snippetFieldIndex >= 0) {
    text = result.snippets[snippetFieldIndex];
  } else {
    text = result.description;
  }

  if (text && text!.length > 200) {
    text = text!.substring(0, 200) + " ...";
  }
  return text || "";
}

const VocabularyResultItem: React.FC<VocabularyResultItemProps> = ({
  result,
}) => {
  const description = getResultDescription(result, ["description"]);

  return (
    <>
      <VocabularyBadge className="search-result-badge" />
      <span className="search-result-title">
        <VocabularyLink
          vocabulary={AssetFactory.createAsset(result) as Vocabulary}
        />
      </span>
      <br />
      <span className="search-result-snippet">
        <FTSMatch match={description} />
      </span>
    </>
  );
};

export default VocabularyResultItem;
