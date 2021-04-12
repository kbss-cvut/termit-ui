import React, { useCallback } from "react";
import Document from "../../../model/Document";
import TermItFile from "../../../model/File";
import { ThunkDispatch } from "../../../util/Types";
import { connect } from "react-redux";
import {
  createFileInDocument,
  removeFileFromDocument,
  uploadFileContent,
} from "../../../action/AsyncActions";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Files from "./Files";
import NotificationType from "../../../model/NotificationType";
import AppNotification from "../../../model/AppNotification";
import { publishNotification } from "../../../action/SyncActions";
import AddFile from "./AddFile";
import FileContentLink from "../file/FileContentLink";
import RemoveFile from "./RemoveFile";

interface DocumentFilesProps {
  document: Document;
  removeFile: (file: TermItFile, documentIri: string) => Promise<void>;
  onFileRemoved: () => void;
  addFile: (file: TermItFile, documentIri: string) => Promise<void>;
  onFileAdded: () => void;
  uploadFile: (fileIri: string, file: File) => Promise<any>;
  notify: (notification: AppNotification) => void;
}

export const DocumentFiles = (props: DocumentFilesProps) => {
  const {
    document,
    addFile,
    removeFile,
    uploadFile,
    notify,
    onFileAdded,
    onFileRemoved,
  } = props;

  document.files.forEach((f) => (f.owner = document));

  const createFile = useCallback(
    (termitFile: TermItFile, file: File): Promise<void> =>
      addFile(termitFile, document.iri)
        .then(() =>
          uploadFile(termitFile.iri, file).then(() =>
            notify({ source: { type: NotificationType.FILE_CONTENT_UPLOADED } })
          )
        )
        .then(onFileAdded),
    [document, notify, onFileAdded, addFile, uploadFile]
  );

  const deleteFile = useCallback(
    (termitFile: TermItFile): Promise<void> =>
      removeFile(termitFile, document.iri).then(onFileRemoved),
    [document, onFileRemoved, removeFile]
  );

  if (!document) {
    return null;
  }
  return (
    <Files
      files={document.files}
      actions={[<AddFile key="add-file" performAction={createFile} />]}
      itemActions={(file: TermItFile) => [
        <FileContentLink key="show-content-file" file={file} />,
        <RemoveFile
          key="remove-file"
          file={file}
          performAction={deleteFile.bind(this, file)}
          withConfirmation={true}
        />,
      ]}
    />
  );
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    addFile: (file: TermItFile, documentIri: string) =>
      dispatch(createFileInDocument(file, VocabularyUtils.create(documentIri))),
    removeFile: (file: TermItFile, documentIri: string) =>
      dispatch(
        removeFileFromDocument(file, VocabularyUtils.create(documentIri))
      ),
    uploadFile: (fileIri: string, file: File) =>
      dispatch(uploadFileContent(VocabularyUtils.create(fileIri), file)),
    notify: (notification: AppNotification) =>
      dispatch(publishNotification(notification)),
  };
})(DocumentFiles);
