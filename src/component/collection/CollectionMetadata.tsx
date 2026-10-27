import { Button, Card, CardBody, Col, Label, Row } from "reactstrap";
import MarkdownView from "../misc/MarkdownView";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import { FunctionComponent, useRef } from "react";
import { SkosCollectionDto } from "../../model/Collection";
import { useI18n } from "../hook/useI18n";
import { CollectionMembersList } from "./CollectionMembersList";
import Vocabulary from "../../model/Vocabulary";
import { FormattedMessage } from "react-intl";
import AccessLevel from "../../model/acl/AccessLevel";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import {
  AddCollectionMemberDialog,
  AddCollectionMemberDialogHandle,
} from "./AddCollectionMemberDialog";
import { FaPlus } from "react-icons/fa6";

export interface CollectionMetadataProps {
  collection: SkosCollectionDto | null;
  vocabulary: Vocabulary | null;
  shortLocale: string;
}

export const CollectionMetadata: FunctionComponent<CollectionMetadataProps> = ({
  collection,
  vocabulary,
  shortLocale,
}) => {
  const { i18n } = useI18n();
  const addMemberDialogRef = useRef<AddCollectionMemberDialogHandle>(null);

  const onAddMember = () => {
    addMemberDialogRef.current?.open();
  };

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
          {vocabulary != null && (
            <IfVocabularyActionAuthorized
              key="collection-detail-remove"
              vocabulary={vocabulary}
              requiredAccessLevel={AccessLevel.WRITE}
            >
              <Row className={"justify-content-between mb-3 mx-0"}>
                <FormattedMessage tagName={"h3"} id={"collection.members"} />
                <Button
                  color="success"
                  size="sm"
                  style={{ float: "right" }}
                  onClick={onAddMember}
                >
                  <FaPlus />
                  &nbsp;
                  {i18n("collection.members.add")}
                </Button>
              </Row>
            </IfVocabularyActionAuthorized>
          )}

          <CollectionMembersList
            {...{
              collection,
              vocabulary,
            }}
          />
          {collection && vocabulary && (
            <AddCollectionMemberDialog
              ref={addMemberDialogRef}
              collection={collection}
            />
          )}
        </CardBody>
      </Card>
    </>
  );
};
