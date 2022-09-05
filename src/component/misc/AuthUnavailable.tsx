import * as React from "react";
import { Card, CardBody, CardHeader } from "reactstrap";
import Constants from "../../util/Constants";
import { useI18n } from "../hook/useI18n";

const AuthUnavailable: React.FC = () => {
  const { i18n } = useI18n();
  return (
    <Card>
      <CardHeader tag="h2">{Constants.APP_NAME}</CardHeader>
      <CardBody>{i18n("auth.unavailable-message")}</CardBody>
    </Card>
  );
};

export default AuthUnavailable;
