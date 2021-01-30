import * as React from "react";
import {injectIntl} from "react-intl";
import classNames from "classnames";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {CardBody, Col, Label, Row, Table} from "reactstrap";
import ResourceTermAssignments from "./ResourceTermAssignments";
import Resource from "../../model/Resource";
import ResourceLink from "./ResourceLink";

interface ResourceMetadataProps extends HasI18n {
    resource: Resource;
    additionalColumns?: JSX.Element | null;
    inTab?: boolean;
}

const ResourceMetadata = (props: ResourceMetadataProps) =>
    <div className={classNames({"card": !props.inTab, "mb-3": !props.inTab})}>
        <CardBody className={classNames("card-body-basic-info", {"pl-0": props.inTab})}>
            <Table>
                {props.inTab && <Row>
                    <Col xl={2} md={4}>
                        <Label className="attribute-label mb-3">{props.i18n("asset.label")}</Label>
                    </Col>
                    <Col xl={10} md={8}>
                        <ResourceLink id="resource-metadata-label" resource={props.resource || {}}/>
                    </Col>
                </Row>}
                <Row>
                    <Col xl={2} md={4}>
                        <Label className="attribute-label mb-3">{props.i18n("resource.metadata.description")}</Label>
                    </Col>
                    <Col xl={10} md={8}>
                        <p id="resource-metadata-description">{(props.resource || {}).description}</p>
                    </Col></Row>
                {props.additionalColumns}
            </Table>
            <ResourceTermAssignments resource={props.resource}/>
        </CardBody>
    </div>;

export default injectIntl(withI18n(ResourceMetadata));
