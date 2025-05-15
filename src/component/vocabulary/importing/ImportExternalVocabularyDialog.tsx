import { Button, Col, Form, FormGroup, Label, Row } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import "./ImportVocabularyDialog.scss";
import Select from "react-select";
import RdfsResource from "../../../model/RdfsResource";
import { getLocalized } from "../../../model/MultilingualString";

interface ImportExternalVocabularyDialogProps {
  propKeyPrefix: string;
  getList: RdfsResource[];
  onCreate: (file: File, rename: boolean) => any;
  onCancel: () => void;
  allowRename?: boolean;
}

const ImportExternalVocabularyDialog = (
  props: ImportExternalVocabularyDialogProps
) => {
  const { i18n, locale } = useI18n();

  const options = props.getList.map((item) => ({
    value: item.iri,
    label: getLocalized(item.label, locale),
  }));

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
            <Label for="SelectVocabularies">
              Select Multiple (React select)
            </Label>
            <Select id="SelectVocabulariesReact" isMulti options={options} />
          </FormGroup>

          <Button
            id="importVocabulariesButton"
            isDisabled={options.length === 0}
          >
            import selected Vocabularies.
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ImportExternalVocabularyDialog;
