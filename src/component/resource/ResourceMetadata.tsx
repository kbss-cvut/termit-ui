import classNames from "classnames";
import { CardBody, Col, Label, Row } from "reactstrap";
import ResourceTermAssignments from "./ResourceTermAssignments";
import Resource from "../../model/Resource";
import ResourceLink from "./ResourceLink";
import { useI18n } from "../hook/useI18n";

interface ResourceMetadataProps {
  resource: Resource;
  additionalColumns?: JSX.Element | null;
  inTab?: boolean;
}

const ResourceMetadata = (props: ResourceMetadataProps) => {
  const { i18n } = useI18n();
  return (
    <div className={classNames({ card: !props.inTab, "mb-3": !props.inTab })}>
      <CardBody
        className={classNames("card-body-basic-info", { "pl-0": props.inTab })}
      >
        {props.inTab && (
          <Row>
            <Col xl={2} md={4}>
              <Label className="attribute-label mb-3">
                {i18n("asset.label")}
              </Label>
            </Col>
            <Col xl={10} md={8}>
              <ResourceLink
                id="resource-metadata-label"
                resource={props.resource || {}}
              />
            </Col>
          </Row>
        )}
        <Row>
          <Col xl={2} md={4}>
            <Label className="attribute-label mb-3">
              {i18n("resource.metadata.description")}
            </Label>
          </Col>
          <Col xl={10} md={8}>
            <p id="resource-metadata-description">
              {(props.resource || {}).description}
            </p>
          </Col>
        </Row>
        {props.additionalColumns}
        <ResourceTermAssignments resource={props.resource} />
      </CardBody>
    </div>
  );
};

export default ResourceMetadata;
