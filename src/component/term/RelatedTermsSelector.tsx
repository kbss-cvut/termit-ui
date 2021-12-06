import * as React from "react";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term, { TermData, TermInfo } from "../../model/Term";
import FetchOptionsFunction from "../../model/Functions";
import { ThunkDispatch, TreeSelectFetchOptionsParams } from "../../util/Types";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import {
  commonTermTreeSelectProps,
  processTermsForTreeSelect,
  resolveSelectedIris,
} from "./TermTreeSelectHelper";
import Utils from "../../util/Utils";
import { FormGroup, Label } from "reactstrap";
import {
  createTermsWithImportsOptionRenderer,
  createTermValueRenderer,
} from "../misc/treeselect/Renderers";
import { connect } from "react-redux";
import { loadAllTerms } from "../../action/AsyncActions";
import { injectIntl } from "react-intl";
import VocabularyUtils from "../../util/VocabularyUtils";
import HelpIcon from "../misc/HelpIcon";
import DefinitionRelatedTermsEdit, {
  DefinitionRelatedChanges,
} from "./DefinitionRelatedTermsEdit";
import TermItState, {
  DefinitionallyRelatedTerms,
} from "../../model/TermItState";

interface RelatedTermsSelectorProps extends HasI18n {
  id: string;
  term: Term;
  vocabularyIri: string;
  selected: TermInfo[];
  onChange: (value: Term[]) => void;
  language: string;
  loadTerms: (
    fetchOptions: FetchOptionsFunction,
    namespace?: string
  ) => Promise<Term[]>;

  definitionRelated: DefinitionallyRelatedTerms;
  definitionRelatedChanges: DefinitionRelatedChanges;
  onDefinitionRelatedChange: (change: DefinitionRelatedChanges) => void;
}

export function loadAndPrepareTerms(
  fetchOptions: TreeSelectFetchOptionsParams<TermData>,
  loadTerms: (
    fetchOptions: FetchOptionsFunction,
    namespace?: string
  ) => Promise<Term[]>,
  selected?: TermInfo[] | TermData[]
) {
  const selectedIris = resolveSelectedIris(selected);
  // If the offset is > 0, the selected terms should have been already included
  const toInclude =
    !fetchOptions.offset && !fetchOptions.optionID ? selectedIris : [];
  return loadTerms(
    {
      ...fetchOptions,
      includeTerms: toInclude,
    },
    fetchOptions.optionID
      ? VocabularyUtils.create(fetchOptions.optionID).namespace
      : undefined
  )
    .then((terms) => {
      if (toInclude.length === 0) {
        return terms;
      }
      let parentsToExpand = terms
        .filter((t) => toInclude.indexOf(t.iri) !== -1)
        .flatMap((t) => resolveAncestors(t));
      parentsToExpand = [...new Set(parentsToExpand)];
      return Promise.all(
        parentsToExpand.map((p) =>
          loadTerms({ optionID: p }, VocabularyUtils.create(p).namespace)
        )
      )
        .then((result) =>
          result.flat(1).map((t) => {
            if (toInclude.indexOf(t.iri) === -1) {
              // @ts-ignore
              t.expanded = true;
            }
            return t;
          })
        )
        .then((loaded) => loaded.concat(terms));
    })
    .then((terms) =>
      processTermsForTreeSelect(terms, undefined, {
        searchString: fetchOptions.searchString,
        selectedIris,
      })
    );
}

function resolveAncestors(term: Term): string[] {
  const parentsArr = Utils.sanitizeArray(term.parentTerms);
  if (parentsArr.length === 0) {
    return [];
  }
  const ancestors = parentsArr.map((pt) => pt.iri);
  return ancestors.concat(parentsArr.flatMap((t) => resolveAncestors(t)));
}

export class RelatedTermsSelector extends React.Component<RelatedTermsSelectorProps> {
  public onChange = (val: Term[] | Term | null) => {
    this.props.onChange(
      Utils.sanitizeArray(val).filter((v) => v.iri !== this.props.term.iri)
    );
  };

  public fetchOptions = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    return loadAndPrepareTerms(
      fetchOptions,
      this.props.loadTerms,
      this.props.selected
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
            fetchLimit={100}
            searchDelay={300}
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
    definitionRelated: state.definitionallyRelatedTerms,
  }),
  (dispatch: ThunkDispatch) => ({
    loadTerms: (fetchOptions: FetchOptionsFunction, namespace?: string) =>
      dispatch(loadAllTerms(fetchOptions, namespace)),
  })
)(injectIntl(withI18n(RelatedTermsSelector)));
