import * as React from "react";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term, { TermData, TermInfo } from "../../model/Term";
import {
  TermFetchParams,
  ThunkDispatch,
  TreeSelectFetchOptionsParams,
} from "../../util/Types";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import {
  commonTermTreeSelectProps,
  loadAndPrepareTerms,
  resolveNamespaceForLoadAll,
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
import HelpIcon from "../misc/HelpIcon";
import DefinitionRelatedTermsEdit, {
  DefinitionRelatedChanges,
} from "./DefinitionRelatedTermsEdit";
import TermItState, {
  DefinitionallyRelatedTerms,
} from "../../model/TermItState";
import Constants from "../../util/Constants";
import ShowFlatListToggle from "./state/ShowFlatListToggle";

interface RelatedTermsSelectorProps extends HasI18n {
  id: string;
  term: Term;
  vocabularyIri: string;
  selected: TermInfo[];
  onChange: (value: Term[]) => void;
  language: string;
  terminalStates: string[];
  loadTerms: (
    fetchOptions: TermFetchParams<TermData>,
    namespace?: string
  ) => Promise<Term[]>;

  definitionRelated: DefinitionallyRelatedTerms;
  definitionRelatedChanges: DefinitionRelatedChanges;
  onDefinitionRelatedChange: (change: DefinitionRelatedChanges) => void;
}

interface RelatedTermsSelectorState {
  flatList: boolean;
}

export class RelatedTermsSelector extends React.Component<
  RelatedTermsSelectorProps,
  RelatedTermsSelectorState
> {
  private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

  constructor(props: RelatedTermsSelectorProps) {
    super(props);
    this.treeComponent = React.createRef();
    this.state = {
      flatList: false,
    };
  }

  public onChange = (val: Term[] | Term | null) => {
    this.props.onChange(
      Utils.sanitizeArray(val).filter((v) => v.iri !== this.props.term.iri)
    );
  };

  public fetchOptions = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    return loadAndPrepareTerms(
      {
        ...fetchOptions,
        flatList: this.state.flatList,
      },
      (options) =>
        this.props.loadTerms(options, resolveNamespaceForLoadAll(options)),
      {
        selectedTerms: this.props.selected,
        terminalStates: this.props.terminalStates,
      }
    );
  };

  private onFlatListToggle = () => {
    this.setState({ flatList: !this.state.flatList }, () =>
      this.treeComponent.current.resetOptions()
    );
  };

  public render() {
    const treeSelectProps = {
      ...commonTermTreeSelectProps(this.props),
      renderAsTree: !this.state.flatList,
    };

    return (
      <FormGroup id={this.props.id}>
        <div className="d-flex justify-content-between">
          <Label className="attribute-label">
            {this.props.i18n("term.metadata.related.title")}
            <HelpIcon
              id="related-term-select"
              text={this.props.i18n("term.metadata.related.help")}
            />
          </Label>
          <ShowFlatListToggle
            id={this.props.id + "-show-flat-list"}
            onToggle={this.onFlatListToggle}
            value={this.state.flatList}
          />
        </div>
        <>
          <IntelligentTreeSelect
            onChange={this.onChange}
            ref={this.treeComponent}
            value={resolveSelectedIris(this.props.selected)}
            fetchOptions={this.fetchOptions}
            fetchLimit={Constants.DEFAULT_PAGE_SIZE}
            maxHeight={200}
            multi={true}
            optionRenderer={createTermsWithImportsOptionRenderer(
              this.props.vocabularyIri
            )}
            valueRenderer={createTermValueRenderer(this.props.vocabularyIri)}
            {...treeSelectProps}
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
    terminalStates: state.terminalStates,
  }),
  (dispatch: ThunkDispatch) => ({
    loadTerms: (fetchOptions: TermFetchParams<TermData>, namespace?: string) =>
      dispatch(loadAllTerms(fetchOptions, namespace)),
  })
)(injectIntl(withI18n(RelatedTermsSelector)));
