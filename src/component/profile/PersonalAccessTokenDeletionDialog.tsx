import * as React from "react";
import { useI18n } from "../hook/useI18n";
import SingleActionDialog from "../misc/SingleActionDialog";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { PersonalAccessToken } from "../../model/PersonalAccessToken";
import { PERSONAL_ACCESS_TOKENS_PROMISE_AREA } from "./PersonalAccessTokensList";
import { deletePersonalAccessToken } from "../../action/AsyncUserActions";
import { trackPromise } from "react-promise-tracker";
import PersonalAccessTokenTable from "./PersonalAccessTokenTable";
import { FormattedMessage } from "react-intl";

interface PersonalAccessTokenCreationResultDialogProps {
  token: PersonalAccessToken | null;
  onClose: () => void;
}

const PersonalAccessTokenCreationResultDialog: React.FC<
  PersonalAccessTokenCreationResultDialogProps
> = ({ token, onClose }) => {
  const { i18n } = useI18n();
  const isTokenPresent = token != null;
  const dispatch: ThunkDispatch = useDispatch();

  const deleteToken = () => {
    if (!token) return;
    trackPromise(
      dispatch(deletePersonalAccessToken(token.iri)),
      PERSONAL_ACCESS_TOKENS_PROMISE_AREA
    ).then(onClose);
  };

  return (
    <SingleActionDialog
      show={isTokenPresent}
      onClose={onClose}
      onAction={deleteToken}
      id={"create-pat-result-dialog"}
      title={i18n("profile.pat.delete.confirm")}
      actionColor={"danger"}
      actionButtonText={i18n("remove")}
    >
      <FormattedMessage
        id={"profile.pat.delete.confirm.description"}
        tagName={"p"}
      />
      <PersonalAccessTokenTable tokens={token ? [token] : []} />
    </SingleActionDialog>
  );
};

export default PersonalAccessTokenCreationResultDialog;
