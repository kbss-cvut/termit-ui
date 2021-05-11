import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term, { TERM_BROADER_SUBPROPERTIES, TermData } from "../../model/Term";
import FetchOptionsFunction from "../../model/Functions";
import { connect } from "react-redux";
import { ThunkDispatch, TreeSelectFetchOptionsParams } from "../../util/Types";
import { FormFeedback, FormGroup, Label } from "reactstrap";
import Utils from "../../util/Utils";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { createTermsWithVocabularyInfoRenderer } from "../misc/treeselect/Renderers";
import {
  commonTermTreeSelectProps,
  processTermsForTreeSelect,
} from "./TermTreeSelectHelper";
import {
  loadTermsFromCanonical,
  loadTermsFromCurrentWorkspace,
} from "../../action/AsyncTermActions";
import OutgoingLink from "../misc/OutgoingLink";
import VocabularyNameBadge from "../vocabulary/VocabularyNameBadge";
import { getLocalized } from "../../model/MultilingualString";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
import { loadTerms } from "../../action/AsyncActions";
import HelpIcon from "../misc/HelpIcon";
import BroaderTypeSelector from "./BroaderTypeSelector";

function enhanceWithCurrentTerm(
  terms: Term[],
  currentTermIri?: string,
  parentTerms?: Term[]
): Term[] {
  if (currentTermIri) {
    const currentParents = Utils.sanitizeArray(parentTerms).slice();
    const result = [];
    for (const t of terms) {
      if (t.iri === currentTermIri) {
        continue;
      }
      if (t.plainSubTerms) {
        t.plainSubTerms = t.plainSubTerms.filter((st) => st !== currentTermIri);
      }
      const parentIndex = currentParents.findIndex((p) => p.iri === t.iri);
      if (parentIndex === -1) {
        result.push(t);
      }
    }
    // Add parents which are not in the loaded terms so that they show up in the list
    return currentParents.concat(result);
  } else {
    return terms;
  }
}

function createValueRenderer() {
  return (term: Term) => (
    <OutgoingLink
      label={
        <>
          <VocabularyNameBadge
            className="mr-1 align-text-top"
            vocabulary={term.vocabulary}
          />
          {getLocalized(term.label)}
        </>
      }
      iri={term.iri}
    />
  );
}

function findNewlySelectedTerm(existing: Term[], newValue: Term[]): Term {
  for (let t of newValue) {
    if (!existing.find((ex) => ex.iri === t.iri)) {
      return t;
    }
  }
  // This should not happen, we assume there is a newly selected term
  throw new Error(
    "Expected newValue to contain a previously not selected term!"
  );
}

interface ParentTermSelectorProps extends HasI18n {
  id: string;
  term: Term | TermData;
  vocabularyIri: string;
  invalid?: boolean;
  invalidMessage?: JSX.Element;
  onChange: (change: Partial<TermData>) => void;
  loadTermsFromVocabulary: (
    fetchOptions: FetchOptionsFunction,
    vocabularyIri: IRI
  ) => Promise<Term[]>;
  loadTermsFromCurrentWorkspace: (
    fetchOptions: FetchOptionsFunction,
    excludeVocabulary: string
  ) => Promise<Term[]>;
  loadTermsFromCanonical: (
    fetchOptions: FetchOptionsFunction
  ) => Promise<Term[]>;
}

interface ParentTermSelectorState {
  allVocabularyTerms: boolean;
  allWorkspaceTerms: boolean;
  vocabularyTermCount: number;
  workspaceTermCount: number;
  lastSearchString: string;

  lastSelectedTerm: Term | null;
  showBroaderTypeSelector: boolean;
}

export const PAGE_SIZE = 50;
const SEARCH_DELAY = 300;

export class ParentTermSelector extends React.Component<
  ParentTermSelectorProps,
  ParentTermSelectorState
