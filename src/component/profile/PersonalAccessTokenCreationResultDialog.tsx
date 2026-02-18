import * as React from "react";
import { useI18n } from "../hook/useI18n";
import SingleActionDialog from "../misc/SingleActionDialog";
import CustomInput from "../misc/CustomInput";
import { Button } from "reactstrap";
import If from "../misc/If";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { publishSuccessMessage } from "../../action/SyncActions";
import "./PersonalAccessTokenCreationResultDialog.scss";

interface PersonalAccessTokenCreationResultDialogProps {
  token: string | null;
  onClose: () => void;
}

const PersonalAccessTokenCreationResultDialog: React.FC<
  PersonalAccessTokenCreationResultDialogProps
> = ({ token, onClose }) => {
  const { i18n } = useI18n();
  const isTokenPresent = token != null && token.trim().length > 0;
  const dispatch: ThunkDispatch = useDispatch();

  const copyToken = () => {
    if (isTokenPresent) {
      navigator.clipboard.writeText(token).then(() => {
        dispatch(
          publishSuccessMessage({
            messageId: "copy.success",
          })
        );
      });
    }
  };

  return (
    <SingleActionDialog
      show={isTokenPresent}
      onClose={onClose}
      onAction={onClose}
      id={"create-pat-result-dialog"}
      title={i18n("profile.pat.success.created")}
      actionColor={"outline-dark"}
      actionButtonText={i18n("close")}
    >
      <CustomInput
        type={"textarea"}
        value={token || "Internal error occurred"}
        readOnly={true}
        className="token-textarea"
      />
      <If expression={!!navigator.clipboard}>
        <Button size={"sm"} color={"primary"} onClick={copyToken}>
          {i18n("copy")}
        </Button>
      </If>
    </SingleActionDialog>
  );
};

export default PersonalAccessTokenCreationResultDialog;
