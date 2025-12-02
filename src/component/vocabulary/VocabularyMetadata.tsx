import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Vocabulary from "../../model/Vocabulary";
import { Card, CardBody, Col, Label, Row } from "reactstrap";
import UnmappedProperties from "../genericmetadata/UnmappedProperties";
import ImportedVocabulariesList from "./ImportedVocabulariesList";
import Tabs from "../misc/Tabs";
import AssetHistory from "../changetracking/AssetHistory";
import TermChangeFrequency from "./TermChangeFrequency";
import Terms from "../term/Terms";
import { Location } from "history";
import { match as Match } from "react-router";
import { connect } from "react-redux";
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

interface VocabularyMetadataProps extends HasI18n {
  vocabulary: Vocabulary;
  onChange: () => void;
  resetSelectedTerm: () => void;
  language: string;
  selectLanguage: (lang: string) => void;
  location: Location;
  match: Match<any>;
}

interface VocabularyMetadataState {
  activeTab: string;
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

export class VocabularyMetadata extends React.Component<
  VocabularyMetadataProps,
  VocabularyMetadataState
> {
  constructor(props: VocabularyMetadataProps) {
    super(props);
    const tabParam: string =
      Utils.extractQueryParam(this.props.location.search, "activeTab") || "";
    const tabsArray = Object.values(TABS);
    this.state = {
      activeTab:
        tabsArray.indexOf(tabParam) !== -1
          ? tabsArray[tabsArray.indexOf(tabParam)]
          : tabsArray[0],
    };
  }

  public componentDidMount() {
    this.props.resetSelectedTerm();
  }

  public componentDidUpdate(prevProps: Readonly<VocabularyMetadataProps>) {
    if (this.props.vocabulary.iri !== prevProps.vocabulary.iri) {
      this.setState({ activeTab: TABS.glossary });
    }
  }

  private onTabSelect = (tabId: string) => {
    this.setState({ activeTab: tabId });
  };

  public render() {
    const { i18n, vocabulary, language, selectLanguage } = this.props;

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
                  {getLocalizedOrDefault(
                    vocabulary.comment,
                    "",
                    this.props.language
                  )}
                </MarkdownView>
              </Col>
            </Row>
            <ImportedVocabulariesList
              vocabularies={vocabulary.importedVocabularies}
            />
            <CustomAttributesValues asset={vocabulary} />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Row>
              <Col xs={12}>{this.renderTabs()}</Col>
            </Row>
          </CardBody>
        </Card>
      </>
    );
  }

  private renderTabs() {
    const vocabulary = this.props.vocabulary;
    const tabs = {};

    tabs[TABS.glossary] = (
      <Terms
        vocabulary={this.props.vocabulary}
        match={this.props.match}
        location={this.props.location}
        showTermQualityBadge={true}
      />
    );

    tabs[TABS.document] = (
      <DocumentSummary
        document={vocabulary.document}
        onChange={this.props.onChange}
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
        activeTabLabelKey={this.state.activeTab}
        changeTab={this.onTabSelect}
        tabs={tabs}
        tabBadges={{
          "glossary.title": vocabulary.termCount
            ? vocabulary.termCount.toString()
            : null,
          "properties.edit.title": vocabulary.unmappedProperties.size.toFixed(),
        }}
      />
    );
  }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    resetSelectedTerm: () => dispatch(selectVocabularyTerm(null)),
  };
})(injectIntl(withI18n(VocabularyMetadata)));
