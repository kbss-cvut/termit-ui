import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term, { TermData } from "../../model/Term";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
import { connect } from "react-redux";
import {
  TermFetchParams,
  ThunkDispatch,
  TreeSelectFetchOptionsParams,
} from "../../util/Types";
import { loadImportedVocabularies, loadTerms } from "../../action/AsyncActions";
import { FormFeedback, FormGroup, Label } from "reactstrap";
import Utils from "../../util/Utils";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import IncludeImportedTermsToggle from "./IncludeImportedTermsToggle";
import {
  createTermsWithImportsOptionRenderer,
  createTermValueRenderer,
} from "../misc/treeselect/Renderers";
import Vocabulary from "../../model/Vocabulary";
import TermItState from "../../model/TermItState";
import CustomInput from "../misc/CustomInput";
import {
  commonTermTreeSelectProps,
  loadAndPrepareTerms,
  resolveSelectedIris,
} from "./TermTreeSelectHelper";
import HelpIcon from "../misc/HelpIcon";
import Constants from "../../util/Constants";

function filterOutCurrentTerm(terms: Term[], currentTermIri?: string) {
  if (currentTermIri) {
    const result = [];
    for (const t of terms) {
      if (t.iri === currentTermIri) {
        continue;
      }
      if (t.plainSubTerms) {
        t.plainSubTerms = t.plainSubTerms.filter((st) => st !== currentTermIri);
      }
      result.push(t);
    }
    return result;
  } else {
    return terms;
  }
}

interface ParentTermSelectorProps extends HasI18n {
  id: string;
  termIri?: string;
  parentTerms?: TermData[];
  validationMessage?: string | JSX.Element;
  vocabularyIri: string;
  currentVocabulary?: Vocabulary;
  onChange: (newParents: Term[]) => void;
  loadTerms: (
    fetchOptions: TermFetchParams<TermData>,
    vocabularyIri: IRI
  ) => Promise<Term[]>;
  loadImportedVocabularies: (vocabularyIri: IRI) => Promise<string[]>;
}

interface ParentTermSelectorState {
  includeImported: boolean;
  importedVocabularies?: string[];
  disableIncludeImportedToggle: boolean;
}

export class ParentTermSelector extends React.Component<
  ParentTermSelectorProps,
  ParentTermSelectorState
> {
  private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

  constructor(props: ParentTermSelectorProps) {
    super(props);
    this.treeComponent = React.createRef();
    this.state = {
      includeImported: ParentTermSelector.hasParentInDifferentVocabulary(
        props.vocabularyIri,
        props.parentTerms
      ),
      disableIncludeImportedToggle: false,
    };
  }

  private static hasParentInDifferentVocabulary(
    vocabularyIri: string,
    parentTerms?: TermData[]
  ) {
    return (
      Utils.sanitizeArray(parentTerms).findIndex(
        (pt) =>
          pt.vocabulary !== undefined && pt.vocabulary.iri !== vocabularyIri
      ) !== -1
    );
  }

  public componentDidMount(): void {
    if (
      this.props.currentVocabulary &&
      this.props.currentVocabulary.iri === this.props.vocabularyIri
    ) {
      // No need to load imported vocabularies when vocabulary in state matches the term's vocabulary
      this.setState({
        importedVocabularies:
          this.props.currentVocabulary.allImportedVocabularies,
      });
    } else {
      this.props
        .loadImportedVocabularies(
          VocabularyUtils.create(this.props.vocabularyIri)
        )
        .then((data) => this.setState({ importedVocabularies: data }));
    }
  }

  public componentDidUpdate(): void {
    if (!this.state.importedVocabularies) {
      // This can happen when the component is displayed while vocabulary is still being loaded
      this.props
        .loadImportedVocabularies(
          VocabularyUtils.create(this.props.vocabularyIri)
        )
        .then((data) => this.setState({ importedVocabularies: data }));
    }
  }

  public onChange = (val: Term[] | Term | null) => {
    this.props.onChange(
      Utils.sanitizeArray(val).filter((v) => v.iri !== this.props.termIri)
    );
  };

  public fetchOptions = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    this.toggleIncludeImportedDisabled();
    const matchingVocabularies = this.state.includeImported
      ? Utils.sanitizeArray(this.state.importedVocabularies).concat(
          this.props.vocabularyIri
        )
      : [this.props.vocabularyIri];
    return loadAndPrepareTerms(
      { ...fetchOptions, includeImported: this.state.includeImported },
      (options) =>
        this.props.loadTerms(
          options,
          VocabularyUtils.create(
            options.option
              ? options.option.vocabulary!.iri!
              : this.props.vocabularyIri
          )
        ),
      {
        selectedTerms: this.props.parentTerms,
        matchingVocabularies,
      }
    ).then((terms) => {
      this.toggleIncludeImportedDisabled();
      return filterOutCurrentTerm(terms, this.props.termIri);
    });
  };

  private toggleIncludeImportedDisabled() {
    this.setState({
      disableIncludeImportedToggle: !this.state.disableIncludeImportedToggle,
    });
  }

  private onIncludeImportedToggle = () => {
    this.setState({ includeImported: !this.state.includeImported }, () =>
      this.treeComponent.current.resetOptions()
    );
  };

  public render() {
    const i18n = this.props.i18n;
    return (
      <FormGroup id={this.props.id}>
        <div className="d-flex justify-content-between">
          <Label className="attribute-label">
            {i18n("term.metadata.parent")}
            <HelpIcon
              id={"parent-term-select"}
              text={i18n("term.parent.help")}
            />
          </Label>
          <IncludeImportedTermsToggle
            id={this.props.id + "-include-imported"}
            onToggle={this.onIncludeImportedToggle}
            includeImported={this.state.includeImported}
            style={{ alignSelf: "flex-end" }}
            disabled={this.state.disableIncludeImportedToggle}
          />
        </div>
        {this.renderSelector()}
      </FormGroup>
    );
  }

  private renderSelector() {
    const i18n = this.props.i18n;
    if (!this.state.importedVocabularies) {
      // render placeholder input until imported vocabularies are loaded
      return (
        <CustomInput
          placeholder={i18n("glossary.select.placeholder")}
          disabled={true}
          help={i18n("term.parent.help")}
        />
      );
    } else {
      return (
        <>
          <IntelligentTreeSelect
            onChange={this.onChange}
            ref={this.treeComponent}
            value={resolveSelectedIris(this.props.parentTerms)}
            fetchOptions={this.fetchOptions}
            fetchLimit={Constants.DEFAULT_TERM_SELECTOR_FETCH_SIZE}
            maxHeight={200}
            multi={true}
            optionRenderer={createTermsWithImportsOptionRenderer(
              this.props.vocabularyIri
            )}
            valueRenderer={createTermValueRenderer(this.props.vocabularyIri)}
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
  }
}

export default connect(
  (state: TermItState) => {
    return {
      currentVocabulary: state.vocabulary,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      loadTerms: (
        fetchOptions: TermFetchParams<TermData>,
        vocabularyIri: IRI
      ) => dispatch(loadTerms(fetchOptions, vocabularyIri)),
      loadImportedVocabularies: (vocabularyIri: IRI) =>
        dispatch(loadImportedVocabularies(vocabularyIri)),
    };
  }
)(injectIntl(withI18n(ParentTermSelector)));
