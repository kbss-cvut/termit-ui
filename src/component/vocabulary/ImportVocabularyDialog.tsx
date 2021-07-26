import { useState } from "react";
import { Button, ButtonToolbar, Col, Form, Row } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import UploadFile from "../resource/file/UploadFile";
import assert from "assert";
import CustomCheckBoxInput from "../misc/CustomCheckboxInput";
import classNames from "classnames";

interface ImportVocabularyDialogProps {
  onCreate: (file: File, rename: Boolean) => any;
  onCancel: () => void;
}

export const ImportVocabularyDialog = (props: ImportVocabularyDialogProps) => {
  const { i18n } = useI18n();
  const [file, setFile] = useState<File>();
  const [rename, setRename] = useState<Boolean>(false);

  const onCreate = () => {
    assert(file);
    props.onCreate(file, rename);
  };

  const setFileAndStopDragging = (file: File) => setFile(file);
  const setAllowChangingIdentifiers = () => setRename(!rename);
  const cannotSubmit = () => !file;

  return (
    <Form>
      <UploadFile setFile={setFileAndStopDragging} />
      <Row>
        <Col xs={12}>
          <CustomCheckBoxInput
            className={classNames("checkbox")}
            label={i18n("vocabulary.import.allow-changing-identifiers")}
            onChange={setAllowChangingIdentifiers}
            hint={i18n("vocabulary.import.allow-changing-identifiers.tooltip")}
          />
          <ButtonToolbar className="d-flex justify-content-center mt-4">
            <Button
              id="upload-file-submit"
              onClick={onCreate}
              color="success"
              size="sm"
              disabled={cannotSubmit()}
            >
              {i18n("vocabulary.summary.import.action")}
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
