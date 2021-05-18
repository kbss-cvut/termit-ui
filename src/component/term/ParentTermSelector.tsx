import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TERM_BROADER_SUBPROPERTIES, TermData} from "../../model/Term";
import FetchOptionsFunction from "../../model/Functions";
import {connect} from "react-redux";
import {ThunkDispatch, TreeSelectFetchOptionsParams} from "../../util/Types";
import {ButtonToolbar, FormFeedback, FormGroup, Label} from "reactstrap";
import Utils from "../../util/Utils";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import {createTermsWithVocabularyInfoRenderer} from "../misc/treeselect/Renderers";
import {commonTermTreeSelectProps, processTermsForTreeSelect,} from "./TermTreeSelectHelper";
import {loadTermsFromCanonical, loadTermsFromCurrentWorkspace,} from "../../action/AsyncTermActions";
import OutgoingLink from "../misc/OutgoingLink";
import VocabularyNameBadge from "../vocabulary/VocabularyNameBadge";
import {getLocalized} from "../../model/MultilingualString";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import {loadTerms} from "../../action/AsyncActions";
import HelpIcon from "../misc/HelpIcon";
import {FaPencilAlt, FaTrashAlt} from "react-icons/fa";
import TermItState from "../../model/TermItState";
import Workspace from "../../model/Workspace";
import TermLink from "./TermLink";
import BadgeButton from "../misc/BadgeButton";

const PARENT_ATTRIBUTES = [{
  attribute: "parentTerms",
  selectorLabelKey: "term.metadata.broader",
    selectorHintKey: "term.metadata.broader.hint"
},...TERM_BROADER_SUBPROPERTIES.slice()];

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

interface ParentTermSelectorProps extends HasI18n {
  id: string;
  term: Term | TermData;
  vocabularyIri: string;
  invalid?: boolean;
  invalidMessage?: JSX.Element;
  workspace: Workspace;
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

  public onChange = (val: Term | Term[] | null) => {
    if (!val) {
      this.props.onChange({parentTerms: []});
    } else {
      const newParents = Utils.sanitizeArray(this.props.term.parentTerms).concat(Utils.sanitizeArray(val));
      this.props.onChange({parentTerms: newParents});
    }
  };

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

  public render() {
    const i18n = this.props.i18n;
    return (
      <FormGroup id={this.props.id}>
        <Label className="attribute-label">
          {i18n("term.metadata.parent")}
          <HelpIcon id={"parent-term-select"} text={i18n("term.parent.help")} />
        </Label>
        {this.renderSelector()}
        {this.renderSelected()}
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
        <IntelligentTreeSelect
          onChange={this.onChange}
          ref={this.treeComponent}
          value={[]}
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

  private renderSelected() {
      const {i18n, term, workspace} = this.props;
    return <table className="mt-1">
      <tbody>
      {PARENT_ATTRIBUTES.map(pt => Utils.sanitizeArray(term[pt.attribute]).map(value => <tr key={value.iri}>
        <td className="align-middle">
          <ul className="term-items mt-0 mb-0">
          <li>
              <VocabularyNameBadge
            className="mr-1 align-text-top"
            vocabulary={value.vocabulary}
        />
        {workspace.containsVocabulary(value.vocabulary.iri) ? <TermLink term={value}/> : getLocalized(value.label)}
      </li>
          </ul>
        </td>
          <td className="align-middle pl-3">
            <ButtonToolbar>
              <BadgeButton color="primary" title={i18n(pt.selectorHintKey)} className="term-broader-selector">
                  <FaPencilAlt className="mr-1"/>
                  {i18n(pt.selectorLabelKey)}
              </BadgeButton>
              <BadgeButton color="danger" outline={true}>
                  <FaTrashAlt className="mr-1" />{i18n("properties.edit.remove.text")}
              </BadgeButton>
            </ButtonToolbar>
          </td>
      </tr>))}
    </tbody>
    </table>;
  }
}

export default connect((state: TermItState) => ({workspace: state.workspace!}), (dispatch: ThunkDispatch) => {
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
