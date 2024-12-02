import React, { useState } from "react";
import { Alert, Modal, ModalBody, ModalHeader } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import { FormattedMessage } from "react-intl";
import ImportVocabularyDialog from "./ImportVocabularyDialog";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { downloadExcelTemplate } from "../../../action/AsyncImportActions";
import TermItState from "../../../model/TermItState";
import Tabs from "../../misc/Tabs";
import { ImportTranslationsDialog } from "./ImportTranslationsDialog";

interface LoadVocabularyFromFileProps {
  showDialog: boolean;
  onImport: (file: File, translationsOnly: boolean) => Promise<any>;
  closeDialog: () => void;
}

export const LoadVocabularyFromFile: React.FC<LoadVocabularyFromFileProps> = ({
  showDialog,
  closeDialog,
  onImport,
}) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState<string>(
    "vocabulary.summary.import.dialog.tab.replaceContent"
  );
  const onClose = () => {
    closeDialog();
    setSelectedTab("vocabulary.summary.import.dialog.tab.replaceContent");
  };
  const onImportContent = (file: File) =>
    trackPromise(onImport(file, false), "vocabulary-import").then(onClose);
  const onImportTranslations = (file: File) => {
    trackPromise(onImport(file, true), "vocabulary-import").then(onClose);
  };
  const downloadTemplate = () => {
    dispatch(downloadExcelTemplate());
  };
  const downloadTranslationsTemplate = () => {
    dispatch(downloadExcelTemplate(true));
  };
  const vocabularyNotEmpty =
    (useSelector((state: TermItState) => state.vocabulary.termCount) || 0) > 0;

  return (
    <>
      <Modal isOpen={showDialog} toggle={onClose}>
        <ModalHeader>
          {i18n("vocabulary.summary.import.dialog.title")}
        </ModalHeader>
        <ModalBody>
          <PromiseTrackingMask area="vocabulary-import" />
          <Tabs
            activeTabLabelKey={selectedTab}
            contentClassName="mt-3"
            tabs={{
              "vocabulary.summary.import.dialog.tab.replaceContent": (
                <>
                  <div className="mb-1">
                    <FormattedMessage id="vocabulary.summary.import.dialog.label" />
                  </div>
                  <ul>
                    <li>
                      <FormattedMessage id="vocabulary.summary.import.dialog.skosImport" />
                    </li>
                    <li>
                      <FormattedMessage
                        id="vocabulary.summary.import.dialog.excelImport"
                        values={{
                          a: (chunks: any) => (
                            <span
                              role="button"
                              className="bold btn-link link-like"
                              onClick={downloadTemplate}
                              title={i18n(
                                "vocabulary.summary.import.excel.template.tooltip"
                              )}
                            >
                              {chunks}
                            </span>
                          ),
                        }}
                      />
                    </li>
                  </ul>
                  {vocabularyNotEmpty && (
                    <Alert color="warning">
                      <FormattedMessage id="vocabulary.summary.import.nonEmpty.warning" />
                    </Alert>
                  )}
                  <ImportVocabularyDialog
                    propKeyPrefix="vocabulary.summary.import"
                    onCreate={onImportContent}
                    onCancel={onClose}
                    allowRename={false}
                  />
                </>
              ),
              "vocabulary.summary.import.dialog.tab.translations": (
                <ImportTranslationsDialog
                  onSubmit={onImportTranslations}
                  onCancel={onClose}
                  onDownloadTemplate={downloadTranslationsTemplate}
                />
              ),
            }}
            changeTab={setSelectedTab as (t: string) => void}
          />
        </ModalBody>
      </Modal>
    </>
  );
};

export default LoadVocabularyFromFile;
