import { Card, CardBody, CardHeader } from "reactstrap";
import { ImportVocabularyDialog } from "./ImportVocabularyDialog";
import { useI18n } from "../hook/useI18n";

interface ImportVocabularyPanelProps {
  propKeyPrefix: string;
  onSubmit: (file: File, rename: Boolean) => Promise<any>;
  onCancel: () => any;
}

export const ImportVocabularyPanel = (props: ImportVocabularyPanelProps) => {
  const { i18n } = useI18n();

  return (
    <Card id={props.propKeyPrefix}>
      <CardHeader color="info">
        <h5>{i18n(props.propKeyPrefix + ".dialog.title")}</h5>
      </CardHeader>
      <CardBody>
        <h5>{i18n(props.propKeyPrefix + ".dialog.message")}</h5>
        <ImportVocabularyDialog
          onCreate={props.onSubmit}
          onCancel={props.onCancel}
        />
      </CardBody>
    </Card>
  );
};

export default ImportVocabularyPanel;
