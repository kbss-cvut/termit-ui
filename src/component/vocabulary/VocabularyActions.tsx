import React from "react";
import { useI18n } from "../hook/useI18n";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import {
  GoClippy,
  GoCloudDownload,
  GoCloudUpload,
  GoRepoForked,
} from "react-icons/go";
import ImportBackupOfVocabulary from "./importing/ImportBackupOfVocabulary";
import { FaCamera } from "react-icons/fa";
import Vocabulary from "../../model/Vocabulary";
import IfVocabularyActionAuthorized from "./authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";
import IfUserIsAdmin from "../authorization/IfUserIsAdmin";
import If from "../misc/If";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import Utils from "../../util/Utils";
import OpenModelingToolDialog from "./modeling/OpenModelingToolDialog";

interface VocabularyActionsProps {
  vocabulary: Vocabulary;
  onAnalyze: () => void;
  onExport: () => void;
  onImport: (file: File, rename: Boolean) => Promise<any>;
  onCreateSnapshot: () => void;
}

const VocabularyActions: React.FC<VocabularyActionsProps> = ({
  vocabulary,
  onAnalyze,
  onExport,
  onImport,
  onCreateSnapshot,
}) => {
  const { i18n } = useI18n();
  const [showImportDialog, setShowImportDialog] = React.useState(false);
  const [showModelingDialog, setShowModelingDialog] = React.useState(false);
  const config = useSelector((state: TermItState) => state.configuration);

  return (
    <>
      <ImportBackupOfVocabulary
        onImport={onImport}
        showDialog={showImportDialog}
        closeDialog={() => setShowImportDialog(false)}
      />
      <OpenModelingToolDialog
        open={showModelingDialog}
        onClose={() => setShowModelingDialog(false)}
        vocabulary={vocabulary}
      />
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
          <IfVocabularyActionAuthorized
            requiredAccessLevel={AccessLevel.SECURITY}
            key="vocabulary-import"
            vocabulary={vocabulary}
          >
            <DropdownItem
              className="btn-sm"
              onClick={() => setShowImportDialog(true)}
              title={i18n("vocabulary.summary.import.action.tooltip")}
            >
              <GoCloudUpload className="mr-1" />
              {i18n("vocabulary.summary.import.action")}
            </DropdownItem>
          </IfVocabularyActionAuthorized>
          <IfVocabularyActionAuthorized
            requiredAccessLevel={AccessLevel.WRITE}
            key="vocabulary-analyze"
            vocabulary={vocabulary}
          >
            <DropdownItem
              name="vocabulary-analyze"
              className="btn-sm"
              onClick={onAnalyze}
              title={i18n("vocabulary.summary.startTextAnalysis.title")}
            >
              <GoClippy className="mr-1 align-text-top" />
              {i18n("file.metadata.startTextAnalysis.text")}
            </DropdownItem>
          </IfVocabularyActionAuthorized>
          <IfUserIsAdmin key="vocabulary-snapshot">
            <DropdownItem
              name="vocabulary-snapshot"
              className="btn-sm"
              onClick={onCreateSnapshot}
              title={i18n("vocabulary.snapshot.create.title")}
            >
              <FaCamera className="mr-1 align-text-top" />
              {i18n("vocabulary.snapshot.create.label")}
            </DropdownItem>
          </IfUserIsAdmin>
          <If expression={Utils.notBlank(config.modelingToolUrl)}>
            <IfVocabularyActionAuthorized
              vocabulary={vocabulary}
              requiredAccessLevel={AccessLevel.WRITE}
              key="vocabulary-model"
            >
              <DropdownItem
                name="vocabulary-model"
                className="btn-sm"
                title={i18n("vocabulary.summary.model.title")}
                onClick={() => setShowModelingDialog(true)}
              >
                <GoRepoForked className="mr-1 align-text-top" />
                {i18n("vocabulary.summary.model.label")}
              </DropdownItem>
            </IfVocabularyActionAuthorized>
          </If>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
    </>
  );
};

export default VocabularyActions;
