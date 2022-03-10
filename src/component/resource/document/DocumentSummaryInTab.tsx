import Document from "../../../model/Document";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { loadResource } from "../../../action/AsyncActions";
import ResourceMetadata from "../ResourceMetadata";
import DocumentFiles from "./DocumentFiles";
import React from "react";

interface DocumentSummaryInTabProps {
  document?: Document;
  onChange: () => void;
}

// TODO Rename to DocumentSummary after original DocumentSummary component is removed
const DocumentSummaryInTab: React.FC<DocumentSummaryInTabProps> = ({
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
      <ResourceMetadata resource={document} inTab={true} />
      <DocumentFiles
        document={document}
        onFileAdded={reload}
        onFileRemoved={reload}
      />
    </div>
  ) : null;
};

export default DocumentSummaryInTab;
