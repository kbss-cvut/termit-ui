import React from "react";
import { IRI } from "../../util/VocabularyUtils";
import { useI18n } from "../hook/useI18n";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { exportFileContent } from "../../action/AsyncActions";
import { trackPromise } from "react-promise-tracker";
import { DateTime } from "luxon";
import Constants from "../../util/Constants";

const AnnotatorDownloadActions: React.FC<{ fileIri: IRI }> = ({ fileIri }) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();

  const downloadCurrentFile = () => {
    trackPromise(dispatch(exportFileContent(fileIri)), "annotator");
  };
  const downloadOriginalFile = () => {
    const timestamp = DateTime.fromMillis(0).toFormat(
      Constants.TIMESTAMP_PARAM_FORMAT
    );
    trackPromise(
      dispatch(exportFileContent(fileIri, { at: timestamp })),
      "annotator"
    );
  };
  const downloadWithoutUnconfirmed = () => {
    trackPromise(
      dispatch(
        exportFileContent(fileIri, { withoutUnconfirmedOccurrences: true })
      ),
      "annotator"
    );
  };

  return (
    <UncontrolledButtonDropdown
      id="annotator-download"
      color="primary"
      className="ml-1 mr-2"
    >
      <DropdownToggle
        size="sm"
        caret={false}
        color="primary"
        style={{ borderRadius: "0.2rem" }}
      >
        <FaCloudDownloadAlt className="mr-1" />
        <span className="dropdown-toggle">
          {i18n("resource.metadata.file.content.download")}
        </span>
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem key="download-current" onClick={downloadCurrentFile}>
          {i18n("annotator.download.thisFile")}
        </DropdownItem>
        <DropdownItem key="download-original" onClick={downloadOriginalFile}>
          {i18n("annotator.download.original")}
        </DropdownItem>
        <DropdownItem
          key="download-without-unconfirmed"
          onClick={downloadWithoutUnconfirmed}
        >
          {i18n("annotator.download.withoutUnconfirmed")}
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledButtonDropdown>
  );
};

export default AnnotatorDownloadActions;
