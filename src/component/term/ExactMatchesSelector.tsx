import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term, { TermData } from "../../model/Term";
import FetchOptionsFunction from "../../model/Functions";
import VocabularyUtils from "../../util/VocabularyUtils";
import { connect } from "react-redux";
import { ThunkDispatch, TreeSelectFetchOptionsParams } from "../../util/Types";
import { loadAllTerms } from "../../action/AsyncActions";
import { FormGroup, Label } from "reactstrap";
import Utils from "../../util/Utils";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import {
  createTermsWithImportsOptionRenderer,
  createTermValueRenderer,
} from "../misc/treeselect/Renderers";
import TermItState from "../../model/TermItState";
import {
  commonTermTreeSelectProps,
  processTermsForTreeSelect,
  resolveSelectedIris,
} from "./TermTreeSelectHelper";
import HelpIcon from "../misc/HelpIcon";

function filterOutTermsFromCurrentVocabulary(
  terms: Term[],
  currentVocabularyIri: string
) {
  const result = terms.filter(
    (t) => t.vocabulary!.iri !== currentVocabularyIri
  );
  result
    .filter((t) => t.plainSubTerms)
    .forEach(
      (t) =>
        (t.plainSubTerms = t
          .subTerms!.filter((st) => st.vocabulary!.iri !== currentVocabularyIri)
          .map((st) => st.iri))
    );
  return result;
}

interface ExactMatchesSelectorProps extends HasI18n {
  id: string;
  termIri?: string;
  selected?: TermData[];
  vocabularyIri: string;
  onChange: (exactMatches: Term[]) => void;
  loadTerms: (
    fetchOptions: FetchOptionsFunction,
    namespace: string
  ) => Promise<Term[]>;
}

export class ExactMatchesSelector extends React.Component<ExactMatchesSelectorProps> {
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
    // Use option vocabulary when present, it may differ from the current vocabulary (when option is from imported
    // vocabulary)
    return this.props
      .loadTerms(
        {
          ...fetchOptions,
          includeTerms: resolveSelectedIris(this.props.selected),
        },
        VocabularyUtils.create(
          fetchOptions.option
            ? fetchOptions.option.iri!
            : this.props.vocabularyIri
        ).namespace!
      )
      .then((terms) => {
        if (!this.props.termIri) {
          return terms;
        }
        return filterOutTermsFromCurrentVocabulary(
          processTermsForTreeSelect(terms, undefined, {
            searchString: fetchOptions.searchString,
          }),
          this.props.vocabularyIri
        );
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
            fetchLimit={300}
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
      </FormGroup>
    );
  }
}

export default connect(
  (state: TermItState) => ({
    currentVocabulary: state.vocabulary,
  }),
  (dispatch: ThunkDispatch) => ({
    loadTerms: (fetchOptions: FetchOptionsFunction, namespace: string) =>
      dispatch(loadAllTerms(fetchOptions, namespace)),
  })
)(injectIntl(withI18n(ExactMatchesSelector)));
