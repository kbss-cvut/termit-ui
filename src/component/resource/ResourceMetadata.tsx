import * as React from "react";
import {injectIntl} from "react-intl";
import classNames from "classnames";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {CardBody, Col, Label, Row} from "reactstrap";
import ResourceTermAssignments from "./ResourceTermAssignments";
import Resource from "../../model/Resource";
import ResourceLink from "./ResourceLink";

interface ResourceMetadataProps extends HasI18n {
    resource: Resource;
    additionalColumns?: JSX.Element | null;
    inTab?: boolean;
}

class ResourceMetadata extends React.Component<ResourceMetadataProps> {
    public render() {
        const i18n = this.props.i18n;
        const resource = this.props.resource || {};
        return <div className={classNames({"card": !this.props.inTab, "mb-3": !this.props.inTab})}>
            <CardBody className={classNames("card-body-basic-info", {"pl-0": this.props.inTab})}>
                {this.props.inTab && <Row>
                    <Col xl={2} md={4}>
                        <Label className="attribute-label">{i18n("asset.label")}:</Label>
                    </Col>
                    <Col xl={10} md={8}>
                        <ResourceLink id="resource-metadata-label" resource={resource}/>
                    </Col>
                </Row>}
                <Row>
                    <Col xl={2} md={4}>
                        <Label className="attribute-label">{i18n("resource.metadata.description")}:</Label>
                    </Col>
                    <Col xl={10} md={8}>
                        <Label id="resource-metadata-description">{resource.description}</Label>
                    </Col>
                </Row>
                {this.props.additionalColumns}
                <ResourceTermAssignments resource={this.props.resource}/>
            </CardBody>
        </div>;
    }
}

export default injectIntl(withI18n(ResourceMetadata));