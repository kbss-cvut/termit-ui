import * as React from "react";
import AssetLink from "../misc/AssetLink";
import Resource from "../../model/Resource";
import VocabularyUtils from "../../util/VocabularyUtils";
import { Routing } from "../../util/Routing";
import Routes from "../../util/Routes";
import { useI18n } from "../hook/useI18n";

interface ResourceLinkProps {
  resource: Resource;
  id?: string;
}

export const ResourceLink = (props: ResourceLinkProps) => {
  const { i18n } = useI18n();
  const iri = VocabularyUtils.create(props.resource.iri);
  const path = Routing.getTransitionPath(Routes.resourceSummary, {
    params: new Map([["name", iri.fragment]]),
    query: new Map([["namespace", iri.namespace!]]),
  });
  return (
    <AssetLink
      id={props.id}
      asset={props.resource}
      path={path}
      tooltip={i18n("asset.link.tooltip")}
    />
  );
};

export default ResourceLink;
