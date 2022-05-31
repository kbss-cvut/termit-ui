import ImportVocabularyDialog from "./ImportVocabularyDialog";
import { useI18n } from "../hook/useI18n";
import { FormGroup, Label } from "reactstrap";

interface ImportVocabularyPanelProps {
  propKeyPrefix: string;
  onSubmit: (file: File, rename: Boolean) => Promise<any>;
  onCancel: () => any;
  allowRename?: boolean;
}

export const ImportVocabularyPanel = (props: ImportVocabularyPanelProps) => {
  const { i18n } = useI18n();

  return (
    <>
      <FormGroup className="mb-0">
        <Label className="attribute-label mb-2">
          {i18n(props.propKeyPrefix + ".dialog.message")}
        </Label>
      </FormGroup>
      <ImportVocabularyDialog
        propKeyPrefix={props.propKeyPrefix}
        onCreate={props.onSubmit}
        onCancel={props.onCancel}
        allowRename={props.allowRename}
      />
    </>
  );
};

export default ImportVocabularyPanel;
