import * as React from "react";
import Resource, {EMPTY_RESOURCE} from "../../model/Resource";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import Utils from "../../util/Utils";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import FileSummary from "./file/FileSummary";
import ResourceSummary from "./ResourceSummary";
import {RouteComponentProps} from "react-router";
import {ThunkDispatch} from "../../util/Types";
import {clearResource} from "../../action/SyncActions";
import {loadResource} from "../../action/AsyncActions";
import File from "../../model/File";
import DocumentSummary from "./document/DocumentSummary";
import Document from "../../model/Document";
import Routes from "../../util/Routes";

interface ResourceSummaryRouteProps extends RouteComponentProps<any> {
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
        return !this.props.history.location.pathname.endsWith(Routes.annotateFile.path.replace(":name", resourceIri.fragment));
    }

    public render() {
        if (this.props.resource === EMPTY_RESOURCE) {
            return null;
        }
        const primaryType = Utils.getPrimaryAssetType(this.props.resource);
        switch (primaryType) {
            case VocabularyUtils.FILE:
                return <FileSummary resource={this.props.resource as File}/>;
            case VocabularyUtils.DOCUMENT:
                return <DocumentSummary resource={this.props.resource as Document}/>;
            default:
                return <ResourceSummary resource={this.props.resource}/>;
        }
    }
}

export default connect((state: TermItState) => ({resource: state.resource}), (dispatch: ThunkDispatch) => {
    return {
        loadResource: (iri: IRI) => dispatch(loadResource(iri)),
        clearResource: () => dispatch(clearResource())
    };
})(ResourceSummaryRoute);
