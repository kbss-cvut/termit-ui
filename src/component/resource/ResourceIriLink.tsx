import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import VocabularyUtils from "../../util/VocabularyUtils";
import {Routing} from "../../util/Routing";
import Routes from "../../util/Routes";
import AssetIriLink from "../misc/AssetIriLink";
import {injectIntl} from "react-intl";

interface ResourceIriLinkProps extends HasI18n {
    iri: string;
    id?: string;
}

/**
 * Link to a Resource detail for situation when Resource label is not available and only IRI is known.
 *
 * The link will fetch the corresponding label and display it.
 */
const ResourceIriLink: React.FC<ResourceIriLinkProps> = (props: ResourceIriLinkProps) => {
    const iri = VocabularyUtils.create(props.iri);
    const path = Routing.getTransitionPath(Routes.resourceSummary,
        {
            params: new Map([["name", iri.fragment]]),
            query: new Map([["namespace", iri.namespace!]])
        });
    return <AssetIriLink assetIri={iri.toString()} path={path} tooltip={props.i18n("asset.link.tooltip")}/>;
};

export default injectIntl(withI18n(ResourceIriLink));
