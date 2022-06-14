import React from "react";
import { useI18n } from "../hook/useI18n";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { GoClippy, GoCloudDownload } from "react-icons/go";
import ImportBackupOfVocabulary from "./ImportBackupOfVocabulary";
import IfUserAuthorized from "../authorization/IfUserAuthorized";

interface VocabularyActionsProps {
  onAnalyze: () => void;
  onExport: () => void;
  onImport: (file: File, rename: Boolean) => Promise<any>;
}

const VocabularyActions: React.FC<VocabularyActionsProps> = ({
  onAnalyze,
  onExport,
  onImport,
}) => {
  const { i18n } = useI18n();

  return (
    <UncontrolledButtonDropdown className="ml-1">
      <DropdownToggle
        size="sm"
        caret={false}
        color="primary"
        style={{ borderRadius: "0.2rem" }}
      >
        <span className="dropdown-toggle">{i18n("moreActions")}</span>
      </DropdownToggle>
      <DropdownMenu className="vocabulary-actions-menu" right={true}>
        <DropdownItem
          key="vocabulary-export"
          name="vocabulary-export"
          className="btn-sm"
          onClick={onExport}
          title={i18n("vocabulary.summary.export.title")}
        >
          <GoCloudDownload className="mr-1" />
          {i18n("vocabulary.summary.export.text")}
        </DropdownItem>
        <IfUserAuthorized
          key="vocabulary-import"
          renderUnauthorizedAlert={false}
        >
          <ImportBackupOfVocabulary performAction={onImport} />
        </IfUserAuthorized>
        <IfUserAuthorized
          key="vocabulary-analyze"
          renderUnauthorizedAlert={false}
        >
          <DropdownItem
            name="vocabulary-analyze"
            className="btn-sm"
            onClick={onAnalyze}
            title={i18n("vocabulary.summary.startTextAnalysis.title")}
          >
            <GoClippy className="mr-1" />
            {i18n("file.metadata.startTextAnalysis.text")}
          </DropdownItem>
        </IfUserAuthorized>
      </DropdownMenu>
    </UncontrolledButtonDropdown>
  );
};

export default VocabularyActions;
