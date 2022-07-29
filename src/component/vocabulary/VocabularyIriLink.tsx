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
 *
 * TODO Would much like prefer to use Vocabularies.getVocabularyRouteOptions, but we do not have vocabulary instance
 * and do not know whether the iri represents a vocabulary snapshot or not
 * We can either try to use a prop to pass info about it being a snapshot (based on rendering context, e.g. from term snapshot)
 * or we may attempt to decide based on IRI (heuristics) or we would have to download to vocabulary
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
