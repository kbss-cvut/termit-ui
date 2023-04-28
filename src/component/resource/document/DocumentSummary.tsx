import React from "react";
import { useDispatch } from "react-redux";
import Document from "../../../model/Document";
import { ThunkDispatch } from "../../../util/Types";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { loadResource } from "../../../action/AsyncActions";
import ResourceMetadata from "../ResourceMetadata";
import DocumentFiles from "./DocumentFiles";
import AccessLevel from "../../../model/acl/AccessLevel";

interface DocumentSummaryProps {
  document?: Document;
  onChange: () => void;
  accessLevel: AccessLevel;
}

const DocumentSummary: React.FC<DocumentSummaryProps> = ({
  document,
  onChange,
}) => {
  const dispatch: ThunkDispatch = useDispatch();
  const reload = () =>
    dispatch(loadResource(VocabularyUtils.create(document!.iri))).then(
      onChange
    );
  return document ? (
    <div className="metadata-panel">
      <ResourceMetadata resource={document} />
      <DocumentFiles
        document={document}
        onFileAdded={reload}
        onFileRemoved={reload}
        onFileRenamed={reload}
        onFileReupload={reload}
      />
    </div>
  ) : null;
};

export default DocumentSummary;
