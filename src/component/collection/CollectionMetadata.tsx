import { Card, CardBody, Col, Label, Row } from "reactstrap";
import MarkdownView from "../misc/MarkdownView";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import { FunctionComponent } from "react";
import { SkosCollectionDto } from "../../model/Collection";
import { useI18n } from "../hook/useI18n";

export interface CollectionMetadataProps {
  collection: SkosCollectionDto | null;
  shortLocale: string;
}

export const CollectionMetadata: FunctionComponent<CollectionMetadataProps> = ({
  collection,
  shortLocale,
}) => {
  const { i18n } = useI18n();

  return (
    <>
      <Card className="mb-3">
        <CardBody className="card-body-basic-info">
          <Row>
            <Col xl={2} md={4}>
              <Label className="attribute-label mb-3">
                {i18n("collection.description")}
              </Label>
            </Col>
            <Col xl={10} md={8}>
              <MarkdownView id="collection-metadata-comment">
                {getLocalizedOrDefault(
                  collection?.description,
                  "",
                  shortLocale
                )}
              </MarkdownView>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Row>{/*<Col xs={12}>{renderTabs()}</Col>*/}</Row>
        </CardBody>
      </Card>
    </>
  );
};
