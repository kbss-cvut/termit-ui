import * as React from "react";
import { injectIntl } from "react-intl";
import { Button } from "reactstrap";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Vocabulary from "../../model/Vocabulary";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import "intelligent-tree-select/lib/styles.css";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import {
  consumeNotification,
  selectVocabularyTerm,
} from "../../action/SyncActions";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import Term, { TermData } from "../../model/Term";
import {
  loadTerms,
  loadUnusedTermsForVocabulary,
} from "../../action/AsyncActions";
import {
  TermFetchParams,
  ThunkDispatch,
  TreeSelectFetchOptionsParams,
} from "../../util/Types";
import { GoPlus } from "react-icons/go";
import Utils from "../../util/Utils";
import AppNotification from "../../model/AppNotification";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import ActionType from "../../action/ActionType";
import NotificationType from "../../model/NotificationType";
import IncludeImportedTermsToggle from "./IncludeImportedTermsToggle";
import { createTermsWithImportsOptionRendererAndUnusedTermsAndQualityBadge } from "../misc/treeselect/Renderers";
import {
  commonTermTreeSelectProps,
  processTermsForTreeSelect,
} from "./TermTreeSelectHelper";
import { Location } from "history";
import { match as Match } from "react-router";
import classNames from "classnames";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import "./Terms.scss";
import StatusFilter from "./StatusFilter";
import IfVocabularyEditAuthorized from "../vocabulary/authorization/IfVocabularyEditAuthorized";
import { Configuration } from "../../model/Configuration";

interface GlossaryTermsProps extends HasI18n {
  vocabulary?: Vocabulary;
  counter: number;
  selectedTerms: Term | null;
  notifications: AppNotification[];
  configuration: Configuration;
  selectVocabularyTerm: (selectedTerms: Term | null) => void;
  fetchTerms: (
    fetchOptions: TermFetchParams<TermData>,
    vocabularyIri: IRI
  ) => Promise<Term[]>;
  consumeNotification: (notification: AppNotification) => void;
  fetchUnusedTerms: (vocabularyIri: IRI) => Promise<string[]>;
  location: Location;
  match: Match<any>;
  isDetailView?: boolean;
  // Whether terms should be displayed with the quality badge
  showTermQualityBadge: boolean;
}

interface TermsState {
  // Whether terms from imported vocabularies should be displayed as well
  includeImported: boolean;
  // Whether draft terms should be shown
  draft: boolean;

  // Whether confirmed terms should be shown
  confirmed: boolean;
  disableIncludeImportedToggle: boolean;
  unusedTermsForVocabulary: { [key: string]: string[] };
}

export class Terms extends React.Component<GlossaryTermsProps, TermsState> {
  private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

  constructor(props: GlossaryTermsProps) {
    super(props);
    this.treeComponent = React.createRef();

    const includeImported =
      Utils.extractQueryParam(props.location.search, "includeImported") ===
      true.toString();

    this.state = {
      includeImported: includeImported || false,
      disableIncludeImportedToggle: props.isDetailView || false,
      unusedTermsForVocabulary: {},
      draft: true,
      confirmed: true,
    };
  }

  public componentDidUpdate(prevProps: GlossaryTermsProps) {
    if (prevProps.counter < this.props.counter) {
      this.forceUpdate();
    }
    const matchingNotification = this.props.notifications.find(
      (n) =>
        Terms.isNotificationRelevant(n) ||
        Utils.generateIsAssetLabelUpdate(VocabularyUtils.TERM)(n)
    );
    if (matchingNotification && this.treeComponent.current) {
      this.treeComponent.current.resetOptions();
      this.props.consumeNotification(matchingNotification);
    } else if (this.shouldReloadTerms(prevProps)) {
      this.treeComponent.current.resetOptions();
    }
    if (prevProps.locale !== this.props.locale) {
      this.treeComponent.current.forceUpdate();
    }
  }

  private static isNotificationRelevant(n: AppNotification) {
    return (
      (n.source.type === ActionType.CREATE_VOCABULARY_TERM &&
        n.source.status === AsyncActionStatus.SUCCESS) ||
      n.source.type === NotificationType.TERM_HIERARCHY_UPDATED
    );
  }

