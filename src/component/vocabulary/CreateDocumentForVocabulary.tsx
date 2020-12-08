import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Button, ButtonToolbar, Col, Modal, ModalBody, ModalHeader, Row} from "reactstrap";

import Resource from "../../model/Resource";
import {injectIntl} from "react-intl";
import CustomInput from "../misc/CustomInput";
import TextArea from "../misc/TextArea";
import {AbstractCreateAssetState} from "../asset/AbstractCreateAsset";
import VocabularyUtils from "../../util/VocabularyUtils";

interface CreateDocumentForVocabularyProps extends HasI18n {
    onCancel: () => void;
    onDocumentSet: (document: Resource) => void;
    showCreateDocument: boolean;
    resource?: Resource | null;
    iri: string;
}

interface CreateDocumentForVocabularyState extends AbstractCreateAssetState {
    description: string;
    types: string;
}

export class CreateDocumentForVocabulary extends React.Component <CreateDocumentForVocabularyProps, CreateDocumentForVocabularyState> {

    constructor(props: CreateDocumentForVocabularyProps) {
        super(props);
        this.state = {
            iri: "",
            label: "",
            description: "",
            types: VocabularyUtils.RESOURCE,
            generateIri: true
        };
    }

    protected onLabelChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const label = e.currentTarget.value;
        this.setState({label});
        this.generateIri();
    };

    protected generateIri = (): void => {
        if (!this.state.generateIri) {
            return;
        }
        this.setState({iri: this.props.iri + "/document"});
    };

    private onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({description: e.currentTarget.value});
    };

    protected onIriChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({iri: (e.currentTarget.value as string), generateIri: false});
    };

    public onCreate = () => {
       const resource =  new Resource({
           label: this.state.label,
           iri: this.state.iri,
           description: this.state.description,
       });
       resource.addType(VocabularyUtils.DOCUMENT);
        this.props.onDocumentSet(resource);
    };


    public render() {
        return <Modal isOpen={this.props.showCreateDocument} toggle={this.props.onCancel}>
            <ModalHeader toggle={this.props.onCancel}>{this.props.i18n("resource.document.vocabulary.create")}</ModalHeader>
            <ModalBody>
                {this.renderBasicMetadataInputs()}
                {this.renderSubmitButtons()}
            </ModalBody>

        </Modal>
    }

    protected renderBasicMetadataInputs() {
        const i18n = this.props.i18n;
        return <>
            <Row>
                <Col xs={12}>
                    <CustomInput name="create-document-label" label={i18n("asset.label")}
                                 value={this.state.label}
                                 onChange={this.onLabelChange}/>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <CustomInput name="create-document-iri" label={i18n("asset.iri")}
                                 value={this.state.iri}
                                 onChange={this.onIriChange} help={i18n("asset.create.iri.help")}/>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <TextArea name="create-document-description" label={i18n("resource.metadata.description")}
                              type="textarea" rows={3} value={this.state.description} help={i18n("optional")}
                              onChange={this.onDescriptionChange}/>
                </Col>
            </Row>
        </>
    }

    protected renderSubmitButtons() {
        const i18n = this.props.i18n;
        return <Row>
            <Col xs={12}>
                <ButtonToolbar className="d-flex justify-content-center mt-4">
                    <Button id="create-resource-submit" onClick={this.onCreate} color="success" size="sm"
                            disabled={this.state.label.trim().length === 0}>{i18n("create")}</Button>
                    <Button id="create-resource-cancel" onClick={this.props.onCancel}
                            color="outline-dark" size="sm">{i18n("cancel")}</Button>
                </ButtonToolbar>
            </Col>
        </Row>;
    }

}
export default (injectIntl(withI18n(CreateDocumentForVocabulary)))
