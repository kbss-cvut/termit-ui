import * as React from "react";
import { injectIntl } from "react-intl";
import { Badge } from "reactstrap";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import "intelligent-tree-select/lib/styles.css";
import Term, { TermData } from "../../../model/Term";
import Vocabulary, { EMPTY_VOCABULARY } from "../../../model/Vocabulary";
import withI18n, { HasI18n } from "../../hoc/withI18n";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Utils from "../../../util/Utils";
import { Location } from "history";
import { match as Match } from "react-router";
import {
  TermFetchParams,
  ThunkDispatch,
  TreeSelectFetchOptionsParams,
} from "../../../util/Types";
import Routing from "../../../util/Routing";
import classNames from "classnames";
import IncludeImportedTermsToggle from "../../term/IncludeImportedTermsToggle";
import { createTermsWithImportsOptionRenderer } from "../../misc/treeselect/Renderers";
import {
  commonTermTreeSelectProps,
  processTermsForTreeSelect,
} from "../../term/TermTreeSelectHelper";
import { connect } from "react-redux";
import TermItState from "../../../model/TermItState";
import { selectVocabularyTerm } from "../../../action/SyncActions";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";
import "../../term/Terms.scss";
import { loadTerms } from "../../../action/AsyncActions";

interface GlossaryTermsProps extends HasI18n {
  vocabulary?: Vocabulary;
  selectedTerms: Term | null;
  selectVocabularyTerm: (selectedTerms: Term | null) => void;
  fetchTerms: (
    fetchOptions: TermFetchParams<TermData>,
    vocabularyIri: IRI
  ) => Promise<Term[]>;
  isDetailView?: boolean;
  location: Location;
  match: Match<any>;
}

interface TermsState {
  // Whether terms from imported vocabularies should be displayed as well
  includeImported: boolean;
  disableIncludeImportedToggle: boolean;
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
    };
  }

  public componentDidUpdate(prevProps: Readonly<GlossaryTermsProps>) {
    if (
      Utils.didNavigationOccur(prevProps, this.props) &&
      this.treeComponent.current
    ) {
      this.treeComponent.current.resetOptions();
    }
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
    const namespace = Utils.extractQueryParam(
      this.props.location.search,
      "namespace"
    );
    const vocabularyIri = fetchOptions.option
      ? VocabularyUtils.create(fetchOptions.option.vocabulary!.iri!)
      : {
          fragment: this.props.match.params.name,
          namespace,
        };
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
        return processTermsForTreeSelect(
          terms,
          matchingVocabularies,
          fetchOptions
        );
      });
  };

  public onTermSelect = (term: TermData | null) => {
    if (term === null) {
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
      Routing.transitionToPublicAsset(clone, {
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
    return this.props.vocabulary &&
      this.props.vocabulary.importedVocabularies ? (
      <div className={classNames({ "mb-3": !this.props.isDetailView })}>
        <IncludeImportedTermsToggle
          id="glossary-include-imported"
          onToggle={this.onIncludeImportedToggle}
          includeImported={this.state.includeImported}
          disabled={this.state.disableIncludeImportedToggle}
        />
      </div>
    ) : null;
  }

  public render() {
    const { i18n, isDetailView, vocabulary } = this.props;

    if (!vocabulary || vocabulary === EMPTY_VOCABULARY) {
      return null;
    }

    return (
      <div id="public-vocabulary-terms">
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
            {!isDetailView && vocabulary.termCount && (
              <Badge
                className="ml-1 align-middle"
                title={i18n("glossary.termCount.tooltip")}
              >
                {vocabulary.termCount}
              </Badge>
            )}
          </h4>
          {isDetailView && this.renderIncludeImported()}
        </div>
        <div
          id="public-glossary-list"
          className={classNames({ "card-header": isDetailView })}
        >
          {!isDetailView && this.renderIncludeImported()}
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
            menuIsFloating={false}
            maxHeight={Utils.calculateAssetListHeight()}
            optionRenderer={createTermsWithImportsOptionRenderer(
              vocabulary.iri
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
    };
  }
)(injectIntl(withI18n(Terms)));
