import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { Card, CardBody, Col, Label, Row } from "reactstrap";
import Term from "../../model/Term";
import UnmappedProperties from "../genericmetadata/UnmappedProperties";
import TermAssignments from "./TermAssignments";
import Tabs from "../misc/Tabs";
import AssetHistory from "../changetracking/AssetHistory";
import BasicTermMetadata from "./BasicTermMetadata";
import Vocabulary from "../../model/Vocabulary";
import { RouteComponentProps, withRouter } from "react-router";
import Terms from "./Terms";
import LanguageSelector from "../multilingual/LanguageSelector";
import DraftToggle from "./DraftToggle";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
import TermStatus from "../../model/TermStatus";
import { setTermStatus } from "../../action/AsyncTermActions";
import ValidationResults from "./validation/ValidationResults";
import Utils from "../../util/Utils";
import Comments from "../comment/Comments";
import "./TermMetadata.scss";

interface TermMetadataProps extends HasI18n, RouteComponentProps<any> {
  term: Term;
  vocabulary: Vocabulary;
  language: string;
  selectLanguage: (lang: string) => void;

  setStatus: (termIri: IRI, status: TermStatus) => void;
}

interface TermMetadataState {
  activeTab: string;
  assignmentsCount: number | null;
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
      activeTab: "term.metadata.assignments.title",
      assignmentsCount: null,
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

  private setAssignmentsCount = (assignmentsCount: number) => {
    this.setState({ assignmentsCount });
  };

  private setCommentsCount = (commentsCount: number) => {
    this.setState({ commentsCount });
  };

  public onToggleDraft = () => {
    const { term, setStatus } = this.props;
    const nextStatus = Term.isDraft(term)
      ? TermStatus.CONFIRMED
      : TermStatus.DRAFT;
    setStatus(VocabularyUtils.create(term.iri), nextStatus);
  };

  public render() {
    const { term, language, selectLanguage } = this.props;
    return (
      <>
        <LanguageSelector
          key="term-language-selector"
          term={term}
          language={language}
          onSelect={selectLanguage}
        />
        <Row>
          <Col lg={this.state.displayTerms ? 9 : 12}>
            <Row>
              <Col xs={12}>
                <Card className="mb-3">
                  <CardBody className="card-body-basic-info">
                    <BasicTermMetadata
                      term={term}
                      withDefinitionSource={true}
                      language={language}
                    />
                    <Row>
                      <Col xl={2} md={4}>
                        <Label className="attribute-label term-status-label">
                          {this.props.i18n("term.metadata.status")}
                        </Label>
                      </Col>
                      <Col xl={10} md={8}>
                        <DraftToggle
                          id="term-detail-draft-toggle"
                          draft={Term.isDraft(term)}
                          onToggle={this.onToggleDraft}
                        />
                      </Col>
                    </Row>
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
                          term.unmappedProperties.size.toFixed(),
                        "comments.title":
                          this.state.commentsCount !== null
                            ? this.state.commentsCount.toFixed()
                            : null,
                        "term.metadata.assignments.title":
                          this.state.assignmentsCount !== null
                            ? this.state.assignmentsCount.toFixed()
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

  private initTabs() {
    const { term } = this.props;
    const tabs = {};
    tabs["term.metadata.assignments.title"] = (
      <TermAssignments term={term} onLoad={this.setAssignmentsCount} />
    );
    tabs["history.label"] = <AssetHistory asset={term} />;
    tabs["term.metadata.validation.title"] = <ValidationResults term={term} />;
    tabs["comments.title"] = (
      <Comments
        term={term}
        onLoad={this.setCommentsCount}
        reverseOrder={true}
      />
    );
    tabs["properties.edit.title"] = (
      <UnmappedProperties
        properties={term.unmappedProperties}
        showInfoOnEmpty={true}
      />
    );
    return tabs;
  }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    setStatus: (iri: IRI, status: TermStatus) =>
      dispatch(setTermStatus(iri, status)),
  };
})(injectIntl(withI18n(withRouter(TermMetadata))));
