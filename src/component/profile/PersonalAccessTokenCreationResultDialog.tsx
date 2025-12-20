import * as React from "react";
import { useEffect, useRef } from "react";
import { useI18n } from "../hook/useI18n";
import SingleActionDialog from "../misc/SingleActionDialog";
import CustomInput from "../misc/CustomInput";
import { Button } from "reactstrap";
import If from "../misc/If";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { publishSuccessMessage } from "../../action/SyncActions";

interface PersonalAccessTokenCreationResultDialogProps {
  token: string | null;
  onClose: () => void;
}

function autoSizeTextArea(element: HTMLTextAreaElement) {
  element.style.height = "5px";
  element.style.height = element.scrollHeight + "px";
}

const PersonalAccessTokenCreationResultDialog: React.FC<
  PersonalAccessTokenCreationResultDialogProps
> = ({ token, onClose }) => {
  const { i18n } = useI18n();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isTokenPresent = token != null && token.trim().length > 0;
  const dispatch: ThunkDispatch = useDispatch();

  useEffect(() => {
    if (!inputRef.current) return;
    const areaElement = inputRef.current as HTMLTextAreaElement;
    if (areaElement) {
      autoSizeTextArea(areaElement);
    }
  }, [inputRef.current, token]);

  const copyToken = () => {
    if (isTokenPresent) {
      navigator.clipboard.writeText(token);
      dispatch(
        publishSuccessMessage({
          messageId: "copy.success",
        })
      );
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
        innerRef={inputRef}
        type={"textarea"}
        value={token || "Internal error occurred"}
        readOnly={true}
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
