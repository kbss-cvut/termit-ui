import React from "react";
import {
    Button,
    ButtonToolbar,
    Card,
    CardBody,
    Col,
    Row
} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routes from "../../util/Routes";
import Routing from "../../util/Routing";
import CustomInput from "../misc/CustomInput";
import TextArea from "../misc/TextArea";
import Document from "../../model/Document";
import Vocabulary from "../../model/Vocabulary";
import {AbstractCreateAsset, AbstractCreateAssetState} from "../asset/AbstractCreateAsset";
import withLoading from "../hoc/withLoading";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import {ThunkDispatch} from "../../util/Types";
import VocabularyUtils from "../../util/VocabularyUtils";
import HeaderWithActions from "../misc/HeaderWithActions";
import {ContextFreeAssetType} from "../../model/ContextFreeAssetType";
import Resource from "../../model/Resource";
import {createFileInDocument, createVocabulary, uploadFileContent} from "../../action/AsyncActions";
import ShowAdvanceAssetFields from "../asset/ShowAdvancedAssetFields";
import Files from "../resource/document/Files";
import TermItFile from "../../model/File";
import Utils from "../../util/Utils";
import NotificationType from "../../model/NotificationType";
import AppNotification from "../../model/AppNotification";
import {publishNotification} from "../../action/SyncActions";
import IdentifierResolver from "../../util/IdentifierResolver";
import AddFile from "../resource/document/AddFile";
import RemoveFile from "../resource/document/RemoveFile";
import Constants from "../../util/Constants";
import {Helmet} from "react-helmet";

interface CreateVocabularyProps extends HasI18n {
    createFile: (file: TermItFile, documentIri: string) => Promise<any>,
    createVocabulary: (vocabulary: Vocabulary) => Promise<string>,
    uploadFileContent: (fileIri: string, file: File) => Promise<any>,
    publishNotification: (notification: AppNotification) => void
}

interface CreateAllVocabulariesState extends AbstractCreateAssetState {
    comment: string;
    // document vocabulary
    files: TermItFile[];
    fileContents: File[];
    showCreateFile: boolean
}

export class CreateVocabulary extends AbstractCreateAsset<CreateVocabularyProps, CreateAllVocabulariesState> {

    constructor(props: CreateVocabularyProps) {
        super(props);
        this.state = {
            label: "",
            iri: "",
            generateIri: true,
            comment: "",
            files: [],
            fileContents: [],
            showCreateFile: false
        };
    }

    protected get assetType(): ContextFreeAssetType {
        return "VOCABULARY";
    }

    public onCreate = () => {
        const vocabulary = new Vocabulary({
            label: this.state.label,
            iri: this.state.iri,
            comment: this.state.comment
        });
        vocabulary.addType(VocabularyUtils.DOCUMENT_VOCABULARY);

        const files = this.state.files;
        const fileContents = this.state.fileContents;
        const document = new Document({
            label: this.props.formatMessage("vocabulary.document.label", {
                vocabulary: vocabulary.getLabel()
            }),
            iri: this.state.iri + "/document",
            files: []
        });
        document.addType(VocabularyUtils.DOCUMENT);
        vocabulary.document = document;
        this.props.createVocabulary(vocabulary)
            .then((location) => {
                    return Promise.all(Utils.sanitizeArray(files).map((f, fIndex) =>
                        this.props.createFile(f, document.iri)
                            .then(() => this.props.uploadFileContent(f.iri, fileContents[fIndex]))
                            .then(() => this.props.publishNotification({source: {type: NotificationType.FILE_CONTENT_UPLOADED}}))
                    )).then(() => Routing.transitionTo(Routes.vocabularySummary, IdentifierResolver.routingOptionsFromLocation(location)))
                }
            );
    };

    public static onCancel(): void {
        Routing.transitionTo(Routes.vocabularies);
    }

    private onCommentChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({comment: e.currentTarget.value});
    }

    private isFormValid() {
        return this.state.label.trim().length > 0;
    }

    private onCreateFile = (termitFile: Resource, file: File): Promise<void> => {
        return Promise.resolve().then(() => {
            const files = this.state.files.concat(termitFile as TermItFile);
            const fileContents = this.state.fileContents.concat(file);
            this.setState({files, fileContents});
        });
    }

    private onRemoveFile = (termitFile: Resource): Promise<void> => {
        return Promise.resolve().then(() => {
            const index = this.state.files.indexOf(termitFile as TermItFile);
            if (index > -1) {
                const files = this.state.files;
                files.splice(index, 1);
                const fileContents = this.state.fileContents;
                fileContents.splice(index, 1);
                this.setState({files, fileContents});
            }
        });
    }

    public render() {
        const i18n = this.props.i18n;
        const onCancel = CreateVocabulary.onCancel;

        return <>
            <Helmet>
                <title>{`${i18n("vocabulary.create.title")} | ${Constants.APP_NAME}`}</title>
            </Helmet>
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
                                    <TextArea name="create-vocabulary-comment" label={i18n("vocabulary.comment")}
                                              type="textarea" rows={4} value={this.state.comment}
                                              help={i18n("optional")}
                                              onChange={this.onCommentChange}/>
                                </Col>
                            </Row>
                            <Files files={this.state.files}
                                   actions={[<AddFile key="add-file" performAction={this.onCreateFile}/>]}
                                   itemActions={(file: TermItFile) => [
                                       <RemoveFile key="remove-file"
                                                   file={file}
                                                   performAction={this.onRemoveFile.bind(this, file)}
                                                   withConfirmation={false}/>
                                   ]
                                   }
                            />
                            <ShowAdvanceAssetFields>
                                <Row>
                                    <Col xs={12}>
                                        <CustomInput name="create-vocabulary-iri" label={i18n("asset.iri")}
                                                     value={this.state.iri}
                                                     onChange={this.onIriChange} help={i18n("asset.create.iri.help")}/>
                                    </Col>
                                </Row>
                            </ShowAdvanceAssetFields>
                            <Row>
                                <Col xs={12}>
                                    <ButtonToolbar className="d-flex justify-content-center mt-4">
                                        <Button id="create-vocabulary-submit" onClick={this.onCreate} color="success"
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
        createVocabulary: (vocabulary: Vocabulary) => dispatch(createVocabulary(vocabulary)),
        createFile: (file: TermItFile, documentIri: string) => dispatch(createFileInDocument(file, VocabularyUtils.create(documentIri))),
        uploadFileContent: (fileIri: string, file: File) => dispatch(uploadFileContent(VocabularyUtils.create(fileIri), file)),
        publishNotification: (notification: AppNotification) => dispatch(publishNotification(notification))
    };
})(injectIntl(withI18n(withLoading(CreateVocabulary))));