> {
  private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

  constructor(props: ParentTermSelectorProps) {
    super(props);
    this.treeComponent = React.createRef();
    this.state = {
      allVocabularyTerms: false,
      allWorkspaceTerms: false,
      vocabularyTermCount: 0,
      workspaceTermCount: 0,
      lastSearchString: "",
      lastSelectedTerm: null,
      showBroaderTypeSelector: false,
    };
  }

  public onChange = (val: Term[] | Term | null) => {
    if (!val) {
      this.valueToTermUpdate([]);
    } else {
      const valArr = Utils.sanitizeArray(val);
      const parentArr = Term.consolidateBroaderTerms(this.props.term);
      if (valArr.length > parentArr.length) {
        const newlySelected = findNewlySelectedTerm(parentArr, valArr)!;
        if (newlySelected.iri !== this.props.term.iri) {
          this.setState({
            lastSelectedTerm: newlySelected,
            showBroaderTypeSelector: true,
          });
        }
      } else {
        this.valueToTermUpdate(valArr);
      }
    }
  };

  private valueToTermUpdate(value: Term[]) {
    const update: Partial<Term> = {};
    const term = this.props.term;
    const valueIris = value.map((t) => t.iri);
    TERM_BROADER_SUBPROPERTIES.forEach((sp) => {
      update[sp.attribute] = Utils.sanitizeArray(term[sp.attribute]).filter(
        (t) => valueIris.indexOf(t.iri) !== -1
      );
    });
    update.parentTerms = Utils.sanitizeArray(term.parentTerms as Term[]).filter(
      (t) => valueIris.indexOf(t.iri) !== -1
    );
    this.props.onChange(update);
  }

  public onBroaderTypeSelect = (attribute: string) => {
    const update: Partial<Term> = {};
    update[attribute] = Utils.sanitizeArray(this.props.term[attribute]).slice();
    update[attribute].push(this.state.lastSelectedTerm!);
    this.props.onChange(update);
    this.closeBroaderTypeSelect();
  };

  public closeBroaderTypeSelect = () => {
    this.setState({ lastSelectedTerm: null, showBroaderTypeSelector: false });
  };

  public fetchOptions = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    let {
      allVocabularyTerms,
      allWorkspaceTerms,
      vocabularyTermCount,
      workspaceTermCount,
      lastSearchString,
    } = this.state;
    let fetchFunction: (
      fetchOptions: TreeSelectFetchOptionsParams<TermData>
    ) => Promise<Term[]>;
    const offset = fetchOptions.offset || 0;
    const fetchOptionsCopy = Object.assign({}, fetchOptions);
    if (
      fetchOptions.searchString?.indexOf(lastSearchString) === -1 ||
      (lastSearchString.length === 0 &&
        (fetchOptions.searchString || "").length > 0)
    ) {
      this.setState({
        allVocabularyTerms: false,
        allWorkspaceTerms: false,
        vocabularyTermCount: 0,
        workspaceTermCount: 0,
      });
      // Set these to false to ensure the effect right now
      allVocabularyTerms = false;
      allWorkspaceTerms = false;
      fetchOptionsCopy.offset = 0;
    }
    if (allVocabularyTerms) {
      if (allWorkspaceTerms) {
        fetchOptionsCopy.offset =
          offset - (vocabularyTermCount + workspaceTermCount);
        fetchFunction = this.fetchCanonicalTerms;
      } else {
        fetchOptionsCopy.offset = offset - vocabularyTermCount;
        fetchFunction = this.fetchWorkspaceTerms;
      }
    } else {
      fetchFunction = this.fetchVocabularyTerms;
    }
    this.setState({ lastSearchString: fetchOptions.searchString || "" });
    return fetchFunction(fetchOptionsCopy).then((terms) => {
      return enhanceWithCurrentTerm(
        processTermsForTreeSelect(terms, undefined, {
          searchString: fetchOptionsCopy.searchString,
        }),
        this.props.term.iri,
        Term.consolidateBroaderTerms(this.props.term)
      );
    });
  };

  private fetchVocabularyTerms = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    return this.props
      .loadTermsFromVocabulary(
        fetchOptions,
        VocabularyUtils.create(this.props.vocabularyIri)
      )
      .then((terms) => {
        this.setState({
          allVocabularyTerms: terms.length < PAGE_SIZE,
          vocabularyTermCount: this.state.vocabularyTermCount + terms.length,
        });
        if (terms.length < PAGE_SIZE) {
          const fetchOptionsCopy = Object.assign({}, fetchOptions);
          fetchOptionsCopy.offset = 0;
          return this.fetchWorkspaceTerms(fetchOptionsCopy).then((wsTerms) =>
            terms.concat(wsTerms)
          );
        } else {
          return Promise.resolve(terms);
        }
      });
  };

  private fetchWorkspaceTerms = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    return this.props
      .loadTermsFromCurrentWorkspace(fetchOptions, this.props.vocabularyIri)
      .then((terms) => {
        this.setState({
          allWorkspaceTerms: terms.length < PAGE_SIZE,
          workspaceTermCount: this.state.workspaceTermCount + terms.length,
        });
        if (terms.length < PAGE_SIZE) {
          const fetchOptionsCopy = Object.assign({}, fetchOptions);
          fetchOptionsCopy.offset = 0;
          return this.fetchCanonicalTerms(fetchOptionsCopy).then((wsTerms) =>
            terms.concat(wsTerms)
          );
        } else {
          return Promise.resolve(terms);
        }
      });
  };

  private fetchCanonicalTerms = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    return this.props.loadTermsFromCanonical(fetchOptions);
  };

  private resolveSelectedParents() {
    const parents = Term.consolidateBroaderTerms(this.props.term);
    return parents.filter((p) => p.vocabulary !== undefined).map((p) => p.iri);
  }

  public render() {
    const i18n = this.props.i18n;
    return (
      <FormGroup id={this.props.id}>
        <Label className="attribute-label">
          {i18n("term.metadata.parent")}
          <HelpIcon id={"parent-term-select"} text={i18n("term.parent.help")} />
        </Label>
        {this.renderSelector()}
      </FormGroup>
    );
  }

  private renderSelector() {
    let style;
    if (this.props.invalid) {
      style = { borderColor: "red" };
    } else {
      style = {};
    }
    return (
      <>
        <BroaderTypeSelector
          onSelect={this.onBroaderTypeSelect}
          onCancel={this.closeBroaderTypeSelect}
          show={this.state.showBroaderTypeSelector}
        />
        <IntelligentTreeSelect
          onChange={this.onChange}
          ref={this.treeComponent}
          value={this.resolveSelectedParents()}
          fetchOptions={this.fetchOptions}
          fetchLimit={PAGE_SIZE}
          searchDelay={SEARCH_DELAY}
          maxHeight={200}
          multi={true}
          optionRenderer={createTermsWithVocabularyInfoRenderer()}
          valueRenderer={createValueRenderer()}
          style={style}
          {...commonTermTreeSelectProps(this.props)}
        />
        {this.props.invalid ? (
          <FormFeedback style={{ display: "block" }}>
            {this.props.invalidMessage}
          </FormFeedback>
        ) : (
          <></>
        )}
      </>
    );
  }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    loadTermsFromVocabulary: (
      fetchOptions: FetchOptionsFunction,
      vocabularyIri: IRI
    ) => dispatch(loadTerms(fetchOptions, vocabularyIri)),
    loadTermsFromCurrentWorkspace: (
      fetchOptions: FetchOptionsFunction,
      excludeVocabulary: string
    ) =>
      dispatch(loadTermsFromCurrentWorkspace(fetchOptions, excludeVocabulary)),
    loadTermsFromCanonical: (fetchOptions: FetchOptionsFunction) =>
      dispatch(loadTermsFromCanonical(fetchOptions)),
  };
})(injectIntl(withI18n(ParentTermSelector)));
