import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { Card, CardBody, Col, Row } from "reactstrap";
import Term from "../../model/Term";
import Vocabulary from "../../model/Vocabulary";
import { RouteComponentProps, withRouter } from "react-router";
import Utils from "../../util/Utils";
import Tabs from "../misc/Tabs";
import AssetHistory from "../changetracking/AssetHistory";
import BasicTermMetadata from "./BasicTermMetadata";
import LanguageSelector from "../multilingual/LanguageSelector";
import Terms from "./Terms";
import ValidationResults from "./validation/ValidationResults";
import Comments from "../comment/Comments";
import UnmappedProperties from "../genericmetadata/UnmappedProperties";
import "./TermMetadata.scss";
import TermSnapshots from "./snapshot/TermSnapshots";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import { RdfProperty } from "../../model/RdfsResource";

interface TermMetadataProps extends HasI18n, RouteComponentProps<any> {
  term: Term;
  vocabulary: Vocabulary;
  language: string;
  selectLanguage: (lang: string) => void;
  customAttributes: RdfProperty[];
}

interface TermMetadataState {
  activeTab: string;
  commentsCount: number | null;
  displayTerms: boolean;
}

const DISPLAY_TERMS_WIDTH_BREAKPOINT = 1366;

export class TermMetadata extends React.Component<
  TermMetadataProps,
  TermMetadataState
> {
  constructor(props: TermMetadataProps) {
    super(props);
    this.state = {
      activeTab: "comments.title",
      commentsCount: null,
      displayTerms: window.innerWidth >= DISPLAY_TERMS_WIDTH_BREAKPOINT,
    };
  }

  public componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    this.updateTabFromUrlIfAny();
  }

  public componentDidUpdate(
    prevProps: TermMetadataProps,
    prevState: TermMetadataState
  ) {
    const activeTabFromUrl = Utils.extractQueryParam(
      this.props.location.search,
      "activeTab"
    );
    if (
      this.state.activeTab === prevState.activeTab &&
      this.state.activeTab !== activeTabFromUrl &&
      activeTabFromUrl
    ) {
      this.onTabSelect(activeTabFromUrl);
    }
  }

  private updateTabFromUrlIfAny() {
    const activeTabFromUrl = Utils.extractQueryParam(
      this.props.location.search,
      "activeTab"
    );
    if (this.state.activeTab !== activeTabFromUrl && activeTabFromUrl) {
      this.onTabSelect(activeTabFromUrl);
    }
  }

  public componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  private handleResize = () => {
    const displayTerms = window.innerWidth >= DISPLAY_TERMS_WIDTH_BREAKPOINT;
    if (displayTerms !== this.state.displayTerms) {
      this.setState({ displayTerms });
    }
  };

  private onTabSelect = (tabId: string) => {
    this.setState({ activeTab: tabId });
  };

  private setCommentsCount = (commentsCount: number) => {
    this.setState({ commentsCount });
  };

  public render() {
    const { term, language, selectLanguage } = this.props;
    const unmappedPropertyCount = this.resolveUnmappedPropertyCount();
    return (
      <>
        <LanguageSelector
          key="term-language-selector"
          language={language}
          languages={Term.getLanguages(term)}
          onSelect={selectLanguage}
          primaryLanguage={this.props.vocabulary.primaryLanguage}
        />
        <Row>
          <Col lg={this.state.displayTerms ? 9 : 12}>
            <Row>
              <Col xs={12}>
                <Card className="mb-3">
                  <CardBody className="card-body-basic-info">
                    <BasicTermMetadata
                      term={term}
                      vocabulary={this.props.vocabulary}
                      withDefinitionSource={true}
                      language={language}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Card>
                  <CardBody>
                    <Tabs
                      activeTabLabelKey={this.state.activeTab}
                      changeTab={this.onTabSelect}
                      tabs={this.initTabs()}
                      tabBadges={{
                        "properties.edit.title":
                          unmappedPropertyCount.toFixed(),
                        "comments.title":
                          this.state.commentsCount !== null
                            ? this.state.commentsCount.toFixed()
                            : null,
                      }}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Col>
          {this.state.displayTerms && (
            <Col>
              <Card>
                <Terms
                  vocabulary={this.props.vocabulary}
                  match={this.props.match}
                  location={this.props.location}
                  isDetailView={true}
                  showTermQualityBadge={false}
                />
              </Card>
            </Col>
          )}
        </Row>
      </>
    );
  }

  private resolveUnmappedPropertyCount() {
    const allUnmappedProperties = Array.from(
      this.props.term.unmappedProperties.keys()
    );
    const customAttributes = new Set(
      this.props.customAttributes.map((p) => p.iri)
    );
    return allUnmappedProperties.filter((p) => !customAttributes.has(p)).length;
  }

  private initTabs() {
    const { term } = this.props;
    const tabs = {};
    tabs["comments.title"] = (
      <Comments
        term={term}
        onLoad={this.setCommentsCount}
        reverseOrder={true}
        allowCreate={!term.isSnapshot()}
      />
    );
    tabs["properties.edit.title"] = (
      <UnmappedProperties
        properties={term.unmappedProperties}
        showInfoOnEmpty={true}
      />
    );
    tabs["term.metadata.validation.title"] = <ValidationResults term={term} />;
    tabs["history.label"] = <AssetHistory asset={term} />;
    if (!term.isSnapshot()) {
      tabs["snapshots.title"] = <TermSnapshots asset={term} />;
    }
    return tabs;
  }
}

export default connect((state: TermItState) => ({
  customAttributes: state.customAttributes,
}))(injectIntl(withI18n(withRouter(TermMetadata))));
