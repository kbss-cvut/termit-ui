import * as React from "react";
import { useI18n } from "../hook/useI18n";
import Vocabulary from "../../model/Vocabulary";
import { Card, CardBody, Col, Label, Row } from "reactstrap";
import UnmappedProperties from "../genericmetadata/UnmappedProperties";
import Tabs from "../misc/Tabs";
import AssetHistory from "../changetracking/AssetHistory";
import TermChangeFrequency from "./TermChangeFrequency";
import Terms from "../term/Terms";
import { Location } from "history";
import { match as Match } from "react-router";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { selectVocabularyTerm } from "../../action/SyncActions";
import Utils from "../../util/Utils";
import DocumentSummary from "../resource/document/DocumentSummary";
import MarkdownView from "../misc/MarkdownView";
import VocabularySnapshots from "./snapshot/VocabularySnapshots";
import AccessControlList from "./acl/AccessControlList";
import AccessLevel, { hasAccess } from "../../model/acl/AccessLevel";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import LanguageSelector from "../multilingual/LanguageSelector";
import { CustomAttributesValues } from "../genericmetadata/CustomAttributesValues";
import VocabulariesReferenceList from "./VocabulariesReferenceList";

interface VocabularyMetadataProps {
  vocabulary: Vocabulary;
  onChange: () => void;
  language: string;
  selectLanguage: (lang: string) => void;
  location: Location;
  match: Match<any>;
}

export const TABS = {
  glossary: "glossary.title",
  document: "type.document",
  history: "history.label",
  snapshots: "snapshots.title",
  changefrequency: "changefrequency.label",
  properties: "properties.edit.title",
  acl: "vocabulary.acl",
};

export const VocabularyMetadata: React.FC<VocabularyMetadataProps> = ({
  vocabulary,
  onChange,
  language,
  selectLanguage,
  location,
  match,
}) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const tabParam: string =
    Utils.extractQueryParam(location.search, "activeTab") || "";
  const tabsArray = Object.values(TABS);
  const [activeTab, setActiveTab] = React.useState<string>(
    tabsArray.indexOf(tabParam) !== -1 ? tabParam : tabsArray[0]
  );
  const vocabularyIri = React.useRef(vocabulary.iri);

  React.useEffect(() => {
    dispatch(selectVocabularyTerm(null));
  }, [dispatch]);
  React.useEffect(() => {
    if (vocabulary.iri !== vocabularyIri.current) {
      vocabularyIri.current = vocabulary.iri;
      setActiveTab(TABS.glossary);
    }
  }, [vocabulary.iri]);

  const renderTabs = () => {
    const tabs = {};

    tabs[TABS.glossary] = (
      <Terms
        vocabulary={vocabulary}
        match={match}
        location={location}
        showTermQualityBadge={true}
      />
    );

    tabs[TABS.document] = (
      <DocumentSummary
        document={vocabulary.document}
        onChange={onChange}
        accessLevel={
          !vocabulary.isEditable() || !vocabulary.accessLevel
            ? AccessLevel.READ
            : vocabulary.accessLevel
        }
      />
    );
    tabs[TABS.history] = <AssetHistory asset={vocabulary} />;
    if (!vocabulary.isSnapshot()) {
      tabs[TABS.snapshots] = <VocabularySnapshots asset={vocabulary} />;
    }
    tabs[TABS.changefrequency] = (
      <TermChangeFrequency vocabulary={vocabulary} />
    );

    tabs[TABS.properties] = (
      <UnmappedProperties
        properties={vocabulary.unmappedProperties}
        showInfoOnEmpty={true}
      />
    );
    if (hasAccess(AccessLevel.SECURITY, vocabulary.accessLevel)) {
      tabs[TABS.acl] = <AccessControlList vocabularyIri={vocabulary.iri} />;
    }

    return (
      <Tabs
        activeTabLabelKey={activeTab}
        changeTab={setActiveTab}
        tabs={tabs}
        tabBadges={{
          "glossary.title": vocabulary.termCount
            ? vocabulary.termCount.toString()
            : null,
          "properties.edit.title": vocabulary.unmappedProperties.size.toFixed(),
        }}
      />
    );
  };

  return (
    <>
      <LanguageSelector
        key="vocabulary-language-selector"
        language={language}
        languages={Vocabulary.getLanguages(vocabulary)}
        onSelect={selectLanguage}
        primaryLanguage={vocabulary.primaryLanguage}
      />
      <Card className="mb-3">
        <CardBody className="card-body-basic-info">
          <Row>
            <Col xl={2} md={4}>
              <Label className="attribute-label mb-3">
                {i18n("vocabulary.comment")}
              </Label>
            </Col>
            <Col xl={10} md={8}>
              <MarkdownView id="vocabulary-metadata-comment">
                {getLocalizedOrDefault(vocabulary.comment, "", language)}
              </MarkdownView>
            </Col>
          </Row>
          <VocabulariesReferenceList
            vocabularies={vocabulary.importedVocabularies}
            labelKey="vocabulary.detail.imports"
            htmlId="vocabulary-imported-vocabularies"
          />
          <VocabulariesReferenceList
            vocabularies={vocabulary.relatedVocabularies}
            labelKey="vocabulary.detail.related"
            htmlId="vocabulary-related-vocabularies"
          />
          <Row>
            <Col xl={2} md={4}>
              <Label className="attribute-label mb-3">
                {i18n("vocabulary.preferredNamespaceUri")}
              </Label>
            </Col>
            <Col xl={10} md={8}>
              {vocabulary.preferredNamespaceUri}
            </Col>
          </Row>
          <Row>
            <Col xl={2} md={4}>
              <Label className="attribute-label mb-3">
                {i18n("vocabulary.preferredNamespacePrefix")}
              </Label>
            </Col>
            <Col xl={10} md={8}>
              {vocabulary.preferredNamespacePrefix}
            </Col>
          </Row>
          <CustomAttributesValues asset={vocabulary} />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <Row>
            <Col xs={12}>{renderTabs()}</Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
};

export default VocabularyMetadata;
