import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TermData} from "../../model/Term";
import FetchOptionsFunction from "../../model/Functions";
import {connect} from "react-redux";
import {ThunkDispatch, TreeSelectFetchOptionsParams} from "../../util/Types";
import {loadTerms} from "../../action/AsyncActions";
import {FormGroup, Label} from "reactstrap";
import Utils from "../../util/Utils";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import {createTermsWithImportsOptionRenderer, createTermValueRenderer,} from "../misc/treeselect/Renderers";
import Vocabulary from "../../model/Vocabulary";
import TermItState from "../../model/TermItState";
import {commonTermTreeSelectProps, processTermsForTreeSelect, resolveSelectedIris,} from "./TermTreeSelectHelper";
import HelpIcon from "../misc/HelpIcon";
import BaseRelatedTermSelector, {
  BaseRelatedTermSelectorProps,
  PAGE_SIZE,
  SEARCH_DELAY
} from "./BaseRelatedTermSelector";
import {IRI} from "../../util/VocabularyUtils";
import {loadTermsFromCanonical, loadTermsFromCurrentWorkspace} from "../../action/AsyncTermActions";

interface ExactMatchesSelectorProps extends HasI18n, BaseRelatedTermSelectorProps {
  id: string;
  termIri?: string;
  selected?: TermData[];
  currentVocabulary?: Vocabulary;
  onChange: (exactMatches: Term[]) => void;
}

export class ExactMatchesSelector extends BaseRelatedTermSelector<ExactMatchesSelectorProps> {

  constructor(props: ExactMatchesSelectorProps) {
    super(props);
    this.state = {
      allVocabularyTerms: true,
      allWorkspaceTerms: false,
      vocabularyTermCount: 0,
      workspaceTermCount: 0,
      lastSearchString: ""
    }
  }

  public onChange = (val: Term[] | Term | null) => {
    if (!val) {
      this.props.onChange([]);
    } else {
      this.props.onChange(
        Utils.sanitizeArray(val).filter((v) => v.iri !== this.props.termIri)
      );
    }
  };

  public fetchOptions = (
      fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    let {
      allWorkspaceTerms,
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
        allWorkspaceTerms: false,
        workspaceTermCount: 0,
      });
      // Set these to false to ensure the effect right now
      allWorkspaceTerms = false;
      fetchOptionsCopy.offset = 0;
    }
      if (allWorkspaceTerms) {
        fetchOptionsCopy.offset =
            offset - workspaceTermCount;
        fetchFunction = this.fetchCanonicalTerms;
      } else {
        fetchOptionsCopy.offset = offset;
        fetchFunction = this.fetchWorkspaceTerms;
      }
    this.setState({ lastSearchString: fetchOptions.searchString || "" });
    return fetchFunction(fetchOptionsCopy).then((terms) => {
      return BaseRelatedTermSelector.enhanceWithCurrent(processTermsForTreeSelect(terms, undefined, {
        searchString: fetchOptionsCopy.searchString,
      }), this.props.termIri, Utils.sanitizeArray(this.props.selected).map(data => new Term(data)));
    });
  };

  public render() {
    return (
      <FormGroup id={this.props.id}>
        <Label className="attribute-label">
          {this.props.i18n("term.metadata.exactMatches")}
          <HelpIcon
            id="exact-match-select"
            text={this.props.i18n("term.exactMatches.help")}
          />
        </Label>
        <>
          <IntelligentTreeSelect
            onChange={this.onChange}
            value={resolveSelectedIris(this.props.selected)}
            fetchOptions={this.fetchOptions}
            fetchLimit={PAGE_SIZE}
            searchDelay={SEARCH_DELAY}
            maxHeight={200}
            multi={true}
            optionRenderer={createTermsWithImportsOptionRenderer(
              this.props.vocabularyIri
            )}
            valueRenderer={createTermValueRenderer()}
            {...commonTermTreeSelectProps(this.props)}
          />
        </>
      </FormGroup>
    );
  }
}

export default connect(
    (state: TermItState) => ({ workspace: state.workspace! }),
    (dispatch: ThunkDispatch) => {
      return {
        // Won't be used anyway, but is required by the props
        loadTermsFromVocabulary: (
            fetchOptions: FetchOptionsFunction,
            vocabularyIri: IRI
        ) => dispatch(loadTerms(fetchOptions, vocabularyIri)),
        loadTermsFromCurrentWorkspace: (
            fetchOptions: FetchOptionsFunction,
            excludeVocabulary: string
        ) =>
            dispatch(
                loadTermsFromCurrentWorkspace(fetchOptions, excludeVocabulary)
            ),
        loadTermsFromCanonical: (fetchOptions: FetchOptionsFunction) =>
            dispatch(loadTermsFromCanonical(fetchOptions)),
      };
    }
)(injectIntl(withI18n(ExactMatchesSelector)));
