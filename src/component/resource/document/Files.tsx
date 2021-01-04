import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {Button, Card, CardBody, CardHeader, Modal, ModalBody} from "reactstrap";
import FileList from "../../file/FileList";
import TermItFile from "../../../model/File";
import {GoPlus} from "react-icons/go";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Resource from "../../../model/Resource";
import CreateFileMetadataLight from "../file/CreateFileMetadata";

interface FilesProps extends HasI18n {
    files: TermItFile[];
    onFileAdded: () => void;
    createFile: (termitFile: TermItFile, file: File) => Promise<void>;
}

interface FilesState {
    createFileDialogOpen: boolean;
}

export class Files extends React.Component<FilesProps, FilesState> {

    constructor(props: FilesProps) {
        super(props);
        this.state = {createFileDialogOpen: false};
    }

    private openCreateFileDialog = () => {
        this.setState({createFileDialogOpen: true});
    };

    private closeCreateFileDialog = () => {
        this.setState({createFileDialogOpen: false});
    };

    private createFile = (termitFile: Resource, file: File) : void => {
        termitFile.addType(VocabularyUtils.FILE);
        this.props.createFile(termitFile as TermItFile, file).then(() => {
            this.closeCreateFileDialog();
            this.props.onFileAdded();
        });
    };

    public render() {
        const files = this.props.files;
        const i18n = this.props.i18n;
        return <div>
            {this.renderCreateFileDialog()}
            <div id="document-files" className="d-flex flex-wrap justify-content-between">
                <h4>{i18n("vocabulary.detail.files")}</h4>
                <Button className="mb-2" color="primary" size="sm" onClick={this.openCreateFileDialog}
                        title={i18n("resource.metadata.document.files.create.tooltip")}>
                    <GoPlus/>&nbsp;{i18n("resource.metadata.document.files.add")}
                </Button>
            </div>
            <FileList files={files}/>
        </div>;
    }

    private renderCreateFileDialog() {
        return <Modal isOpen={this.state.createFileDialogOpen} toggle={this.closeCreateFileDialog}>
            <ModalBody>
                <Card id="document-create-file">
                    <CardHeader color="info">
                        <h5>{this.props.i18n("resource.metadata.document.files.create.dialog.title")}</h5>
                    </CardHeader>
                    <CardBody>
                        <CreateFileMetadataLight
                            onCreate={this.createFile}
                            onCancel={this.closeCreateFileDialog}/>
                    </CardBody>
                </Card>
            </ModalBody>
        </Modal>;
    }
}

export default injectIntl(withI18n(Files));