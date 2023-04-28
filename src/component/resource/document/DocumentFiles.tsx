import Document from "../../../model/Document";
import TermItFile, { FileData } from "../../../model/File";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import {
  createFileInDocument,
  exportFileContent,
  removeFileFromDocument,
  updateResource,
  uploadFileContent,
} from "../../../action/AsyncActions";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Files from "./Files";
import NotificationType from "../../../model/NotificationType";
import { publishNotification } from "../../../action/SyncActions";
import AddFile from "./AddFile";
import RemoveFile from "./RemoveFile";
import ModifyFile from "./ModifyFile";
import FileContentActions from "./FileContentActions";
import { DateTime } from "luxon";
import Constants from "../../../util/Constants";
import AccessLevel from "../../../model/acl/AccessLevel";

interface DocumentFilesProps {
  document: Document;
  accessLevel: AccessLevel;
  onFileRemoved: () => void;
  onFileRenamed: () => void;
  onFileAdded: () => void;
  onFileReupload: () => void;
}

export const DocumentFiles = (props: DocumentFilesProps) => {
  const {
    document,
    onFileAdded,
    onFileRemoved,
    onFileRenamed,
    onFileReupload,
  } = props;
  const dispatch: ThunkDispatch = useDispatch();

  const createFile = (termitFile: TermItFile, file: File): Promise<void> =>
    dispatch(
      createFileInDocument(termitFile, VocabularyUtils.create(document.iri))
    )
      .then(() =>
        dispatch(
          uploadFileContent(VocabularyUtils.create(termitFile.iri), file)
        ).then(() =>
          dispatch(
            publishNotification({
              source: { type: NotificationType.FILE_CONTENT_UPLOADED },
            })
          )
        )
      )
      .then(onFileAdded);
  const deleteFile = (termitFile: TermItFile) =>
    dispatch(
      removeFileFromDocument(termitFile, VocabularyUtils.create(document.iri))
    ).then(onFileRemoved);
  const renameFile = (termitFile: FileData) =>
    dispatch(updateResource(new TermItFile(termitFile))).then(onFileRenamed);
  const downloadFile = (termitFile: TermItFile) =>
    dispatch(exportFileContent(VocabularyUtils.create(termitFile.iri)));
  const downloadOriginal = (termitFile: TermItFile) => {
    const timestamp = DateTime.fromMillis(0).toFormat(
      Constants.TIMESTAMP_PARAM_FORMAT
    );
    dispatch(
      exportFileContent(VocabularyUtils.create(termitFile.iri), timestamp)
    );
  };

  const reuploadFile = (termitFile: TermItFile, file: File): Promise<void> =>
    dispatch(uploadFileContent(VocabularyUtils.create(termitFile.iri), file))
      .then(() =>
        dispatch(
          publishNotification({
            source: { type: NotificationType.FILE_CONTENT_UPLOADED },
          })
        )
      )
      .then(onFileReupload);

  if (!document) {
    return null;
  }

  return (
    <Files
      files={document.files}
      actions={[<AddFile key="add-file" performAction={createFile} />]}
      itemActions={(file: TermItFile) => [
        <FileContentActions
          key="file-content-actions"
          file={file}
          onDownload={downloadFile}
          onDownloadOriginal={downloadOriginal}
        />,
        <ModifyFile
          key="rename-file"
          file={file}
          performRename={renameFile}
          performFileUpdate={reuploadFile}
        />,
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

export default DocumentFiles;
