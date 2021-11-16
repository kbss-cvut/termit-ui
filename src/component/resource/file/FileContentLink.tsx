import * as React from "react";
import { useEffect, useState } from "react";
import { FileData } from "../../../model/File";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { Link } from "react-router-dom";
import Routes from "../../../util/Routes";
import { GoFile } from "react-icons/go";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import { getContentType } from "../../../action/AsyncActions";
// @ts-ignore
import mimetype from "whatwg-mimetype";
import { useI18n } from "../../hook/useI18n";

interface FileContentLinkProps {
  id?: string;
  file: FileData;
}

function isSupported(contentType?: string | null) {
  if (!contentType) {
    return false;
  }
  const mt = mimetype.parse(contentType);
  return mt.isHTML() || mt.isXML();
}

const FileContentLink: React.FC<FileContentLinkProps> = (props) => {
  const { id, file } = props;
  const dispatch = useDispatch<ThunkDispatch>();
  const { i18n } = useI18n();
  const [contentType, setContentType] = useState<string | null>(null);
  useEffect(() => {
    dispatch(getContentType(VocabularyUtils.create(file.iri))).then((ct) =>
      setContentType(ct)
    );
  }, [dispatch, file.iri]);

  const fileIri = VocabularyUtils.create(file.iri);
  const documentIri = VocabularyUtils.create(file.owner!.iri);
  const params = { name: documentIri.fragment, fileName: fileIri.fragment };
  const query = {
    namespace: documentIri.namespace,
    fileNamespace: fileIri.namespace,
  };
  return isSupported(contentType) ? (
    <Link
      id={id}
      className="btn btn-primary btn-sm"
      title={i18n("resource.metadata.file.content.view.tooltip")}
      to={Routes.annotateFile.link(params, query)}
    >
      <GoFile className="mr-1" />
      {i18n("resource.metadata.file.content")}
    </Link>
  ) : (
    <></>
  );
};

export default FileContentLink;
