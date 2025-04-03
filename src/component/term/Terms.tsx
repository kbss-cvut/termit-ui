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
import { loadTerms } from "../../action/AsyncActions";
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
import { createFullTermRenderer } from "../misc/treeselect/Renderers";
import {
  commonTermTreeSelectProps,
  createTermNonTerminalStateMatcher,
  createVocabularyMatcher,
  processTermsForTreeSelect,
} from "./TermTreeSelectHelper";
import { Location } from "history";
import { match as Match } from "react-router";
import classNames from "classnames";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import "./Terms.scss";
import { Configuration } from "../../model/Configuration";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";
import ShowTerminalTermsToggle from "./state/ShowTerminalTermsToggle";

interface GlossaryTermsProps extends HasI18n {
  vocabulary?: Vocabulary;
  counter: number;
  selectedTerms: Term | null;
  notifications: AppNotification[];
  configuration: Configuration;
  terminalStates: string[];
  selectVocabularyTerm: (selectedTerms: Term | null) => void;
  fetchTerms: (
    fetchOptions: TermFetchParams<TermData>,
    vocabularyIri: IRI
  ) => Promise<Term[]>;
  consumeNotification: (notification: AppNotification) => void;
  location: Location;
  match: Match<any>;
  isDetailView?: boolean;
  // Whether terms should be displayed with the quality badge
  showTermQualityBadge: boolean;
}

interface TermsState {
  // Whether terms from imported vocabularies should be displayed as well
  includeImported: boolean;
  disableIncludeImportedToggle: boolean;
  showTerminalTerms: boolean;
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
      showTerminalTerms: false,
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
    return this.props
      .fetchTerms(
        {
          ...fetchOptions,
          includeImported: this.state.includeImported,
        },
        vocabularyIri
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
        const termFilters = [createVocabularyMatcher(matchingVocabularies)];
        if (!this.state.showTerminalTerms) {
          termFilters.push(
            createTermNonTerminalStateMatcher(this.props.terminalStates)
          );
        }
        return processTermsForTreeSelect(terms, termFilters, {
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
      const clone = Terms.cloneAndRemoveTreeSelectAttributes(term);
      Routing.transitionToAsset(clone, {
        query: new Map([
          ["includeImported", this.state.includeImported.toString()],
        ]),
      });
    }
  };

  /**
   * Creates a copy of the specified term and removes attributes added by the intelligent-tree-select.
   * @param term Data to clone and cleanup
   * @private
   */
  private static cloneAndRemoveTreeSelectAttributes(term: TermData): Term {
    let clone: any = Object.assign({}, term);
    delete clone.expanded;
    delete clone.depth;
    delete clone.path;
    delete clone.visible;
    return new Term(clone);
  }

  private onIncludeImportedToggle = () => {
    this.setState({ includeImported: !this.state.includeImported }, () =>
      this.treeComponent.current.resetOptions()
    );
  };

  private onShowTerminalTermsToggle = () => {
    this.setState({ showTerminalTerms: !this.state.showTerminalTerms }, () =>
      this.treeComponent.current.resetOptions()
    );
  };

  private renderToggles(renderIncludeImported: boolean) {
    return (
      !this.props.isDetailView && (
        <div className="mb-3">
          {renderIncludeImported && (
            <>
              <IncludeImportedTermsToggle
                id="glossary-include-imported"
                onToggle={this.onIncludeImportedToggle}
                includeImported={this.state.includeImported}
                disabled={this.state.disableIncludeImportedToggle}
              />
              &nbsp;
            </>
          )}
          <ShowTerminalTermsToggle
            onToggle={this.onShowTerminalTermsToggle}
            value={this.state.showTerminalTerms}
            id="glossary-show-terminal-terms"
          />
        </div>
      )
    );
  }

  public render() {
    if (!this.props.vocabulary) {
      return null;
    }
    const { i18n, isDetailView } = this.props;

    const includeImported = this.state.includeImported;
    const renderIncludeImported =
      this.props.vocabulary &&
      Utils.sanitizeArray(this.props.vocabulary.importedVocabularies).length >
        0;

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
            {isDetailView && i18n("glossary.title")}
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
            <IfVocabularyActionAuthorized
              vocabulary={this.props.vocabulary}
              requiredAccessLevel={AccessLevel.WRITE}
            >
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
            </IfVocabularyActionAuthorized>
          )}
        </div>
        <div
          id="glossary-list"
          className={classNames({ "card-header": isDetailView })}
        >
          {this.renderToggles(renderIncludeImported)}
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
            optionRenderer={createFullTermRenderer(
              this.props.terminalStates,
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
      terminalStates: state.terminalStates,
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
    };
  }
)(injectIntl(withI18n(Terms)));
