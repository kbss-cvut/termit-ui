import React from "react";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term, { TermData, TermInfo } from "../../model/Term";
import FetchOptionsFunction from "../../model/Functions";
import { ThunkDispatch, TreeSelectFetchOptionsParams } from "../../util/Types";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import {
  commonTermTreeSelectProps,
  resolveSelectedIris,
} from "./TermTreeSelectHelper";
import Utils from "../../util/Utils";
import { FormGroup, Label } from "reactstrap";
import {
  createTermsWithImportsOptionRenderer,
  createTermValueRenderer,
} from "../misc/treeselect/Renderers";
import { connect } from "react-redux";
import { loadTerms } from "../../action/AsyncActions";
import { injectIntl } from "react-intl";
import { IRI } from "../../util/VocabularyUtils";
import HelpIcon from "../misc/HelpIcon";
import DefinitionRelatedTermsEdit, {
  DefinitionRelatedChanges,
} from "./DefinitionRelatedTermsEdit";
import BaseRelatedTermSelector, {
  BaseRelatedTermSelectorProps,
  BaseRelatedTermSelectorState,
  PAGE_SIZE,
  SEARCH_DELAY,
} from "./BaseRelatedTermSelector";
import TermItState, {
  DefinitionallyRelatedTerms,
} from "../../model/TermItState";
import {
  loadTermsFromCanonical,
  loadTermsFromCurrentWorkspace,
} from "../../action/AsyncTermActions";

interface RelatedTermsSelectorProps
  extends HasI18n,
    BaseRelatedTermSelectorProps {
  id: string;
  term: Term;
  vocabularyIri: string;
  selected: TermInfo[];
  onChange: (value: Term[]) => void;
  language: string;

  definitionRelated: DefinitionallyRelatedTerms;
  definitionRelatedChanges: DefinitionRelatedChanges;
  onDefinitionRelatedChange: (change: DefinitionRelatedChanges) => void;
}

export class RelatedTermsSelector extends BaseRelatedTermSelector<
  RelatedTermsSelectorProps,
  BaseRelatedTermSelectorState
> {
  private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

  constructor(props: RelatedTermsSelectorProps) {
    super(props);
    this.state = {
      allVocabularyTerms: false,
      allWorkspaceTerms: false,
      vocabularyTermCount: 0,
      workspaceTermCount: 0,
      lastSearchString: "",
    };
    this.treeComponent = React.createRef();
  }

  public onChange = (val: Term[] | Term | null) => {
    this.props.onChange(
      Utils.sanitizeArray(val).filter((v) => v.iri !== this.props.term.iri)
    );
  };

  public fetchOptions = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    const toInclude =
      fetchOptions.offset === 0 ? resolveSelectedIris(this.props.selected) : [];
    return super.fetchOptions(fetchOptions, toInclude).then((terms) =>
      BaseRelatedTermSelector.enhanceWithCurrent(
        terms,
        this.props.term.iri,
        this.props.selected.map((ti) => new Term(ti))
      )
    );
  };

  public render() {
    const value = resolveSelectedIris(this.props.selected);
    return (
      <FormGroup id={this.props.id}>
        <Label className="attribute-label">
          {this.props.i18n("term.metadata.related.title")}
          <HelpIcon
            id="related-term-select"
            text={this.props.i18n("term.metadata.related.help")}
          />
        </Label>
        <>
          <IntelligentTreeSelect
            onChange={this.onChange}
            value={value}
            fetchOptions={this.fetchOptions}
            fetchLimit={PAGE_SIZE}
            searchDelay={SEARCH_DELAY}
            maxHeight={200}
            multi={true}
            optionRenderer={createTermsWithImportsOptionRenderer(
              this.props.vocabularyIri
            )}
            valueRenderer={createTermValueRenderer(this.props.vocabularyIri)}
            {...commonTermTreeSelectProps(this.props)}
          />
        </>
        <DefinitionRelatedTermsEdit
          term={this.props.term}
          language={this.props.language}
          pending={this.props.definitionRelatedChanges}
          onChange={this.props.onDefinitionRelatedChange}
        />
      </FormGroup>
    );
  }
}

export default connect(
  (state: TermItState) => ({
    workspace: state.workspace!,
    definitionRelated: state.definitionallyRelatedTerms,
  }),
  (dispatch: ThunkDispatch) => ({
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
  })
)(injectIntl(withI18n(RelatedTermsSelector)));
