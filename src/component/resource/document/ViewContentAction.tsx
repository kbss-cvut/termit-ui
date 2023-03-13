import * as React from "react";
import { useEffect, useState } from "react";
import { FileData } from "../../../model/File";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import { getContentType } from "../../../action/AsyncActions";
// @ts-ignore
import mimetype from "whatwg-mimetype";
import { useI18n } from "../../hook/useI18n";
import { DropdownItem } from "reactstrap";

interface ViewContentActionProps {
  file: FileData;
  onClick: () => void;
}

function isSupported(contentType?: string | null) {
  if (!contentType) {
    return false;
  }
  const mt = mimetype.parse(contentType);
  return mt && (mt.isHTML() || mt.isXML());
}

const ViewContentAction: React.FC<ViewContentActionProps> = (props) => {
  const { file, onClick } = props;
  const dispatch = useDispatch<ThunkDispatch>();
  const { i18n } = useI18n();
  const [contentType, setContentType] = useState<string | null>(null);
  useEffect(() => {
    dispatch(getContentType(VocabularyUtils.create(file.iri))).then((ct) =>
      setContentType(ct)
    );
  }, [dispatch, file.iri]);
  return isSupported(contentType) ? (
    <DropdownItem
      onClick={onClick}
      title={i18n("resource.metadata.file.content.view.tooltip")}
    >
      {i18n("resource.metadata.file.content.view")}
    </DropdownItem>
  ) : (
    <></>
  );
};

export default ViewContentAction;
