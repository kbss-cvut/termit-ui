import * as React from "react";
import Resource, {EMPTY_RESOURCE} from "../../model/Resource";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import Utils from "../../util/Utils";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import ResourceSummary from "./ResourceSummary";
import {RouteComponentProps} from "react-router";
import {ThunkDispatch} from "../../util/Types";
import {clearResource} from "../../action/SyncActions";
import {loadResource} from "../../action/AsyncActions";
import DocumentSummary from "./document/DocumentSummary";
import Document from "../../model/Document";
import Routes from "../../util/Routes";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import WindowTitle from "../misc/WindowTitle";

interface ResourceSummaryRouteProps extends RouteComponentProps<any>, HasI18n {
    resource: Resource;
    loadResource: (iri: IRI) => Promise<any>;
    clearResource: () => void;
}

export class ResourceSummaryRoute extends React.Component<ResourceSummaryRouteProps> {
    public componentDidMount(): void {
        if (this.props.resource === EMPTY_RESOURCE) {
            this.props.loadResource(Utils.extractAssetIri(this.props.match, this.props.location));
        }
    }

    public componentDidUpdate(): void {
        if (this.props.resource !== EMPTY_RESOURCE) {
            const iri = VocabularyUtils.create(this.props.resource.iri);
            const routeIri = Utils.extractAssetIri(this.props.match, this.props.location);
            if (iri.fragment !== routeIri.fragment || (routeIri.namespace && iri.namespace !== routeIri.namespace)) {
                this.props.loadResource(routeIri);
            }
        }
    }

    public componentWillUnmount(): void {
        if (this.shouldClearResource()) {
            this.props.clearResource();
        }
    }

    private shouldClearResource() {
        const resourceIri = VocabularyUtils.create(this.props.resource.iri);
        return !this.props.history.location.pathname.endsWith(
            Routes.annotateFile.path.replace(":name", resourceIri.fragment)
        );
    }

    public render() {
        const resource = this.props.resource;
        if (resource === EMPTY_RESOURCE) {
            return null;
        }
        const primaryType = Utils.getPrimaryAssetType(resource);
        let component;
        switch (primaryType) {
            case VocabularyUtils.FILE:
                return null;
            case VocabularyUtils.DOCUMENT:
                component = (
                    <DocumentSummary
                        resource={resource as Document}
                        customDisabledRemoveTooltipKey="document.remove.tooltip.disabled"
                    />
                );
                break;
            default:
                component = <ResourceSummary resource={resource} />;
        }
        return (
            <>
                <WindowTitle title={`${resource.label} | ${this.props.i18n("main.nav.resources")}`} />
                {component}
            </>
        );
    }
}

export default connect(
    (state: TermItState) => ({resource: state.resource}),
    (dispatch: ThunkDispatch) => {
        return {
            loadResource: (iri: IRI) => dispatch(loadResource(iri)),
            clearResource: () => dispatch(clearResource())
        };
    }
)(injectIntl(withI18n(ResourceSummaryRoute)));
