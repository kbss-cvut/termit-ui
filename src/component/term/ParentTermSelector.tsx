import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TermData} from "../../model/Term";
import FetchOptionsFunction from "../../model/Functions";
import {connect} from "react-redux";
import {ThunkDispatch, TreeSelectFetchOptionsParams} from "../../util/Types";
import {FormFeedback, FormGroup, FormText, Label,} from "reactstrap";
import Utils from "../../util/Utils";
// @ts-ignore
import {IntelligentTreeSelect} from "intelligent-tree-select";
import {createTermsWithVocabularyInfoRenderer} from "../misc/treeselect/Renderers";
import {commonTermTreeSelectProps, processTermsForTreeSelect,} from "./TermTreeSelectHelper";
import {loadTermsForParentSelector,} from "../../action/AsyncTermActions";
import OutgoingLink from "../misc/OutgoingLink";
import VocabularyNameBadge from "../vocabulary/VocabularyNameBadge";
import {getLocalized} from "../../model/MultilingualString";

function enhanceWithCurrentTerm(
  terms: Term[],
  vocabularyIri: string,
  currentTermIri?: string,
  parentTerms?: Term[]
): Term[] {
  if (currentTermIri) {
    const currentParents = Utils.sanitizeArray(parentTerms).slice();
    const currentVocResult = [];
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
        if (t.vocabulary && t.vocabulary.iri === vocabularyIri) {
          // Prioritize current vocabulary terms
          currentVocResult.push(t);
        } else {
          result.push(t);
        }
      }
    }
    // Add parents which are not in the loaded terms so that they show up in the list
    return currentParents.concat(currentVocResult).concat(result);
  } else {
    return terms;
  }
}

function createValueRenderer() {
  return (term: Term) => (
    <OutgoingLink label={<><VocabularyNameBadge className="mr-1 align-text-top" vocabulary={term.vocabulary}/>{getLocalized(term.label)}</>} iri={term.iri} />
  );
}

interface ParentTermSelectorProps extends HasI18n {
  id: string;
  termIri?: string;
  parentTerms?: Term[];
  invalid?: boolean;
  invalidMessage?: JSX.Element;
  vocabularyIri: string;
  onChange: (newParents: Term[]) => void;
  loadTerms: (
    fetchOptions: FetchOptionsFunction,
  ) => Promise<Term[]>;
}

export class ParentTermSelector extends React.Component<
  ParentTermSelectorProps
> {
  private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

  constructor(props: ParentTermSelectorProps) {
    super(props);
    this.treeComponent = React.createRef();
  }

  public onChange = (val: Term[] | Term | null) => {
    if (!val) {
      this.props.onChange([]);
    } else {
      if (!this.props.termIri) {
        this.props.onChange(Utils.sanitizeArray(val));
      } else {
        this.props.onChange(
          Utils.sanitizeArray(val).filter((v) => v.iri !== this.props.termIri)
        );
      }
    }
  };

  public fetchOptions = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    this.setState({ disableConfig: true });
    return this.props.loadTerms(fetchOptions).then((terms) => {
      this.setState({ disableConfig: false });
      return enhanceWithCurrentTerm(
          processTermsForTreeSelect(terms, undefined, {
            searchString: fetchOptions.searchString,
          }),
          this.props.vocabularyIri,
          this.props.termIri,
          this.props.parentTerms
      );
    });
  };

  private resolveSelectedParents() {
    const parents = Utils.sanitizeArray(this.props.parentTerms);
    return parents.filter((p) => p.vocabulary !== undefined).map((p) => p.iri);
  }

  public render() {
    const i18n = this.props.i18n;
    return (
      <FormGroup id={this.props.id}>
        <Label className="attribute-label">
          {i18n("term.metadata.parent")}
        </Label>
        {this.renderSelector()}
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
          value={this.resolveSelectedParents()}
          fetchOptions={this.fetchOptions}
          fetchLimit={100}
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
        <FormText>{this.props.i18n("term.parent.help")}</FormText>
      </>
    );
  }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    loadTerms: (
      fetchOptions: FetchOptionsFunction
    ) => dispatch(loadTermsForParentSelector(fetchOptions)),
  };
})(injectIntl(withI18n(ParentTermSelector)));
