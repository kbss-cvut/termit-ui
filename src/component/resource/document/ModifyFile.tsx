import { useI18n } from "../../hook/useI18n";
import { useState } from "react";
import IfUserIsEditor from "../../authorization/IfUserIsEditor";
import { Button } from "reactstrap";
import { GoPencil } from "react-icons/go";
import TermItFile from "../../../model/File";
import ModifyFileDialog from "../../asset/ModifyFileDialog";

interface ModifyFileProps {
  performRename: (file: TermItFile) => Promise<void>;
  performFileUpdate: (termitFile: TermItFile, file: File) => Promise<void>;
  file: TermItFile;
}

export const ModifyFile = (props: ModifyFileProps) => {
  const { i18n } = useI18n();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const toggle = () => setConfirmationDialogOpen(!confirmationDialogOpen);

  const performAction = (label: string, file?: File) => {
    const modifiedFile = Object.assign({}, props.file, { label: label.trim() });
    props
      .performRename(modifiedFile)
      .then(() => {
        if (file) return props.performFileUpdate(props.file, file);
        else return Promise.resolve();
      })
      .then(toggle);
  };
  return (
    <IfUserIsEditor>
      <ModifyFileDialog
        onCancel={toggle}
        onSubmit={performAction}
        show={confirmationDialogOpen}
        asset={props.file}
      />
      <Button color="primary" size="sm" onClick={toggle} title={i18n("edit")}>
        <GoPencil className="mr-1" />
        {i18n("edit")}
      </Button>
    </IfUserIsEditor>
  );
};

export default ModifyFile;
