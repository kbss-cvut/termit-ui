import * as React from "react";
import {injectIntl} from "react-intl";
import {Card, CardBody, Col} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routes from "../../util/Routes";
import {Link} from "react-router-dom";
import {GoPlus} from "react-icons/go";
import ResourceList from "./ResourceList";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import IfUserAuthorized from "../authorization/IfUserAuthorized";

const ResourceManagement: React.FC<HasI18n> = props => {
    const i18n = props.i18n;

    const buttons = <IfUserAuthorized renderUnauthorizedAlert={false}>
        <Link id="resources-create" key="resource.management.create" to={Routes.createResource.path}
              className="btn btn-primary btn-sm" title={i18n("resource.management.create.tooltip")}>
            <GoPlus/>&nbsp;{i18n("resource.management.new")}
        </Link>
    </IfUserAuthorized>;

    return <>
        <WindowTitle title={i18n("main.nav.resources")}/>
        <HeaderWithActions title={i18n("resource.management")} actions={buttons}/>
        <div className="row">
            <Col md={12}>
                <Card>
                    <CardBody>
                        <ResourceList/>
                    </CardBody>
                </Card>
            </Col>
        </div>
    </>;
}

export default injectIntl(withI18n(ResourceManagement));
