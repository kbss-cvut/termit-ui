import { Button, Col, Form, FormGroup, Row } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import "./ImportVocabularyDialog.scss";
import Select from "react-select";
import RdfsResource from "../../../model/RdfsResource";
import { getLocalized } from "../../../model/MultilingualString";
import { useState } from "react";

interface ImportExternalVocabularyDialogProps {
  propKeyPrefix: string;
  getList: RdfsResource[];
  onCreate: (selectedIris: string[], rename: boolean) => any;
  onCancel: () => void;
  allowRename?: boolean;
}

const ImportExternalVocabularyDialog = (
  props: ImportExternalVocabularyDialogProps
) => {
  const { i18n, locale } = useI18n();

  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const options = props.getList.map((item) => ({
    value: item.iri,
    label: getLocalized(item.label, locale),
  }));

  // Function for sending selected options
  const handleImport = () => {
    const selectedIris = selectedOptions.map((opt) => opt.value);
    props.onCreate(selectedIris, true);
  };
  return (
    <Form id="vocabulary-import" className="m-import-vocabulary">
      <Row>
        <Col xs={12}>
          {options.length === 0 && (
            <p className="text-warning">
              {i18n("vocabulary.import.dialog.external.errormessage")}
            </p>
          )}
          <FormGroup>
            <Select
              id="SelectVocabulariesReact"
              isMulti
              options={options}
              value={selectedOptions}
              onChange={(selected) =>
                setSelectedOptions(
                  selected as { value: string; label: string }[]
                )
              }
            />
          </FormGroup>

          <Button
            id="importVocabulariesButton"
            isDisabled={options.length === 0}
            onClick={handleImport}
          >
            {i18n("vocabulary.import.dialog.external.button")}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ImportExternalVocabularyDialog;
