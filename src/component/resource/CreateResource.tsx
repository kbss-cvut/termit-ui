import * as React from "react";
import {injectIntl} from "react-intl";
import Resource from "../../model/Resource";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import {Button, ButtonGroup, Card, CardBody, Col, Label, Row} from "reactstrap";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {createFileInDocument, createResource, uploadFileContent} from "../../action/AsyncActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import CreateResourceMetadata from "./CreateResourceMetadata";
import IdentifierResolver from "../../util/IdentifierResolver";
import HeaderWithActions from "../misc/HeaderWithActions";
import TermItFile from "../../model/File";
import AppNotification from "../../model/AppNotification";
import {publishNotification} from "../../action/SyncActions";
import withLoading from "../hoc/withLoading";
import Files from "./document/Files";
import Utils from "../../util/Utils";
import NotificationType from "../../model/NotificationType";
import AddFile from "./document/AddFile";
import RemoveFile from "./document/RemoveFile";
import WindowTitle from "../misc/WindowTitle";

interface CreateResourceProps extends HasI18n {
    createResource: (resource: Resource) => Promise<string>;
    createFile: (file: TermItFile, documentIri: string) => Promise<any>,
    uploadFileContent: (fileIri: string, file: File) => Promise<any>,
    publishNotification: (notification: AppNotification) => void
}

interface CreateResourceState {
    type: string
    files: TermItFile[];
    fileContents: File[];
    showCreateFile: boolean
}

export class CreateResource extends React.Component<CreateResourceProps, CreateResourceState> {

    constructor(props: CreateResourceProps) {
        super(props);
        this.state = {
            type: VocabularyUtils.DOCUMENT,
            files: [],
            fileContents: [],
            showCreateFile: false
        };
    }

    private onTypeSelect = (type: string) => {
        this.setState({type});
    };

    public onCreate = (resource: Resource): Promise<string> => {
        resource.addType(this.state.type);
        const files = this.state.files;
        const fileContents = this.state.fileContents;
        return this.props.createResource(resource).then((iri) => {
            return Promise.all(Utils.sanitizeArray(files).map((f, fIndex) =>
                    this.props.createFile(f, resource.iri)
                        .then(() => this.props.uploadFileContent(f.iri, fileContents[fIndex])
                            .then(() => this.props.publishNotification({source: {type: NotificationType.FILE_CONTENT_UPLOADED}})))
                )
            )
                .then(() => Routing.transitionTo(Routes.resourceSummary, IdentifierResolver.routingOptionsFromLocation(iri)))
                .then(() => iri)
        });
    };

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

    public static onCancel(): void {
        Routing.transitionTo(Routes.resources);
    }

    public render() {
        const i18n = this.props.i18n;
        return <>
            <WindowTitle title={i18n("resource.create.title")}/>
            <HeaderWithActions title={i18n("resource.create.title")}/>
            <Card id="create-resource">
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <Row>
                                <Col>
                                    <Label className="attribute-label">{i18n("resource.create.type")}</Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <ButtonGroup className="d-flex form-group">
                                        <Button id="create-resource-type-resource" color="primary" size="sm"
                                                className="w-100 create-resource-type-select" outline={true}
                                                onClick={this.onTypeSelect.bind(null, VocabularyUtils.RESOURCE)}
                                                active={this.state.type === VocabularyUtils.RESOURCE}>{i18n("type.resource")}</Button>
                                        <Button id="create-resource-type-document" color="primary" size="sm"
                                                className="w-100 create-resource-type-select" outline={true}
                                                onClick={this.onTypeSelect.bind(null, VocabularyUtils.DOCUMENT)}
                                                active={this.state.type === VocabularyUtils.DOCUMENT}>{i18n("type.document")}</Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <CreateResourceMetadata onCreate={this.onCreate} onCancel={CreateResource.onCancel}>
                        {
                            this.state.type === VocabularyUtils.DOCUMENT ?
                                <Files files={this.state.files}
                                       actions={[<AddFile key="add-file" performAction={this.onCreateFile}/>]}
                                       itemActions={(file: TermItFile) => [
                                           <RemoveFile key="remove-file"
                                                       file={file}
                                                       performAction={this.onRemoveFile.bind(this, file)}
                                                       withConfirmation={false}/>]
                                       }
                                /> : null
                        }
                    </CreateResourceMetadata>
                </CardBody>
            </Card></>;
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        createResource: (resource: Resource) => dispatch(createResource(resource)),
        createFile: (file: TermItFile, documentIri: string) => dispatch(createFileInDocument(file, VocabularyUtils.create(documentIri))),
        uploadFileContent: (fileIri: string, file: File) => dispatch(uploadFileContent(VocabularyUtils.create(fileIri), file)),
        publishNotification: (notification: AppNotification) => dispatch(publishNotification(notification))
    };
})(injectIntl(withI18n(withLoading(CreateResource))));
