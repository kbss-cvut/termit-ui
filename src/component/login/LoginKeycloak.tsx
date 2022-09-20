import React from "react";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { useKeycloak } from "@react-keycloak/web";
import { Redirect } from "react-router-dom";
import Routes from "../../util/Routes";
import { Card, CardBody, CardHeader } from "reactstrap";
import Constants from "src/util/Constants";
import { loginKeycloak } from "../../action/AsyncUserActions";
import { useI18n } from "../hook/useI18n";

let loginTimer: any = null;

const Login: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const { keycloak } = useKeycloak();

  const loginCallback = React.useCallback(() => {
    dispatch(loginKeycloak());
  }, [dispatch]);

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

export default Login;
