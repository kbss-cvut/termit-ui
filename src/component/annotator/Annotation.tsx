import * as React from "react";
import Term from "../../model/Term";
import "./Annotation.scss";
import { AnnotationSpanProps } from "./Annotator";
import { AnnotationType } from "./AnnotationDomHelper";
import TermOccurrenceAnnotation from "./TermOccurrenceAnnotation";
import TermDefinitionAnnotation from "./TermDefinitionAnnotation";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import { ThunkDispatch } from "../../util/Types";
import { loadTermByIri } from "../../action/AsyncAnnotatorActions";
import Asset from "../../model/Asset";
import AccessLevel from "../../model/acl/AccessLevel";
import classNames from "classnames";
import AnnotatorLegendFilter, {
  AnnotationClass,
  AnnotationOrigin,
} from "../../model/AnnotatorLegendFilter";

interface AnnotationProps extends AnnotationSpanProps {
  about: string;
  property: string;
  resource?: string;
  content?: string;
  typeof: string;
  score?: string;
  text: string;
  sticky?: boolean;
  tag: "span" | "div"; // Tag in which the annotation will be rendered
  onRemove: (annId: string) => void;
  onUpdate: (annotation: AnnotationSpanProps, term: Term | null) => void;
  onCreateTerm: (label: string, annotation: AnnotationSpanProps) => void;
  term?: Term;
  onFetchTerm: (
    termIri: string,
    abortController: AbortController
  ) => Promise<Term | null>;
  onResetSticky: () => void; // Resets sticky annotation status
  accessLevel: AccessLevel;
  highlight?: boolean;
  filter: AnnotatorLegendFilter;
}

interface AnnotationState {
  detailOpened: boolean;
  term: Term | null | undefined;
  termFetchFinished: boolean;
  abortController: AbortController;
}

export function isDefinitionAnnotation(type: string) {
  return type === AnnotationType.DEFINITION;
}

export class Annotation extends React.Component<
  AnnotationProps,
  AnnotationState
