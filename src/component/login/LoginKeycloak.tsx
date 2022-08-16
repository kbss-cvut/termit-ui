import React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { useKeycloak } from "@react-keycloak/web";
import { Redirect } from "react-router-dom";
import Routes from "../../util/Routes";
import { Card, CardBody, CardHeader } from "reactstrap";
import Constants from "src/util/Constants";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { loginKeycloak } from "../../action/AsyncUserActions";

interface LoginProps extends HasI18n {
  login: () => void;
}

let loginTimer: any = null;

export const Login: React.FC<LoginProps> = (props) => {
  const { login, i18n } = props;
  const { keycloak } = useKeycloak();

  const loginCallback = React.useCallback(() => {
    login();
  }, [login]);

  if (keycloak.authenticated) {
    return <Redirect to={Routes.dashboard.path} />;
  } else {
    if (!loginTimer) {
      loginTimer = setTimeout(() => loginCallback(), 1000);
    }

    return (
      <Card>
        <CardHeader tag="h2">{Constants.APP_NAME}</CardHeader>
        <CardBody>{i18n("auth.redirect-message")}</CardBody>
      </Card>
    );
  }
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    login: () => dispatch(loginKeycloak),
  };
})(injectIntl(withI18n(Login)));
