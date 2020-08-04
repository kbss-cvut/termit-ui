import * as React from "react";
import {ResourceSummary, ResourceSummaryProps} from "../ResourceSummary";
import Document from "../../../model/Document";
import {connect} from "react-redux";
import TermItState from "../../../model/TermItState";
import {ThunkDispatch} from "../../../util/Types";
import VocabularyUtils, {IRI} from "../../../util/VocabularyUtils";
import {loadResource, removeResource, updateResource} from "../../../action/AsyncActions";
import Resource from "../../../model/Resource";
import {injectIntl} from "react-intl";
import withI18n from "../../hoc/withI18n";
import {Card, CardBody, Col, Label, Row} from "reactstrap";
import RemoveAssetDialog from "../../asset/RemoveAssetDialog";
import ResourceMetadata from "../ResourceMetadata";
import Utils from "../../../util/Utils";
import DocumentFiles from "./DocumentFiles";
import VocabularyIriLink from "../../vocabulary/VocabularyIriLink";
import HeaderWithActions from "../../misc/HeaderWithActions";
import CopyIriIcon from "../../misc/CopyIriIcon";

interface DocumentSummaryProps extends ResourceSummaryProps {
    resource: Document;
}

export class DocumentSummary extends ResourceSummary<DocumentSummaryProps> {

    protected canRemove(): false | boolean {
        return !this.props.resource.vocabulary && Utils.sanitizeArray(this.props.resource.files).length === 0;
    }

    public onFileAdded = () => {
        this.props.loadResource(VocabularyUtils.create(this.props.resource.iri));
    };

    private renderVocabulary(): null | JSX.Element {
        if (this.props.resource.vocabulary) {
            return <Row>
                <Col xl={2} md={4}>
                    <Label
                        className="attribute-label">{this.props.i18n("resource.metadata.document.vocabulary")}:</Label>
                </Col>
                <Col xl={10} md={8}>
                    <VocabularyIriLink iri={this.props.resource.vocabulary.iri!}/>
                </Col>
            </Row>;
        } else {
            return null;
        }
    }

    public render() {
        return <div id="resource-detail">
            <HeaderWithActions title={
                <>{this.props.resource.label}<CopyIriIcon url={this.props.resource.iri as string}/></>
            } actions={this.getActionButtons()}/>

            <RemoveAssetDialog show={this.state.showRemoveDialog} asset={this.props.resource}
                               onCancel={this.onCloseRemove} onSubmit={this.onRemove}/>
            {this.state.edit ? this.renderMetadataEdit() : this.renderMetadata()}
        </div>
    }

    protected renderMetadata() {
        return <div className="metadata-panel">
            <ResourceMetadata resource={this.props.resource} additionalColumns={this.renderVocabulary()}/>
            <Card>
                <CardBody>
                    <DocumentFiles document={this.props.resource} onFileAdded={this.onFileAdded}/>
                </CardBody>
            </Card>
        </div>;
    }
}

export default connect((state: TermItState) => ({intl: state.intl}), (dispatch: ThunkDispatch) => {
    return {
        loadResource: (iri: IRI) => dispatch(loadResource(iri)),
        saveResource: (resource: Resource) => dispatch(updateResource(resource)),
        removeResource: (resource: Resource) => dispatch(removeResource(resource))
    };
})(injectIntl(withI18n(DocumentSummary)));