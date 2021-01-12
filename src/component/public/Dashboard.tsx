import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import {Button, ButtonToolbar, Container, Jumbotron} from "reactstrap";
import {Link} from "react-router-dom";
import Routes from "../../util/Routes";
import "./Dashboard.scss";

const Dashboard: React.FC<HasI18n> = props => {
    const {i18n} = props;
    return <Jumbotron fluid={true}>
        <Container fluid={true}>
            <h1>{i18n("public.dashboard.title")}</h1>
            <p className="lead">{i18n("public.dashboard.intro")}</p>
            <hr className="my-2"/>
            <ButtonToolbar>
                <Link to={Routes.login.path}><Button size="lg">{i18n("public.dashboard.actions.login")}</Button></Link>
                <Link to={Routes.publicVocabularies.path} className="ml-3"><Button
                    size="lg">{i18n("public.dashboard.actions.vocabularies")}</Button></Link>
            </ButtonToolbar>
        </Container>
    </Jumbotron>;
};

export default injectIntl(withI18n(Dashboard));
