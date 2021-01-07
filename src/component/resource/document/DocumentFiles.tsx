import React from "react";
import Document from "../../../model/Document";
import TermItFile from "../../../model/File";
import {ThunkDispatch} from "../../../util/Types";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {connect} from "react-redux";
import {createFileInDocument, uploadFileContent} from "../../../action/AsyncActions";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Files from "./Files";
import {injectIntl} from "react-intl";
import NotificationType from "../../../model/NotificationType";
import AppNotification from "../../../model/AppNotification";
import {publishNotification} from "../../../action/SyncActions";

interface DocumentFilesProps extends HasI18n {
    document: Document;
    onFileAdded: () => void;
    createFile: (file: TermItFile, documentIri: string) => Promise<void>;
    uploadFileContent: (fileIri: string, file: File) => Promise<any>,
    publishNotification: (notification: AppNotification) => void
}

export class DocumentFiles extends React.Component<DocumentFilesProps> {

    private createFile = (termitFile: TermItFile, file: File) : Promise<void> =>  {
        return this.props.createFile(termitFile, this.props.document.iri).then(() =>
            this.props.uploadFileContent(termitFile.iri, file)
                .then(() => this.props.publishNotification({source: {type: NotificationType.FILE_CONTENT_UPLOADED}})));
    }

    public render() {
        const doc = this.props.document;
        if (!doc) {
            return null;
        }
        return <Files files={doc.files}
                      createFile={this.createFile}
                      onFileAdded={this.props.onFileAdded}
                      showContent={true}
        />
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        createFile: (file: TermItFile, documentIri: string) => dispatch(createFileInDocument(file, VocabularyUtils.create(documentIri))),
        uploadFileContent: (fileIri: string, file: File) => dispatch(uploadFileContent(VocabularyUtils.create(fileIri), file)),
        publishNotification: (notification: AppNotification) => dispatch(publishNotification(notification))
    };
})(injectIntl(withI18n(DocumentFiles)));