  private shouldReloadTerms(prevProps: Readonly<GlossaryTermsProps>) {
    return (
      (Utils.didNavigationOccur(prevProps, this.props) &&
        this.treeComponent.current &&
        !this.props.isDetailView) ||
      prevProps.vocabulary?.iri !== this.props.vocabulary?.iri
    );
  }

  public componentWillUnmount() {
    if (!this.props.isDetailView) {
      this.props.selectVocabularyTerm(null);
    }
  }

  public fetchOptions = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    this.setState({ disableIncludeImportedToggle: true });
    const vocabularyIri = fetchOptions.option
      ? VocabularyUtils.create(fetchOptions.option.vocabulary!.iri!)
      : Utils.resolveVocabularyIriFromRoute(
          this.props.match.params,
          this.props.location.search,
          this.props.configuration
        );
    this.props.fetchUnusedTerms(vocabularyIri).then((data) => {
      const unusedTermsForVocabulary = this.state.unusedTermsForVocabulary;
      unusedTermsForVocabulary[vocabularyIri.toString()] = data;
      this.setState({ unusedTermsForVocabulary });
    });
    return this.props
      .fetchTerms(
        {
          ...fetchOptions,
          includeImported: this.state.includeImported,
        },
        vocabularyIri
      )
      .then((terms) =>
        terms.filter(
          (t) =>
            (this.state.confirmed && !t.draft) || (this.state.draft && t.draft)
        )
      )
      .then((terms) => {
        const matchingVocabularies = this.state.includeImported
          ? Utils.sanitizeArray(
              this.props.vocabulary!.allImportedVocabularies
            ).concat(this.props.vocabulary!.iri)
          : [this.props.vocabulary!.iri];
        this.setState({
          disableIncludeImportedToggle: this.props.isDetailView || false,
        });
        return processTermsForTreeSelect(terms, matchingVocabularies, {
          searchString: fetchOptions.searchString,
        });
      });
  };

  public onCreateClick = () => {
    const vocabularyIri = VocabularyUtils.create(this.props.vocabulary!.iri!);
    Routing.transitionTo(Routes.createVocabularyTerm, {
      params: new Map([["name", vocabularyIri.fragment]]),
      query: vocabularyIri.namespace
        ? new Map([["namespace", vocabularyIri.namespace]])
        : undefined,
    });
  };

  public onTermSelect = (term: TermData | null) => {
    if (term === null) {
      if (this.props.isDetailView) {
        return;
      }
      this.props.selectVocabularyTerm(term);
    } else {
      // The tree component adds depth and expanded attributes to the options when rendering,
      // We need to get rid of them before working with the term
      // We are creating a defensive copy of the term so that the rest of the application and the tree component
      // have their own versions
      const cloneData = Object.assign({}, term);
      // @ts-ignore
      delete cloneData.expanded;
      // @ts-ignore
      delete cloneData.depth;
      const clone = new Term(cloneData);
      this.props.selectVocabularyTerm(clone);
      Routing.transitionToAsset(clone, {
        query: new Map([
          ["includeImported", this.state.includeImported.toString()],
        ]),
      });
    }
  };

  private onIncludeImportedToggle = () => {
    this.setState({ includeImported: !this.state.includeImported }, () =>
      this.treeComponent.current.resetOptions()
    );
  };

  private renderIncludeImported() {
    return (
      <div className={classNames({ "mb-3": !this.props.isDetailView })}>
        {this.props.isDetailView ? (
          <></>
        ) : (
          <IncludeImportedTermsToggle
            id="glossary-include-imported"
            onToggle={this.onIncludeImportedToggle}
            includeImported={this.state.includeImported}
            disabled={this.state.disableIncludeImportedToggle}
          />
        )}
      </div>
    );
  }

  private onDraftOnlyToggle = () => {
    this.setState({ draft: !this.state.draft }, () =>
      this.treeComponent.current.resetOptions()
    );
  };

  private onConfirmedOnlyToggle = () => {
    this.setState({ confirmed: !this.state.confirmed }, () =>
      this.treeComponent.current.resetOptions()
    );
  };

  private renderDraftOnly() {
    return this.props.vocabulary && this.props.vocabulary.glossary ? (
      <div
        className={classNames({
          "mt-2": this.props.isDetailView,
          "draft-margin-detail": this.props.isDetailView,
          "draft-margin": !this.props.isDetailView,
        })}
      >
        <StatusFilter
          id="glossary-draftOnly"
          draft={this.state.draft}
          confirmed={this.state.confirmed}
          onDraftOnlyToggle={this.onDraftOnlyToggle}
          onConfirmedOnlyToggle={this.onConfirmedOnlyToggle}
        />
      </div>
    ) : null;
  }

  public render() {
    if (!this.props.vocabulary) {
      return null;
    }
    const { i18n, isDetailView } = this.props;

    const unusedTerms: string[] = [];
    Object.keys(this.state.unusedTermsForVocabulary).forEach((vocabularyIri) =>
      Array.prototype.push.apply(
        unusedTerms,
        this.state.unusedTermsForVocabulary[vocabularyIri]
      )
    );

    const includeImported = this.state.includeImported;
    const renderIncludeImported =
      this.props.vocabulary && this.props.vocabulary.importedVocabularies;

    return (
      <div id="vocabulary-terms">
        <div
          className={classNames(
            {
              "align-items-center card-header": isDetailView,
              "mb-2 mt-3": !isDetailView,
            },
            "d-flex",
            "flex-wrap",
            "justify-content-between",
            "card-header-basic-info"
          )}
        >
          <h4 className={classNames({ "mb-0": isDetailView })}>
            {i18n("glossary.title")}
            &nbsp;
            {isDetailView && renderIncludeImported ? (
              <>
                (
                {this.props.i18n(
                  includeImported
                    ? "glossary.importedIncluded"
                    : "glossary.importedExcluded"
                )}
                )
              </>
            ) : (
              <></>
            )}
          </h4>
          {!isDetailView && (
            <IfVocabularyEditAuthorized vocabulary={this.props.vocabulary}>
              <Button
                id="terms-create"
                color="primary"
                size="sm"
                title={i18n("glossary.createTerm.tooltip")}
                onClick={this.onCreateClick}
              >
                <GoPlus />
                &nbsp;{i18n("glossary.new")}
              </Button>
            </IfVocabularyEditAuthorized>
          )}
          {isDetailView && renderIncludeImported ? (
            this.renderIncludeImported()
          ) : (
            <></>
          )}
          {isDetailView && this.renderDraftOnly()}
        </div>
        <div
          id="glossary-list"
          className={classNames({ "card-header": isDetailView })}
        >
          {!isDetailView && renderIncludeImported ? (
            this.renderIncludeImported()
          ) : (
            <></>
          )}
          {!isDetailView && this.renderDraftOnly()}
          <IntelligentTreeSelect
            ref={this.treeComponent}
            isClearable={!isDetailView}
            onChange={this.onTermSelect}
            value={
              this.props.selectedTerms ? this.props.selectedTerms.iri : null
            }
            fetchOptions={this.fetchOptions}
            isMenuOpen={true}
            scrollMenuIntoView={false}
            multi={false}
            autoFocus={!isDetailView}
            menuIsFloating={false}
            optionRenderer={createTermsWithImportsOptionRendererAndUnusedTermsAndQualityBadge(
              unusedTerms,
              this.props.vocabulary.iri,
              this.props.showTermQualityBadge
            )}
            valueRenderer={(option: Term) =>
              getLocalized(option.label, getShortLocale(this.props.locale))
            }
            {...commonTermTreeSelectProps(this.props)}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      selectedTerms: state.selectedTerm,
      counter: state.createdTermsCounter,
      notifications: state.notifications,
      configuration: state.configuration,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      selectVocabularyTerm: (selectedTerm: Term | null) =>
        dispatch(selectVocabularyTerm(selectedTerm)),
      fetchTerms: (
        fetchOptions: TermFetchParams<TermData>,
        vocabularyIri: IRI
      ) => dispatch(loadTerms(fetchOptions, vocabularyIri)),
      consumeNotification: (notification: AppNotification) =>
        dispatch(consumeNotification(notification)),
      fetchUnusedTerms: (vocabularyIri: IRI) =>
        dispatch(loadUnusedTermsForVocabulary(vocabularyIri)),
    };
  }
)(injectIntl(withI18n(Terms)));
