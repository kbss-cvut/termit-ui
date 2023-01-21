import * as React from "react";
import { useEffect, useState } from "react";
import { FileData } from "../../../model/File";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { Link } from "react-router-dom";
import Routes from "../../../util/Routes";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import { getContentType } from "../../../action/AsyncActions";
// @ts-ignore
import mimetype from "whatwg-mimetype";
import { useI18n } from "../../hook/useI18n";

interface FileContentLinkProps {
  id?: string;
  file: FileData;
  wrapperComponent?: React.ComponentType;
}

function isSupported(contentType?: string | null) {
  if (!contentType) {
    return false;
  }
  const mt = mimetype.parse(contentType);
  return mt && (mt.isHTML() || mt.isXML());
}

const FileContentLink: React.FC<FileContentLinkProps> = (props) => {
  const { id, file, wrapperComponent } = props;
  const dispatch = useDispatch<ThunkDispatch>();
  const { i18n } = useI18n();
  const [contentType, setContentType] = useState<string | null>(null);
  useEffect(() => {
    dispatch(getContentType(VocabularyUtils.create(file.iri))).then((ct) =>
      setContentType(ct)
    );
  }, [dispatch, file.iri]);

  const fileIri = VocabularyUtils.create(file.iri);
  const vocabularyIri = VocabularyUtils.create(file.owner!.vocabulary!.iri!);
  const params = { name: vocabularyIri.fragment, fileName: fileIri.fragment };
  const query = {
    namespace: vocabularyIri.namespace,
    fileNamespace: fileIri.namespace,
  };
  const Wrapper = wrapperComponent || React.Fragment;
  return isSupported(contentType) ? (
    <Wrapper>
      <Link
        id={id}
        title={i18n("resource.metadata.file.content.view.tooltip")}
        to={Routes.annotateFile.link(params, query)}
        style={{ color: "inherit" }}
      >
        {i18n("resource.metadata.file.content.view")}
      </Link>
    </Wrapper>
  ) : (
    <></>
  );
};

export default FileContentLink;
