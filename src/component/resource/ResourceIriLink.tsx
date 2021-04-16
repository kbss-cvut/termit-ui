import * as React from "react";
import VocabularyUtils from "../../util/VocabularyUtils";
import { Routing } from "../../util/Routing";
import Routes from "../../util/Routes";
import AssetIriLink from "../misc/AssetIriLink";
import { useI18n } from "../hook/useI18n";

interface ResourceIriLinkProps {
  iri: string;
  id?: string;
}

/**
 * Link to a Resource detail for situation when Resource label is not available and only IRI is known.
 *
 * The link will fetch the corresponding label and display it.
 */
const ResourceIriLink: React.FC<ResourceIriLinkProps> = (
  props: ResourceIriLinkProps
) => {
  const { i18n } = useI18n();
  const iri = VocabularyUtils.create(props.iri);
  const path = Routing.getTransitionPath(Routes.resourceSummary, {
    params: new Map([["name", iri.fragment]]),
    query: new Map([["namespace", iri.namespace!]]),
  });
  return (
    <AssetIriLink
      assetIri={iri.toString()}
      path={path}
      tooltip={i18n("asset.link.tooltip")}
    />
  );
};

export default ResourceIriLink;
