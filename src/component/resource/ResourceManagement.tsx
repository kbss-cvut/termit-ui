import * as React from "react";
import {Card, CardBody, Col} from "reactstrap";
import Routes from "../../util/Routes";
import {Link} from "react-router-dom";
import {GoPlus} from "react-icons/go";
import ResourceList from "./ResourceList";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import IfUserAuthorized from "../authorization/IfUserAuthorized";
import {useI18n} from "../hook/useI18n";

const ResourceManagement: React.FC = () => {
    const {i18n} = useI18n();

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

export default ResourceManagement;
