import * as React from "react";
import {
    Button,
    ButtonToolbar,
    Card,
    CardBody,
    Col,
    FormText,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    Row
} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routes from "../../util/Routes";
import Routing from "../../util/Routing";
import CustomInput from "../misc/CustomInput";
import TextArea from "../misc/TextArea";
import Document from "../../model/Document";
import Resource from "../../model/Resource";
import Vocabulary from "../../model/Vocabulary";
import {AbstractCreateAsset, AbstractCreateAssetState} from "../asset/AbstractCreateAsset";
import CreateDocumentForVocabulary from "./CreateDocumentForVocabulary";
import {GoPlus} from "react-icons/go";
import Constants from "../../util/Constants";
import withLoading from "../hoc/withLoading";
import {createVocabulary} from "../../action/AsyncActions";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import {ThunkDispatch} from "../../util/Types";
import VocabularyUtils from "../../util/VocabularyUtils";
import HeaderWithActions from "../misc/HeaderWithActions";

interface CreateVocabularyProps extends HasI18n {
    onCreate: (vocabulary: Vocabulary) => void
}

interface CreateAllVocabulariesState extends AbstractCreateAssetState {
    comment: string;
    // document vocabulary
    resource?: Resource | null;
    showCreateDocument: boolean;
}

export class CreateVocabulary extends AbstractCreateAsset<CreateVocabularyProps, CreateAllVocabulariesState> {

    constructor(props: CreateVocabularyProps) {
        super(props);
        this.state = {
            label: "",
            iri: "",
            generateIri: true,
            comment: "",
            resource: null,
            showCreateDocument: false
        };
    }

    protected get identifierGenerationEndpoint(): string {
        return Constants.API_PREFIX + "/vocabularies/identifier";
    }

    public onCreate = () => {
        const vocabulary: Vocabulary = new Vocabulary({
            label: this.state.label,
            iri: this.state.iri,
            comment: this.state.comment
        });
        if (this.state.resource == null) {
            vocabulary.addType(VocabularyUtils.VOCABULARY);
        } else {
            vocabulary.addType(VocabularyUtils.DOCUMENT_VOCABULARY);
            vocabulary.document = this.state.resource as Document;
        }
        this.props.onCreate(vocabulary);
    };

    public static onCancel(): void {
        Routing.transitionTo(Routes.vocabularies);
    }

    private createDocument = () => {
        this.setState({showCreateDocument: true});
    }

    private onDocumentCreated(doc: Resource) {
        this.setState({resource: doc, showCreateDocument: false});
    }

    private onCloseCreateDocument = () => {
        this.setState({showCreateDocument: false});
    }

    private onCommentChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({comment: e.currentTarget.value});
    }

    private isFormValid() {
        return this.state.label.trim().length > 0;
    }

    public render() {
        const i18n = this.props.i18n;
        const onDocumentCreated = this.onDocumentCreated.bind(this);
        const onCreate = this.onCreate.bind(this);
        const onCloseCreateDocument = this.onCloseCreateDocument.bind(this);
        const disabled = !(this.state.label.length > 0);
        const onCancel = CreateVocabulary.onCancel;

        return <>
            <HeaderWithActions title={i18n("vocabulary.create.title")}/>
            <Card id="create-vocabulary">
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <Row>
                                <Col xs={12}>
                                    <CustomInput name="create-vocabulary-label" label={i18n("asset.label")}
                                                 value={this.state.label} help={i18n("required")}
                                                 onChange={this.onLabelChange}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <CustomInput name="create-vocabulary-iri" label={i18n("asset.iri")}
                                                 value={this.state.iri}
                                                 onChange={this.onIriChange} help={i18n("asset.create.iri.help")}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <TextArea name="create-vocabulary-comment" label={i18n("vocabulary.comment")}
                                              type="textarea" rows={3} value={this.state.comment}
                                              help={i18n("optional")}
                                              onChange={this.onCommentChange}/>
                                </Col>
                            </Row>
                            <CreateDocumentForVocabulary showCreateDocument={this.state.showCreateDocument}
                                                         resource={this.state.resource}
                                                         onCancel={onCloseCreateDocument}
                                                         onDocumentSet={onDocumentCreated} iri={this.state.iri}/>
                            <Row>
                                <Col xs={12}>
                                    <Label className="attribute-label">{i18n("vocabulary.detail.document")}</Label>
                                    <InputGroup className="form-group" help={i18n("optional")}>
                                        <Input name="create-document-label" disabled={true} bsSize="sm"
                                               value={this.state.resource ? this.state.resource.label : ""}/>
                                        <InputGroupAddon addonType="append">
                                            <Button id="create-document-for-vocabulary" color="primary" size="sm"
                                                    className="term-edit-source-add-button" disabled={disabled}
                                                    onClick={this.createDocument}><GoPlus/>&nbsp;{i18n("resource.document.vocabulary.create")}
                                            </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                    <FormText>{i18n("vocabulary.create.document.help")}</FormText>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <ButtonToolbar className="d-flex justify-content-center mt-4">
                                        <Button id="create-vocabulary-submit" onClick={onCreate} color="success"
                                                size="sm"
                                                disabled={!this.isFormValid()}>{i18n("vocabulary.create.submit")}</Button>
                                        <Button id="create-vocabulary-cancel" onClick={onCancel}
                                                color="outline-dark" size="sm">{i18n("cancel")}</Button>
                                    </ButtonToolbar>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card></>;
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        onCreate: (vocabulary: Vocabulary) => dispatch(createVocabulary(vocabulary))
    };
})(injectIntl(withI18n(withLoading(CreateVocabulary))));
