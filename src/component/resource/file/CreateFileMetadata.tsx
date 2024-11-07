import React from "react";
import { Button, ButtonToolbar, Col, Form, Row } from "reactstrap";
import UploadFile from "./UploadFile";
import TermItFile from "../../../model/File";
import CustomInput from "../../misc/CustomInput";
import { useI18n } from "../../hook/useI18n";

interface CreateFileMetadataProps {
  onCreate: (termItFile: TermItFile, file: File) => any;
  onCancel: () => void;
}

const CreateFileMetadata: React.FC<CreateFileMetadataProps> = ({
  onCreate,
  onCancel,
}) => {
  const { i18n } = useI18n();
  const [label, setLabel] = React.useState("");
  const [file, setFile] = React.useState<File>();

  const onFileSelected = (file: File) => {
    setFile(file);
    setLabel(file.name);
  };
  const onSubmit = () => {
    if (file) {
      onCreate(
        new TermItFile({
          iri: "",
          label,
        }),
        file
      );
    }
  };
  const cannotSubmit = () => {
    return !file || label.trim().length === 0;
  };

  return (
    <Form>
      <UploadFile setFile={onFileSelected} />
      <Row>
        <Col xs={12}>
          <CustomInput
            name="create-resource-label"
            label={i18n("asset.label")}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            hint={i18n("required")}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <ButtonToolbar className="d-flex justify-content-center mt-4">
            <Button
              id="create-resource-submit"
              onClick={onSubmit}
              color="success"
              size="sm"
              disabled={cannotSubmit()}
            >
              {i18n("file.upload")}
            </Button>
            <Button
              id="create-resource-cancel"
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
  );
};

export default CreateFileMetadata;
