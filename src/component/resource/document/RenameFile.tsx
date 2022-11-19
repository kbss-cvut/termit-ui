import { useI18n } from "../../hook/useI18n";
import { useState } from "react";
import IfUserIsEditor from "../../authorization/IfUserIsEditor";
import { Button } from "reactstrap";
import { GoPencil } from "react-icons/go";
import TermItFile from "../../../model/File";
import RenameFileDialog from "../../asset/RenameFileDialog";

interface RenameFileProps {
  performAction: (file: TermItFile) => Promise<void>;
  withConfirmation: boolean;
  file: TermItFile;
}

export const RenameFile = (props: RenameFileProps) => {
  const { i18n } = useI18n();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const toggle = () => setConfirmationDialogOpen(!confirmationDialogOpen);

  const performAction = () => {
    props.performAction(props.file).then(toggle);
  };
  return (
    <IfUserIsEditor>
      <RenameFileDialog
        onCancel={toggle}
        onSubmit={performAction}
        show={confirmationDialogOpen}
        asset={props.file}
      />
      <Button
        color="success"
        size="sm"
        onClick={props.withConfirmation ? toggle : performAction}
        title={i18n("edit")}
      >
        <GoPencil className="mr-1" />
        {i18n("edit")}
      </Button>
    </IfUserIsEditor>
  );
};

export default RenameFile;
