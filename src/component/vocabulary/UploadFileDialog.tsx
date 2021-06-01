import { useState } from "react";
import { Button, ButtonToolbar, Col, Form, Row } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import UploadFile from "../resource/file/UploadFile";
import assert from "assert";

interface UploadFileDialogProps {
  onCreate: (file: File) => any;
  onCancel: () => void;
}

export const UploadFileDialog = (props: UploadFileDialogProps) => {
  const { i18n } = useI18n();
  const [file, setFile] = useState<File>();

  const onCreate = () => {
    assert(file);
    props.onCreate(file);
  };

  const setFileAndStopDragging = (file: File) => setFile(file);
  const cannotSubmit = () => !file;

  return (
    <Form>
      <UploadFile setFile={setFileAndStopDragging} />
      <Row>
        <Col xs={12}>
          <ButtonToolbar className="d-flex justify-content-center mt-4">
            <Button
              id="create-resource-submit"
              onClick={onCreate}
              color="success"
              size="sm"
              disabled={cannotSubmit()}
            >
              {i18n("create")}
            </Button>
            <Button
              id="create-resource-cancel"
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
