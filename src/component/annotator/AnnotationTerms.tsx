import * as React from "react";
import { injectIntl } from "react-intl";
import { Button, FormGroup, FormText, Label } from "reactstrap";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Vocabulary from "../../model/Vocabulary";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import "intelligent-tree-select/lib/styles.css";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import { selectVocabularyTerm } from "../../action/SyncActions";
import { RouteComponentProps, withRouter } from "react-router";
import Term, { TermData } from "../../model/Term";
import { ThunkDispatch } from "../../util/Types";
import { GoPlus } from "react-icons/go";
import Utils from "../../util/Utils";
import {
  commonTermTreeSelectProps,
  processTermsForTreeSelect,
} from "../term/TermTreeSelectHelper";
import {
  createTermsWithImportsOptionRenderer,
  createTermValueRenderer,
} from "../misc/treeselect/Renderers";
import IfUserIsEditor from "../authorization/IfUserIsEditor";

interface GlossaryTermsProps extends HasI18n, RouteComponentProps<any> {
  vocabulary?: Vocabulary;
  terms: { [key: string]: Term };
  counter: number;
  selectVocabularyTerm: (selectedTerms: Term | null) => void;
}

interface AnnotationTermsProps extends GlossaryTermsProps {
  canCreateTerm?: boolean;
  onChange: (term: Term | null) => void;
  selectedTerm: Term | null;
  onCreateTerm?: () => void;
}

export class AnnotationTerms extends React.Component<AnnotationTermsProps> {
  private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

  public static defaultProps: Partial<AnnotationTermsProps> = {
    canCreateTerm: true,
  };

  constructor(props: AnnotationTermsProps) {
    super(props);
    this.treeComponent = React.createRef();
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.treeComponent.current) {
        // This is a workaround because autoFocus was causing issues with scrolling (screen would jump to the top due to the initial position of the popover)
        this.treeComponent.current.focus();
      }
    }, 100);
  }

  public componentDidUpdate(prevProps: AnnotationTermsProps) {
    if (prevProps.counter < this.props.counter) {
      this.forceUpdate();
    }
    if (prevProps.locale !== this.props.locale) {
      this.treeComponent.current.forceUpdate();
    }
  }

  public componentWillUnmount() {
    this.props.selectVocabularyTerm(null);
  }

  private handleChange = (term: TermData | null) => {
    if (term === null) {
      this.props.selectVocabularyTerm(term);
      // this.props.onChange(null);
      this.props.onChange(null);
    } else {
      // The tree component adds depth and expanded attributes to the options when rendering,
      // We need to get rid of them before working with the term
      // We are creating a defensive copy of the term so that the rest of the application and the tree component
      // have their own versions
      const cloneData = Object.assign({}, term);
      // @ts-ignore
      delete cloneData.expanded;
      // @ts-ignore
      delete cloneData.depth;
      const clone = new Term(cloneData);
      this.props.selectVocabularyTerm(clone);
      this.props.onChange(clone);
    }
  };

  public render() {
    const { i18n, vocabulary } = this.props;
    const terms = processTermsForTreeSelect(
      Object.keys(this.props.terms).map((k) => this.props.terms[k]),
      Utils.sanitizeArray(vocabulary!.allImportedVocabularies).concat(
        vocabulary!.iri
      )
    );

    return (
      <IfUserIsEditor
        renderUnauthorizedAlert={true}
        unauthorized={<p>{i18n("annotator.unknown.unauthorized")}</p>}
      >
        <FormGroup>
          <div className="align-items-center d-flex mb-2">
            <div className="flex-grow-1">
              <Label className="attribute-label mb-0">
                {i18n("type.term") + ":"}
              </Label>
            </div>
            {this.props.canCreateTerm && (
              <Button
                key="annotator.createTerm"
                color="primary"
                title={i18n("glossary.createTerm.tooltip")}
                size="sm"
                onClick={this.props.onCreateTerm}
                className="pull-right"
              >
                <GoPlus className="mr-1" />
                {i18n("annotator.createTerm.button")}
              </Button>
            )}
          </div>
          <IntelligentTreeSelect
            ref={this.treeComponent}
            className="mt-1 p-0"
            onChange={this.handleChange}
            value={this.props.selectedTerm}
            options={terms}
            isMenuOpen={false}
            multi={false}
            optionRenderer={createTermsWithImportsOptionRenderer(
              this.props.vocabulary!.iri
            )}
            valueRenderer={createTermValueRenderer(this.props.vocabulary!.iri)}
            {...commonTermTreeSelectProps(this.props)}
          />
          <FormText>{i18n("annotation.term.select.placeholder")}</FormText>
        </FormGroup>
      </IfUserIsEditor>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      vocabulary: state.vocabulary,
      terms: state.annotatorTerms,
      counter: state.createdTermsCounter,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      selectVocabularyTerm: (selectedTerm: Term | null) =>
        dispatch(selectVocabularyTerm(selectedTerm)),
    };
  }
)(injectIntl(withI18n(withRouter(AnnotationTerms))));
