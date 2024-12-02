import React from "react";
import UploadFile from "../../resource/file/UploadFile";
import { Button, ButtonToolbar, Col, Form, Row } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import { FormattedMessage } from "react-intl";

export const ImportTranslationsDialog: React.FC<{
  onSubmit: (file: File) => void;
  onCancel: () => void;
  onDownloadTemplate: () => void;
}> = ({ onSubmit, onCancel, onDownloadTemplate }) => {
  const { i18n } = useI18n();
  const [file, setFile] = React.useState<File>();
  const cannotSubmit = () => !file;
  return (
    <>
      <Form id="vocabulary-translations-import">
        <div className="mb-3">
          <FormattedMessage
            id="vocabulary.summary.import.translations.label"
            values={{
              a: (chunks: any) => (
                <span
                  role="button"
                  className="bold btn-link link-like"
                  onClick={onDownloadTemplate}
                  title={i18n(
                    "vocabulary.summary.import.excel.template.tooltip"
                  )}
                >
                  {chunks}
                </span>
              ),
            }}
          />
        </div>
        <UploadFile setFile={setFile} />
        <Row>
          <Col xs={12}>
            <ButtonToolbar className="d-flex justify-content-center mt-4">
              <Button
                id="upload-translations-file-submit"
                onClick={() => onSubmit(file!)}
                color="success"
                size="sm"
                disabled={cannotSubmit()}
              >
                {i18n("vocabulary.summary.import.action")}
              </Button>
              <Button
                id="upload-translations-file-cancel"
                onClick={onCancel}
                color="outline-dark"
                size="sm"
              >
                {i18n("cancel")}
              </Button>
            </ButtonToolbar>
          </Col>
        </Row>
      </Form>
    </>
  );
};
