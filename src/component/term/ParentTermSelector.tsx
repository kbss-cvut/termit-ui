import React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term, { TERM_BROADER_SUBPROPERTIES, TermData } from "../../model/Term";
import FetchOptionsFunction from "../../model/Functions";
import { connect } from "react-redux";
import { ThunkDispatch, TreeSelectFetchOptionsParams } from "../../util/Types";
import { ButtonToolbar, FormFeedback, FormGroup, Label } from "reactstrap";
import Utils from "../../util/Utils";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { createTermsWithVocabularyInfoRenderer } from "../misc/treeselect/Renderers";
import { commonTermTreeSelectProps } from "./TermTreeSelectHelper";
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
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import TermItState from "../../model/TermItState";
import TermLink from "./TermLink";
import BadgeButton from "../misc/BadgeButton";
import BroaderTypeSelector from "./BroaderTypeSelector";
import BaseRelatedTermSelector, {
  BaseRelatedTermSelectorProps,
  BaseRelatedTermSelectorState,
} from "./BaseRelatedTermSelector";

export const PARENT_ATTRIBUTES = [
  {
    attribute: "parentTerms",
    property: VocabularyUtils.BROADER,
    labelKey: "term.metadata.parent",
    selectorLabelKey: "term.metadata.broader",
    selectorHintKey: "term.metadata.broader.hint",
  },
  ...TERM_BROADER_SUBPROPERTIES,
];

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

interface ParentTermSelectorProps
  extends HasI18n,
    BaseRelatedTermSelectorProps {
  id: string;
  term: Term | TermData;
  parentTerms?: TermData[];
  validationMessage?: string | JSX.Element;
  vocabularyIri: string;
  onChange: (change: Partial<TermData>) => void;
}

interface ParentTermSelectorState extends BaseRelatedTermSelectorState {
  currentBroaderAttribute: string | null;
  currentBroaderTerm: Term | null;
  showBroaderTypeSelector: boolean;
}

export class ParentTermSelector extends BaseRelatedTermSelector<
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
      currentBroaderAttribute: null,
      currentBroaderTerm: null,
      showBroaderTypeSelector: false,
    };
  }

  public onChange = (val: Term | Term[] | null) => {
    if (!val) {
      // This should not happen since there actually is no value to remove from the tree select
      const change = {};
      PARENT_ATTRIBUTES.forEach((pa) => (change[pa.attribute] = []));
      this.props.onChange(change);
    } else {
      const term = this.props.term;
      const newParents = Utils.sanitizeArray(term.parentTerms).concat(
        Utils.sanitizeArray(val).filter((t) => t.iri !== term.iri)
      );
      newParents.sort(Term.labelComparator);
      this.props.onChange({ parentTerms: newParents });
    }
  };

  private onRemove = (toRemove: Term, attribute: string) => {
    this.props.onChange(
      this.constructBroaderRemovalChange(toRemove, attribute)
    );
  };

  private constructBroaderRemovalChange(
    toRemove: Term,
    attribute: string
  ): Partial<Term> {
    // Assume the value is not empty
    const newValue: Term[] = this.props.term[attribute].slice();
    newValue.splice(newValue.indexOf(toRemove), 1);
    const change: Partial<Term> = {};
    change[attribute] = newValue;
    return change;
  }

  private onEditBroaderProperty = (
    term: Term,
    currentBroaderAttribute: string
  ) => {
    this.setState({
      currentBroaderTerm: term,
      currentBroaderAttribute,
      showBroaderTypeSelector: true,
    });
  };

  public onBroaderTypeSelect = (attribute: string) => {
    const update: Partial<Term> = {};
    update[attribute] = Utils.sanitizeArray(this.props.term[attribute]).slice();
    update[attribute].push(this.state.currentBroaderTerm!);
    update[attribute].sort(Term.labelComparator);
    Object.assign(
      update,
      this.constructBroaderRemovalChange(
        this.state.currentBroaderTerm!,
        this.state.currentBroaderAttribute!
      )
    );
    this.props.onChange(update);
    this.closeBroaderTypeSelect();
  };

  public closeBroaderTypeSelect = () => {
    this.setState({
      currentBroaderTerm: null,
      currentBroaderAttribute: null,
      showBroaderTypeSelector: false,
    });
  };

  public fetchOptions = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    return super
      .fetchOptions(fetchOptions)
      .then((terms) =>
        BaseRelatedTermSelector.enhanceWithCurrent(
          terms,
          this.props.term.iri,
          Term.consolidateBroaderTerms(this.props.term)
        )
      );
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
    const i18n = this.props.i18n;
    return (
      <>
        <BroaderTypeSelector
          onSelect={this.onBroaderTypeSelect}
          onCancel={this.closeBroaderTypeSelect}
          show={this.state.showBroaderTypeSelector}
          currentValue={this.state.currentBroaderAttribute!}
        />
        <IntelligentTreeSelect
          onChange={this.onChange}
          ref={this.treeComponent}
          value={[]}
          fetchOptions={this.fetchOptions}
          fetchLimit={300}
          searchDelay={300}
          maxHeight={200}
          multi={true}
          optionRenderer={createTermsWithVocabularyInfoRenderer()}
          valueRenderer={createValueRenderer()}
          {...commonTermTreeSelectProps(this.props)}
        />
        {this.props.validationMessage && (
          <FormFeedback
            className="validation-feedback"
            title={i18n("validation.message.tooltip")}
          >
            {this.props.validationMessage}
          </FormFeedback>
        )}
      </>
    );
  }

  private renderSelected() {
    const { i18n, term, workspace } = this.props;
    return (
      <table className="mt-1">
        <tbody>
          {PARENT_ATTRIBUTES.map((pt) =>
            Utils.sanitizeArray(term[pt.attribute]).map((value) => (
              <tr key={value.iri}>
                <td className="align-middle">
                  <ul className="term-items mt-0 mb-0">
                    <li>
                      <VocabularyNameBadge
                        className="mr-1 align-text-top"
                        vocabulary={value.vocabulary}
                      />
                      {value.vocabulary &&
                      workspace.containsVocabulary(value.vocabulary.iri) ? (
                        <TermLink term={value} />
                      ) : (
                        getLocalized(value.label)
                      )}
                    </li>
                  </ul>
                </td>
                <td className="align-middle pl-3">
                  <ButtonToolbar>
                    <BadgeButton
                      color="primary"
                      title={i18n(pt.selectorHintKey)}
                      className="term-broader-selector"
                      onClick={() =>
                        this.onEditBroaderProperty(value, pt.attribute)
                      }
                    >
                      <FaPencilAlt className="mr-1" />
                      {i18n(pt.selectorLabelKey)}
                    </BadgeButton>
                    <BadgeButton
                      color="danger"
                      outline={true}
                      className="m-broader-remove"
                      onClick={() => this.onRemove(value, pt.attribute)}
                    >
                      <FaTrashAlt className="mr-1" />
                      {i18n("properties.edit.remove.text")}
                    </BadgeButton>
                  </ButtonToolbar>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  }
}

export default connect(
  (state: TermItState) => ({ workspace: state.workspace! }),
  (dispatch: ThunkDispatch) => {
    return {
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
)(injectIntl(withI18n(ParentTermSelector)));
