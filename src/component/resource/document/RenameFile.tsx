import { useI18n } from "../../hook/useI18n";
import { useState } from "react";
import IfUserIsEditor from "../../authorization/IfUserIsEditor";
import { Button } from "reactstrap";
import { GoPencil } from "react-icons/go";
import TermItFile from "../../../model/File";
import RenameFileDialog from "../../asset/RenameFileDialog";

interface RenameFileProps {
  performAction: (file: TermItFile) => Promise<void>;
  file: TermItFile;
}

export const RenameFile = (props: RenameFileProps) => {
  const { i18n } = useI18n();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const toggle = () => setConfirmationDialogOpen(!confirmationDialogOpen);

  const performAction = (label: string) => {
    const modifiedFile = Object.assign({}, props.file, { label: label.trim() });
    props.performAction(modifiedFile).then(toggle);
  };
  return (
    <IfUserIsEditor>
      <RenameFileDialog
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

export default RenameFile;