> {
  public static defaultProps: Partial<AnnotationProps> = {
    tag: "span",
  };

  constructor(props: AnnotationProps) {
    super(props);
    const resourceAssigned = props.resource && props.resource.length > 0;
    this.state = {
      detailOpened: false,
      term: resourceAssigned ? props.term : null,
      termFetchFinished: false,
      abortController: new AbortController(),
    };
  }

  public componentDidMount() {
    this.fetchTerm();
    if (this.props.sticky) {
      this.setState({
        detailOpened: true,
      });
    }
  }

  public componentDidUpdate(prevProps: AnnotationProps) {
    if (prevProps.resource !== this.props.resource) {
      this.fetchTerm();
    }
    // Need to check for sticky here, because on mount the state change in annotator may not have happened, yet
    if (!prevProps.sticky && this.props.sticky) {
      this.setState({
        detailOpened: true,
      });
    }
  }

  public shouldComponentUpdate(
    nextProps: Readonly<AnnotationProps>,
    nextState: Readonly<AnnotationState>,
    nextContext: any
  ): boolean {
    if (
      nextProps.sticky !== this.props.sticky ||
      nextProps.text !== this.props.text ||
      nextProps.resource !== this.props.resource ||
      nextProps.score !== this.props.score ||
      nextProps.highlight !== this.props.highlight ||
      this.isHidden(nextProps) !== this.isHidden(this.props)
    ) {
      return true;
    }
    return (
      this.state.detailOpened !== nextState.detailOpened ||
      this.state.termFetchFinished !== nextState.termFetchFinished ||
      !Asset.equals(this.state.term, nextState.term)
    );
  }

  componentWillUnmount() {
    this.state.abortController.abort();
  }

  private fetchTerm = () => {
    if (this.state.term) {
      this.setState({ termFetchFinished: true });
      return;
    }
    if (this.props.resource) {
      this.setState({
        termFetchFinished: false,
        abortController: new AbortController(),
      });
      this.props
        .onFetchTerm(this.props.resource, this.state.abortController)
        .then((t) => {
          if (this.state.abortController.signal.aborted) {
            return;
          }
          this.setState({
            term: t,
            termFetchFinished: true,
          });
        })
        .catch(() => {
          if (this.state.abortController.signal.aborted) {
            return;
          }
          this.setState({
            term: undefined,
            termFetchFinished: true,
          });
        });
    } else {
      this.setState({
        term: null,
        termFetchFinished: true,
      });
    }
  };

  private toggleOpenDetail = () => {
    this.setState({
      detailOpened: !this.state.detailOpened,
    });
  };

  public onSelectTerm = (t: Term | null) => {
    this.setState({
      detailOpened: false,
      term: t,
    });
    if (this.props.onUpdate) {
      const newAnnotation: AnnotationSpanProps = {
        about: this.props.about,
        property: this.props.property,
        typeof: this.props.typeof,
        score: this.props.score,
      };
      newAnnotation.resource = t ? t.iri : undefined;
      this.props.onUpdate(newAnnotation, t);
    }
  };

  public onRemoveAnnotation = () => {
    if (this.props.onRemove) {
      this.props.onRemove(this.props.about);
    }
  };

  public onCloseDetail = () => {
    this.setState({
      detailOpened: false,
    });
    if (this.props.sticky) {
      this.props.onResetSticky();
    }
  };

  private onClick = () => {
    if (!this.isHidden(this.props)) {
      this.toggleOpenDetail();
    }
  };

  public onCreateTerm = () => {
    this.onCloseDetail();
    const newAnnotation: AnnotationSpanProps = {
      about: this.props.about,
      property: this.props.property,
      resource: this.props.resource,
      typeof: this.props.typeof,
      score: this.props.score,
    };
    this.props.onCreateTerm(
      this.props.content ? this.props.content : this.props.text,
      newAnnotation
    );
  };

  private getTermState = () => {
    if (!this.state.termFetchFinished) {
      return AnnotationClass.LOADING;
    }
    if (this.state.term === null) {
      return isDefinitionAnnotation(this.props.typeof)
        ? AnnotationClass.PENDING_DEFINITION
        : AnnotationClass.SUGGESTED_OCCURRENCE;
    }
    if (this.state.term) {
      return isDefinitionAnnotation(this.props.typeof)
        ? AnnotationClass.DEFINITION
        : AnnotationClass.ASSIGNED_OCCURRENCE;
    }
    return AnnotationClass.INVALID;
  };

  private getTermCreatorState = () => {
    if (this.props.score) {
      return AnnotationOrigin.PROPOSED;
    }
    return AnnotationOrigin.SELECTED;
  };

  private getCurrentResource = () => {
    if (this.state.term) {
      return this.state.term.iri;
    }
    if (this.state.term === undefined && this.props.resource !== "") {
      return this.props.resource;
    }
    return;
  };

  private isHidden = (props: AnnotationProps) => {
    if (!props.filter) {
      return false;
    }
    return !props.filter.get(this.getTermState(), this.getTermCreatorState());
  };

  public render() {
    const id = "id" + this.props.about.substring(2);
    const termClassName = this.getTermState();
    const termCreatorClassName = this.getTermCreatorState();
    const resourceProps = this.getCurrentResource()
      ? { resource: this.getCurrentResource() }
      : {};
    const scoreProps = this.props.score
      ? { score: this.props.score.toString() }
      : {};
    const contentProps = this.props.content
      ? { content: this.props.content }
      : {};
    const Tag = this.props.tag;

    let className = classNames(termClassName, termCreatorClassName, {
      "annotator-highlighted-annotation": this.props.highlight,
    });

    if (this.isHidden(this.props) && !this.props.highlight) {
      className = "";
    }

    return (
      <Tag
        id={id}
        onClick={this.onClick}
        about={this.props.about}
        property={this.props.property}
        {...resourceProps}
        {...contentProps}
        typeof={this.props.typeof}
        {...scoreProps}
        className={className}
      >
        {this.props.children}
        {this.props.typeof === AnnotationType.DEFINITION
          ? this.renderDefinitionAnnotation(id)
          : this.renderOccurrenceAnnotation(id)}
      </Tag>
    );
  }

  private renderOccurrenceAnnotation(id: string) {
    return (
      <TermOccurrenceAnnotation
        target={id}
        term={this.state.term}
        score={this.props.score}
        resource={this.props.resource}
        text={this.props.text}
        annotationClass={this.getTermState()}
        annotationOrigin={this.getTermCreatorState()}
        isOpen={this.state.detailOpened}
        onRemove={this.onRemoveAnnotation}
        onSelectTerm={this.onSelectTerm}
        onCreateTerm={this.onCreateTerm}
        onToggleDetailOpen={this.toggleOpenDetail}
        onClose={this.onCloseDetail}
        accessLevel={this.props.accessLevel}
      />
    );
  }

  private renderDefinitionAnnotation(id: string) {
    return (
      <TermDefinitionAnnotation
        target={id}
        term={this.state.term}
        text={this.props.text}
        isOpen={this.state.detailOpened}
        onRemove={this.onRemoveAnnotation}
        onSelectTerm={this.onSelectTerm}
        onToggleDetailOpen={this.toggleOpenDetail}
        onClose={this.onCloseDetail}
        accessLevel={this.props.accessLevel}
      />
    );
  }
}

export default connect(
  (state: TermItState, props: AnnotationProps) => {
    return {
      term: props.resource ? state.annotatorTerms[props.resource] : undefined,
      filter: state.annotatorLegendFilter,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      onFetchTerm: (iri: string, abortController: AbortController) =>
        dispatch(loadTermByIri(iri, abortController)),
    };
  }
)(Annotation);
