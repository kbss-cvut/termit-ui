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

const TABS = [
  "glossary.title",
  "type.document",
  "history.label",
  "snapshots.title",
  "changefrequency.label",
  "properties.edit.title",
  "vocabulary.acl",
];

export class VocabularyMetadata extends React.Component<
  VocabularyMetadataProps,
  VocabularyMetadataState
> {
  constructor(props: VocabularyMetadataProps) {
    super(props);
    const tabParam: string =
      Utils.extractQueryParam(this.props.location.search, "activeTab") || "";
    this.state = {
      activeTab:
        TABS.indexOf(tabParam) !== -1 ? TABS[TABS.indexOf(tabParam)] : TABS[0],
    };
  }

  public componentDidMount() {
    this.props.resetSelectedTerm();
  }

  public componentDidUpdate(prevProps: Readonly<VocabularyMetadataProps>) {
    if (this.props.vocabulary.iri !== prevProps.vocabulary.iri) {
      this.setState({ activeTab: TABS[0] });
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

    tabs[TABS[0]] = (
      <Terms
        vocabulary={this.props.vocabulary}
        match={this.props.match}
        location={this.props.location}
        showTermQualityBadge={true}
      />
    );

    tabs[TABS[1]] = (
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
    tabs[TABS[2]] = <AssetHistory asset={vocabulary} />;
    if (!vocabulary.isSnapshot()) {
      tabs[TABS[3]] = <VocabularySnapshots asset={vocabulary} />;
    }
    tabs[TABS[4]] = <TermChangeFrequency vocabulary={vocabulary} />;

    tabs[TABS[5]] = (
      <UnmappedProperties
        properties={vocabulary.unmappedProperties}
        showInfoOnEmpty={true}
      />
    );
    if (hasAccess(AccessLevel.SECURITY, vocabulary.accessLevel)) {
      tabs[TABS[6]] = <AccessControlList vocabularyIri={vocabulary.iri} />;
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
