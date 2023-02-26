import * as React from "react";
import { UserAccountData } from "../../../model/User";
import { AsyncFailureAction } from "../../../action/ActionType";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { createNewUser } from "../../../action/AsyncUserActions";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import RegistrationForm from "../../register/RegistrationForm";
import AsyncActionStatus from "../../../action/AsyncActionStatus";
import { Card, CardBody } from "reactstrap";
import HeaderWithActions from "../../misc/HeaderWithActions";
import { useI18n } from "../../hook/useI18n";

export const CreateNewUser: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const onRegister = (userData: UserAccountData) => {
    return dispatch(createNewUser(userData)).then((result) => {
      if ((result as AsyncFailureAction).status !== AsyncActionStatus.FAILURE) {
        Routing.transitionTo(Routes.administration);
      }
      return Promise.resolve(result);
    });
  };
  const onCancel = () => Routing.transitionTo(Routes.administration);

  return (
    <>
      <HeaderWithActions title={i18n("administration.users.create")} />
      <Card id="administration-new-user-registration">
        <CardBody>
          <RegistrationForm
            loading={false}
            register={onRegister}
            cancel={onCancel}
          />
        </CardBody>
      </Card>
    </>
  );
};

export default CreateNewUser;
