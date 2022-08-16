import * as React from "react";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { Card, CardBody, CardHeader } from "reactstrap";
import Constants from "../../util/Constants";
import { injectIntl } from "react-intl";

const AuthUnavailable: React.FC<HasI18n> = ({ i18n }) => {
  return (
    <Card>
      <CardHeader tag="h2">{Constants.APP_NAME}</CardHeader>
      <CardBody>{i18n("auth.unavailable-message")}</CardBody>
    </Card>
  );
};

export default injectIntl(withI18n(AuthUnavailable));
