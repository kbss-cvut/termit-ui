import { CardBody, Col, Label, Row } from "reactstrap";
import Resource from "../../model/Resource";
import { useI18n } from "../hook/useI18n";
import OutgoingLink from "../misc/OutgoingLink";
import MarkdownView from "../misc/MarkdownView";

interface ResourceMetadataProps {
  resource: Resource;
  additionalColumns?: JSX.Element | null;
}

const ResourceMetadata = (props: ResourceMetadataProps) => {
  const { i18n } = useI18n();
  return (
    <div>
      <CardBody className="card-body-basic-info pl-0">
        <Row>
          <Col xl={2} md={4}>
            <Label className="attribute-label mb-3">
              {i18n("asset.label")}
            </Label>
          </Col>
          <Col xl={10} md={8}>
            <OutgoingLink
              iri={props.resource.iri}
              label={props.resource.label}
            />
          </Col>
        </Row>
        <Row>
          <Col xl={2} md={4}>
            <Label className="attribute-label mb-3">
              {i18n("resource.metadata.description")}
            </Label>
          </Col>
          <Col xl={10} md={8}>
            <MarkdownView id="resource-metadata-description">
              {props.resource.description}
            </MarkdownView>
          </Col>
        </Row>
        {props.additionalColumns}
      </CardBody>
    </div>
  );
};

export default ResourceMetadata;
