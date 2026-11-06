import { Button, Card, CardBody, Col, Label, Row } from "reactstrap";
import MarkdownView from "../misc/MarkdownView";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import { FunctionComponent, useMemo, useRef, useState } from "react";
import { SkosCollection } from "../../model/Collection";
import { useI18n } from "../hook/useI18n";
import {
  CollectionMembersList,
  CollectionMembersListProps,
} from "./CollectionMembersList";
import Vocabulary from "../../model/Vocabulary";
import AccessLevel from "../../model/acl/AccessLevel";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import {
  AddCollectionMemberDialog,
  AddCollectionMemberDialogHandle,
} from "./AddCollectionMemberDialog";
import { FaPlus } from "react-icons/fa6";
import { CustomAttributesValues } from "../genericmetadata/CustomAttributesValues";
import Tabs from "../misc/Tabs";
import UnmappedProperties from "../genericmetadata/UnmappedProperties";
import { useAppSelector } from "../../util/Types";
import AssetHistory from "../changetracking/AssetHistory";

interface CollectionAndVocabulary {
  collection: SkosCollection | null;
  vocabulary: Vocabulary | null;
}

export interface CollectionMetadataProps extends CollectionAndVocabulary {
  shortLocale: string;
}

enum TabKey {
  MEMBERS = "collection.members",
  HISTORY = "history.label",
  PROPERTIES = "properties.edit.title",
}

export const CollectionMetadata: FunctionComponent<CollectionMetadataProps> = ({
  collection,
  vocabulary,
  shortLocale,
}) => {
  const { i18n } = useI18n();
  const [totalMembersCount, setTotalMembersCount] = useState<number>(0);
  const customAttributes = useAppSelector((state) => state.customAttributes);

  const unmappedPropertiesCount: number = useMemo(() => {
    const knownAttributes = new Set<string>();
    customAttributes.forEach((a) => knownAttributes.add(a.iri));
    // filter known custom properties out of unmapped properties
    const count = collection?.unmappedProperties
      .keys()
      .reduce((n, prop) => (knownAttributes.has(prop) ? n : n + 1), 0);
    return count ?? 0;
  }, [collection, customAttributes]);

  const tabs = useMemo(
    () => ({
      [TabKey.MEMBERS]: (
        <MembersTab {...{ collection, vocabulary, setTotalMembersCount }} />
      ),
      [TabKey.HISTORY]: collection ? <AssetHistory asset={collection} /> : null,
      [TabKey.PROPERTIES]: (
        <UnmappedProperties
          properties={collection?.unmappedProperties ?? new Map()}
          showInfoOnEmpty={true}
        />
      ),
    }),
    [collection, vocabulary]
  );

  const [activeTab, setActiveTab] = useState<TabKey>(TabKey.MEMBERS);

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

          {collection && (
            <CustomAttributesValues asset={collection} language={shortLocale} />
          )}
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Tabs
            activeTabLabelKey={activeTab}
            changeTab={(tab) => setActiveTab(tab as TabKey)}
            tabs={tabs}
            tabBadges={{
              [TabKey.MEMBERS]: totalMembersCount.toFixed(),
              [TabKey.PROPERTIES]: unmappedPropertiesCount.toString(),
            }}
          />
        </CardBody>
      </Card>
    </>
  );
};

const MembersTab: FunctionComponent<CollectionMembersListProps> = (props) => {
  const { collection, vocabulary } = props;
  const { i18n } = useI18n();
  const addMemberDialogRef = useRef<AddCollectionMemberDialogHandle>(null);

  const onAddMember = () => {
    addMemberDialogRef.current?.open();
  };

  if (!collection || !vocabulary) {
    return null;
  }

  return (
    <>
      <IfVocabularyActionAuthorized
        key="collection-detail-remove"
        vocabulary={vocabulary}
        requiredAccessLevel={AccessLevel.WRITE}
      >
        <Row className={"justify-content-end my-2 mx-0"}>
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

      <CollectionMembersList {...props} />

      <AddCollectionMemberDialog
        ref={addMemberDialogRef}
        collection={collection}
      />
    </>
  );
};
