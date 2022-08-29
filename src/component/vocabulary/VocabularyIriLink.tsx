import * as React from "react";
import VocabularyUtils from "../../util/VocabularyUtils";
import { Routing } from "../../util/Routing";
import Routes from "../../util/Routes";
import AssetIriLink from "../misc/AssetIriLink";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { useI18n } from "../hook/useI18n";
import { isLoggedIn } from "../../util/Authorization";

interface VocabularyIriLinkProps {
  iri: string;
  id?: string;
}

/**
 * Link to a Vocabulary detail for situation when Vocabulary label is not available and only IRI is known.
 *
 * The link will fetch the corresponding label and display it.
 */
export const VocabularyIriLink: React.FC<VocabularyIriLinkProps> = (
  props: VocabularyIriLinkProps
) => {
  const { i18n } = useI18n();
  const user = useSelector((state: TermItState) => state.user);
  const iri = VocabularyUtils.create(props.iri);
  const path = Routing.getTransitionPath(
    isLoggedIn(user)
      ? Routes.vocabularySummary
      : Routes.publicVocabularySummary,
    {
      params: new Map([["name", iri.fragment]]),
      query: new Map([["namespace", iri.namespace!]]),
    }
  );
  return (
    <AssetIriLink
      assetIri={iri.toString()}
      path={path}
      tooltip={i18n("asset.link.tooltip")}
    />
  );
};

export default VocabularyIriLink;
