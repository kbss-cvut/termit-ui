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

interface RelatedTermsSelectorProps extends HasI18n {
  id: string;
  termIri?: string;
  vocabularyIri: string;
  selected: TermInfo[];
  onChange: (value: Term[]) => void;
  loadTerms: (
    fetchOptions: FetchOptionsFunction,
    namespace?: string
  ) => Promise<Term[]>;
}

export class RelatedTermsSelector extends React.Component<RelatedTermsSelectorProps> {
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
    return this.props
      .loadTerms(
        {
          ...fetchOptions,
          includeTerms: resolveSelectedIris(this.props.selected),
        },
        fetchOptions.optionID
          ? VocabularyUtils.create(fetchOptions.optionID).namespace
          : undefined
      )
      .then((terms) => {
        if (!this.props.termIri) {
          return terms;
        }
        return processTermsForTreeSelect(terms, undefined, {
          searchString: fetchOptions.searchString,
        });
      });
  };

  public render() {
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
            value={resolveSelectedIris(this.props.selected)}
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
      </FormGroup>
    );
  }
}

export default connect(undefined, (dispatch: ThunkDispatch) => ({
  loadTerms: (fetchOptions: FetchOptionsFunction, namespace?: string) =>
    dispatch(loadAllTerms(fetchOptions, namespace)),
}))(injectIntl(withI18n(RelatedTermsSelector)));
