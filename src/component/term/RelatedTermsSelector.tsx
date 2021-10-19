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
  loadTerms: (
    fetchOptions: FetchOptionsFunction,
    namespace?: string
  ) => Promise<Term[]>;

  definitionRelated: DefinitionallyRelatedTerms;
  definitionRelatedChanges: DefinitionRelatedChanges;
  onDefinitionRelatedChange: (change: DefinitionRelatedChanges) => void;
}

interface RelatedTermsSelectorState {
  definitionRelated: string[];
}

export class RelatedTermsSelector extends React.Component<
  RelatedTermsSelectorProps,
  RelatedTermsSelectorState
> {
  private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

  constructor(props: RelatedTermsSelectorProps) {
    super(props);
    this.treeComponent = React.createRef();
    const source = Utils.sanitizeArray(
      this.props.definitionRelated.targeting
    ).filter((to) => !to.isSuggested());
    const set = new Set<string>();
    source.forEach((to) => set.add(to.term.iri!));
    this.state = {
      definitionRelated: [...set],
    };
  }

  public onChange = (val: Term[] | Term | null) => {
    if (!val) {
      this.updateDefinitionRelated([]);
      this.props.onChange([]);
    } else {
      const defRelated = this.state.definitionRelated;
      val = Utils.sanitizeArray(val);
      this.updateDefinitionRelated(val);
      this.props.onChange(
        val.filter(
          (v) =>
            v.iri !== this.props.term.iri && defRelated.indexOf(v.iri) === -1
        )
      );
    }
  };

  private updateDefinitionRelated(newValue: Term[]) {
    const selectedIris = Utils.extractIris(newValue);
    const newDefinitionRelated = this.state.definitionRelated.filter(
      (iri) => selectedIris.indexOf(iri) !== -1
    );
    let newPendingApprovals = Utils.sanitizeArray(
      this.props.definitionRelatedChanges.pendingApproval
    ).filter((to) => selectedIris.indexOf(to.term.iri!) !== -1);
    let newPendingRemovals =
      this.props.definitionRelatedChanges.pendingRemoval.concat(
        this.resolveDefinitionRelatedToRemove(selectedIris)
      );
    this.props.onDefinitionRelatedChange({
      pendingApproval: newPendingApprovals,
      pendingRemoval: newPendingRemovals,
    });
    this.setState({ definitionRelated: newDefinitionRelated });
  }

  private resolveDefinitionRelatedToRemove(selectedIris: string[]) {
    const oldSelectedIris = Utils.extractIris(this.props.selected).concat(
      this.state.definitionRelated
    );
    const removed = oldSelectedIris.filter(
      (iri) => selectedIris.indexOf(iri) === -1
    );
    return this.props.definitionRelated.targeting.filter(
      (to) => removed.indexOf(to.term.iri!) !== -1
    );
  }

  public onDefinitionRelatedChange = (change: DefinitionRelatedChanges) => {
    const approved = change.pendingApproval;
    const approvedIris = new Set<string>();
    approved.forEach((to) => approvedIris.add(to.term.iri!));
    this.onAddDefinitional([...approvedIris]);
    this.props.onDefinitionRelatedChange(change);
  };

  private onAddDefinitional = (toAdd: string[]) => {
    toAdd = toAdd.filter(
      (item) => this.props.selected.find((i) => i.iri === item) === undefined
    );
    if (this.treeComponent.current) {
      const options = this.treeComponent.current.getOptions();
      if (!RelatedTermsSelector.isSubset(toAdd, options)) {
        // If the newly added terms are not among options, we need to reload
        this.treeComponent.current.resetOptions();
      }
    }
    this.setState({ definitionRelated: toAdd });
  };

  private static isSubset(subset: string[], superset: Term[]) {
    for (let tIri of subset) {
      if (superset.find((st) => st.iri === tIri) === undefined) {
        return false;
      }
    }
    return true;
  }

  public fetchOptions = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    // If the offset is > 0, the selected terms should have been already included
    const toInclude =
      fetchOptions.offset === 0 ? resolveSelectedIris(this.props.selected) : [];
    // Include definition related that are not already among selected
    toInclude.push(
      ...this.state.definitionRelated.filter(
        (iri) => toInclude.indexOf(iri) === -1
      )
    );
    return this.props
      .loadTerms(
        {
          ...fetchOptions,
          includeTerms: toInclude,
        },
        fetchOptions.optionID
          ? VocabularyUtils.create(fetchOptions.optionID).namespace
          : undefined
      )
      .then((terms) => {
        if (!this.props.term.iri) {
          return terms;
        }
        return processTermsForTreeSelect(terms, undefined, {
          searchString: fetchOptions.searchString,
          selectedIris: toInclude,
        });
      });
  };

  public render() {
    const value = [
      ...resolveSelectedIris(this.props.selected),
      ...this.state.definitionRelated,
    ];
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
            ref={this.treeComponent}
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
          pending={this.props.definitionRelatedChanges}
          onChange={this.onDefinitionRelatedChange}
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
