import { useState } from "react";
import { Button, ButtonToolbar, Col, Form, Row } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import UploadFile from "../resource/file/UploadFile";
import CustomCheckBoxInput from "../misc/CustomCheckboxInput";
import "./ImportVocabularyDialog.scss";

interface ImportVocabularyDialogProps {
  propKeyPrefix: string;
  onCreate: (file: File, rename: Boolean) => any;
  onCancel: () => void;
  allowRename?: boolean;
}

const ImportVocabularyDialog = (props: ImportVocabularyDialogProps) => {
  const { i18n } = useI18n();
  const [file, setFile] = useState<File>();
  const [rename, setRename] = useState<Boolean>(false);

  const onCreate = () => {
    if (!file) {
      return;
    }
    props.onCreate(file, rename);
  };

  const setFileAndStopDragging = (file: File) => setFile(file);
  const setAllowChangingIdentifiers = () => setRename(!rename);
  const cannotSubmit = () => !file;

  return (
    <Form id="vocabulary-import" className="m-import-vocabulary">
      <UploadFile setFile={setFileAndStopDragging} />
      <Row>
        <Col xs={12}>
          {props.allowRename && (
            <CustomCheckBoxInput
              name="vocabulary-import-rename"
              className="override-identifiers"
              label={i18n("vocabulary.import.allow-changing-identifiers")}
              onChange={setAllowChangingIdentifiers}
              hint={i18n(
                "vocabulary.import.allow-changing-identifiers.tooltip"
              )}
            />
          )}
          <ButtonToolbar className="d-flex justify-content-center mt-4">
            <Button
              id="upload-file-submit"
              onClick={onCreate}
              color="success"
              size="sm"
              disabled={cannotSubmit()}
            >
              {i18n(props.propKeyPrefix + ".action")}
            </Button>
            <Button
              id="upload-file-cancel"
              onClick={props.onCancel}
              color="outline-dark"
              size="sm"
            >
              {i18n("cancel")}
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    </Form>
  );
};

export default ImportVocabularyDialog;
