import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Card, CardBody, CardHeader } from "reactstrap";
import Routes from "../../util/Routes";
import Routing from "../../util/Routing";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { ThunkDispatch } from "../../util/Types";
import SecurityUtils from "../../util/SecurityUtils";
import PublicLayout from "../layout/PublicLayout";
import { UserAccountData } from "../../model/User";
import { register } from "../../action/AsyncUserActions";
import RegistrationForm from "./RegistrationForm";
import Constants from "../../util/Constants";
import { Link } from "react-router-dom";
import WindowTitle from "../misc/WindowTitle";
import IfInternalAuth from "../misc/oidc/IfInternalAuth";
import { useI18n } from "../hook/useI18n";

export const Register: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const loading = useSelector((s: TermItState) => s.loading);

  React.useEffect(() => {
    SecurityUtils.clearToken();
  }, []);

  const onRegister = (userData: UserAccountData) =>
    dispatch(register(userData));
  const onCancel = () => Routing.transitionTo(Routes.login);
  return (
    <PublicLayout title={i18n("register.title")}>
      <WindowTitle title={i18n("register.title")} />
      <IfInternalAuth>
        <Card className="modal-panel">
          <CardHeader className="border-bottom-0 pb-0 text-center">
            <h1>{Constants.APP_NAME}</h1>
            <div>{i18n("register.subtitle")}</div>
          </CardHeader>
          <CardBody>
            <RegistrationForm
              register={onRegister}
              cancel={onCancel}
              loading={loading}
            />
            <div className="text-center">
              <FormattedMessage
                id="register.login.label"
                values={{
                  a: (chunks: any) => (
                    <Link
                      id="register-login"
                      data-testid="register-login"
                      to={Routes.login.link()}
                      className="bold"
                    >
                      {chunks}
                    </Link>
                  ),
                }}
              />
            </div>
          </CardBody>
        </Card>
      </IfInternalAuth>
    </PublicLayout>
  );
};

export default Register;
