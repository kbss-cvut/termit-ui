import * as React from "react";
import {injectIntl} from "react-intl";
import {Card, CardBody, Col} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routes from "../../util/Routes";
import {Link} from "react-router-dom";
import {GoPlus} from "react-icons/go";
import ResourceList from "./ResourceList";
import HeaderWithActions from "../misc/HeaderWithActions";
import Constants from "../../util/Constants";
import {Helmet} from "react-helmet";

class ResourceManagement extends React.Component<HasI18n> {
    public render() {
        const i18n = this.props.i18n;

        const buttons = <Link id="resources-create" key="resource.management.create" to={Routes.createResource.path}
                              className="btn btn-primary btn-sm" title={i18n("resource.management.create.tooltip")}>
            <GoPlus/>&nbsp;{i18n("resource.management.new")}
        </Link>;

        return <div>
            <Helmet>
                <title>{`${i18n("main.nav.resources")} | ${Constants.APP_NAME}`}</title>
            </Helmet>
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
        </div>;
    }
}

export default injectIntl(withI18n(ResourceManagement));
