import * as React from "react";
import {Button, ButtonToolbar, Container, Jumbotron} from "reactstrap";
import {Link} from "react-router-dom";
import Routes from "../../util/Routes";
import "./Dashboard.scss";
import Constants from "../../util/Constants";
import WindowTitle from "../misc/WindowTitle";
import {useI18n} from "../hook/useI18n";

const Dashboard: React.FC = () => {
  const { i18n } = useI18n();
  return (
    <Jumbotron fluid={true}>
      <WindowTitle title={Constants.APP_NAME} appendAppName={false} />
      <Container fluid={true}>
        <h1>{i18n("public.dashboard.title")}</h1>
        <p className="lead">{i18n("public.dashboard.intro")}</p>
        <hr className="my-2" />
        <ButtonToolbar>
          <Link to={Routes.login.path}>
            <Button size="lg">{i18n("public.dashboard.actions.login")}</Button>
          </Link>
          <Link to={Routes.publicVocabularies.path} className="ml-3">
            <Button size="lg">
              {i18n("public.dashboard.actions.vocabularies")}
            </Button>
          </Link>
        </ButtonToolbar>
      </Container>
    </Jumbotron>
  );
};

export default Dashboard;
