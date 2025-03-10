import * as React from "react";
import { Element, Node as DomHandlerNode } from "domhandler";
import HtmlParserUtils from "./HtmlParserUtils";
import AnnotationDomHelper, { AnnotationType } from "./AnnotationDomHelper";
import Term, { TermData } from "../../model/Term";
import HtmlDomUtils, { getTermOccurrences } from "./HtmlDomUtils";
import LegendToggle from "./LegendToggle";
import { DomUtils } from "htmlparser2";
import VocabularyUtils, { IRI, IRIImpl } from "../../util/VocabularyUtils";
import CreateTermFromAnnotation, {
  CreateTermFromAnnotation as CT,
} from "./CreateTermFromAnnotation";
import SelectionPurposeDialog from "./SelectionPurposeDialog";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import Message from "../../model/Message";
import {
  publishMessage,
  setAnnotatorLegendFilter,
} from "../../action/SyncActions";
import MessageType from "../../model/MessageType";
import TermOccurrence, { TextQuoteSelector } from "../../model/TermOccurrence";
import {
  approveOccurrence,
  removeOccurrence,
  setTermDefinitionSource,
} from "../../action/AsyncTermActions";
import JsonLdUtils from "../../util/JsonLdUtils";
import Utils from "../../util/Utils";
import AnnotatorContent from "./AnnotatorContent";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { injectIntl } from "react-intl";
import WindowTitle from "../misc/WindowTitle";
import TermDefinitionEdit from "./TermDefinitionEdit";
import { updateTerm } from "../../action/AsyncActions";
import TermItState from "../../model/TermItState";
import User from "../../model/User";
import "./Annotator.scss";
import HeaderWithActions from "../misc/HeaderWithActions";
import { Card, CardBody } from "reactstrap";
import File from "../../model/File";
import TextAnalysisInvocationButton from "./TextAnalysisInvocationButton";
import classNames from "classnames";
import VocabularyLink from "../vocabulary/VocabularyLink";
import Vocabulary from "../../model/Vocabulary";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel, { hasAccess } from "../../model/acl/AccessLevel";
import { AssetData } from "../../model/Asset";
import {
  annotationIdToTermOccurrenceIri,
  createTermOccurrence,
} from "./AnnotatorUtil";
import { saveOccurrence } from "../../action/AsyncAnnotatorActions";
import HighlightTermOccurrencesButton from "./HighlightTermOccurrencesButton";
import {
  AnnotationClass,
  AnnotationOrigin,
} from "../../model/AnnotatorLegendFilter";
import AnnotatorDownloadActions from "./AnnotatorDownloadActions";

interface AnnotatorProps extends HasI18n {
  fileIri: IRI;
  vocabularyIri: IRI;
  initialHtml: string;
  scrollTo?: TextQuoteSelector; // Selector of an annotation to scroll to (and highlight) after rendering
  user: User;
  file: File;
  vocabulary: Vocabulary;
  annotationLanguage?: string;

  onUpdate: (newHtml: string) => Promise<void>;
  setAnnotatorLegendFilter: (
    annotationClass: AnnotationClass,
    annotationOrigin: AnnotationOrigin,
    enabled: boolean
  ) => void;

  publishMessage: (message: Message) => void;
  setTermDefinitionSource: (src: TermOccurrence, term: Term) => Promise<any>;
  updateTerm: (term: Term) => Promise<any>;
  approveTermOccurrence: (occurrence: AssetData) => Promise<any>;
  removeTermOccurrence: (occurrence: AssetData) => Promise<any>;
  saveTermOccurrence: (occurrence: TermOccurrence) => Promise<any>;
}

interface AnnotatorState {
  prefixMap: Map<string, string>;
  internalHtml: DomHandlerNode[];
  stickyAnnotationId: string;

  showSelectionPurposeDialog: boolean;
  selectionPurposeDialogAnchorPosition: { x: number; y: number };

  showNewTermDialog: boolean;
  newTermLabelAnnotation?: AnnotationSpanProps; // Annotation which is being used for new term label
  newTermDefinitionAnnotation?: AnnotationSpanProps; // Annotation which is being used for new term definition

  existingTermDefinitionAnnotationElement?: Element;
  selectedTerm?: Term;
  highlightedTerm: TermData | null;
  highlightedOccurrenceIndex: number;
}

export interface AnnotationSpanProps {
  about?: string;
  property?: string;
  resource?: string;
  content?: string;
  typeof?: string;
  score?: string;
}

const ANNOTATION_HIGHLIGHT_TIMEOUT = 5000;

export class Annotator extends React.Component<AnnotatorProps, AnnotatorState> {
  private containerElement = React.createRef<HTMLDivElement>();
  private createNewTermDialog = React.createRef<CT>();

  constructor(props: AnnotatorProps) {
    super(props);
    const htmlSplit = HtmlDomUtils.splitHtml(props.initialHtml);
    const prefixMap = Annotator.getPrefixesOfHtmlTag(
      htmlSplit.prefix + htmlSplit.suffix
    );
    this.state = {
      prefixMap,
      internalHtml: HtmlParserUtils.html2dom(htmlSplit.body),
      stickyAnnotationId: "",
      showSelectionPurposeDialog: false,
      selectionPurposeDialogAnchorPosition: { x: 0, y: 0 },
      showNewTermDialog: false,
      highlightedTerm: null,
      highlightedOccurrenceIndex: -1,
    };
  }

  private static getPrefixesOfHtmlTag(html: string): Map<string, string> {
    const dom = HtmlParserUtils.html2dom(html);
    const htmlNode = DomUtils.findOneChild(
      (n: DomHandlerNode) =>
        (n as Element).tagName === "html" &&
        (n as Element).attribs &&
        !!(n as Element).attribs.prefix,
      dom
    );
    if (htmlNode) {
      return HtmlParserUtils.getPrefixMap(htmlNode);
    }
    return new Map();
  }

  public componentDidMount(): void {
    this.highlightAnnotation();
    document.addEventListener("scroll", this.onScroll);
  }

  public componentWillUnmount() {
    document.removeEventListener("scroll", this.onScroll);
  }

  private onScroll = () => {
    this.forceUpdate();
  };

  private highlightAnnotation(): void {
    const scrollTo = this.props.scrollTo;
    if (scrollTo) {
      try {
        const highlightedElem = HtmlDomUtils.findAnnotationElementBySelector(
          document,
          scrollTo
        );
        highlightedElem.scrollIntoView({ block: "center" });
        HtmlDomUtils.addClassToElement(
          highlightedElem,
          "annotator-highlighted-annotation"
        );
        setTimeout(
          () =>
            HtmlDomUtils.removeClassFromElement(
              highlightedElem,
              "annotator-highlighted-annotation"
            ),
          ANNOTATION_HIGHLIGHT_TIMEOUT
        );
        if (highlightedElem.hasAttribute("about")) {
          this.setState({
            stickyAnnotationId: highlightedElem.getAttribute("about")!,
          });
        }
      } catch (e) {
        this.props.publishMessage(
          new Message(
            { messageId: "annotator.findAnnotation.error" },
            MessageType.ERROR
          )
        );
      }
    }
  }

  public resetStickyAnnotationId = () => {
    this.setState({ stickyAnnotationId: "" });
  };

  public onRemove = (annotationElemId: string | string[]) => {
    const dom = [...this.state.internalHtml];
    let removed = false;
    for (const id of Utils.sanitizeArray(annotationElemId)) {
      const ann = AnnotationDomHelper.findAnnotation(
        dom,
        id,
        this.state.prefixMap
      );
      if (ann) {
        AnnotationDomHelper.removeAnnotation(ann, dom);
        this.removeOccurrence(id, ann);
        removed = true;
      }
    }
    if (removed) {
      this.setState({ stickyAnnotationId: "" });
      this.updateInternalHtml(dom);
    }
  };

  private removeOccurrence(annotationId: string, element: Element) {
    if (
      HtmlParserUtils.resolveIri(
        element.attribs.typeof,
        this.state.prefixMap
      ) === AnnotationType.OCCURRENCE
    ) {
      const iri = annotationIdToTermOccurrenceIri(
        annotationId,
        this.props.fileIri
      );
      this.props.removeTermOccurrence({ iri });
    }
  }

  public onAnnotationTermSelected = (
    annotationSpan: AnnotationSpanProps,
    term: Term | null
  ) => {
    // Make a shallow copy to force re-render if changes to an annotation are really made
    const dom = [...this.state.internalHtml];
    this.filterShowTermOccurence();
    const ann = AnnotationDomHelper.findAnnotation(
      dom,
      annotationSpan.about!,
      this.state.prefixMap
    );
    if (ann) {
      if (annotationSpan.resource) {
        ann.attribs.resource = annotationSpan.resource;
      } else {
        delete ann.attribs.resource;
      }
      let shouldUpdate = true;
      if (term !== null) {
        shouldUpdate = this.createOccurrence(annotationSpan, ann, term);
        this.approveOccurrence(annotationSpan);
      }
      delete ann.attribs.score;
      if (shouldUpdate) {
        this.updateInternalHtml(dom);
      }
    }
  };

  private approveOccurrence(annotationSpan: AnnotationSpanProps) {
    if (
      annotationSpan.typeof !== AnnotationType.OCCURRENCE ||
      !annotationSpan.score
    ) {
      return;
    }
    const iri = annotationIdToTermOccurrenceIri(
      annotationSpan.about!,
      this.props.fileIri
    );
    this.props.approveTermOccurrence({ iri });

    // reset filter for existing terms
    this.props.setAnnotatorLegendFilter(
      AnnotationClass.ASSIGNED_OCCURRENCE,
      AnnotationOrigin.SELECTED,
      true
    );
  }

  /**
   * Creates occurrence based on the specified annotation and term.
   * @param annotationNode Representation of the annotation
   * @param annotationElem The DOM element representing the annotation
   * @param term Term whose occurrence this should be
   * @private
   * @return Whether the HTML content of the annotator should be updated
   */
  private createOccurrence(
    annotationNode: AnnotationSpanProps,
    annotationElem: Element,
    term: Term
  ): boolean {
    if (annotationNode.typeof === AnnotationType.DEFINITION) {
      this.setState({
        selectedTerm: term,
        existingTermDefinitionAnnotationElement:
          AnnotationDomHelper.findAnnotation(
            this.state.internalHtml,
            annotationNode.about!,
            this.state.prefixMap
          ) as Element,
      });
      return false;
    } else {
      if (!annotationNode.score) {
        // Create occurrence only if we are not just approving an existing one
        const to = createTermOccurrence(
          term,
          annotationElem,
          this.props.fileIri
        );
        to.types = [VocabularyUtils.TERM_FILE_OCCURRENCE];
        this.props.saveTermOccurrence(to);
      }
      return true;
    }
  }

  public onSaveTermDefinition = (term: Term) => {
    this.filterShowDefinitionOccurence();
    return this.setTermDefinitionSource(
      term,
      this.state.existingTermDefinitionAnnotationElement!
    )
      .then(() => this.props.updateTerm(term))
      .finally(() => {
        this.setState({
          existingTermDefinitionAnnotationElement: undefined,
          selectedTerm: undefined,
        });
      });
  };

  private setTermDefinitionSource(term: Term, annotationElement: Element) {
    const dom = [...this.state.internalHtml];
    const defSource = createTermOccurrence(
      term,
      annotationElement,
      this.props.fileIri
    );
    defSource.types = [VocabularyUtils.TERM_DEFINITION_SOURCE];
    return this.updateInternalHtml(dom)
      .then(() => this.props.setTermDefinitionSource(defSource, term))
      .catch(() => {
        this.onRemove(annotationElement.attribs!.about!);
      });
  }

  public onCloseTermDefinitionDialog = () => {
    this.onRemove(
      this.state.existingTermDefinitionAnnotationElement?.attribs!.about!
    );
    this.setState({
      existingTermDefinitionAnnotationElement: undefined,
      selectedTerm: undefined,
    });
  };

  public onCreateTerm = (label: string, annotation: AnnotationSpanProps) => {
    this.setState({
      showNewTermDialog: true,
      newTermLabelAnnotation: Object.assign({}, annotation),
    });
    if (this.createNewTermDialog.current) {
      this.createNewTermDialog.current.setLabel(label);
    }
    this.filterShowTermOccurence();
  };

  public onCloseCreate = () => {
    const toRemove: string[] = [];
    if (this.shouldRemoveLabelAnnotation()) {
      toRemove.push(this.state.newTermLabelAnnotation!.about!);
    }
    if (this.state.newTermDefinitionAnnotation) {
      toRemove.push(this.state.newTermDefinitionAnnotation.about!);
    }
    this.onRemove(toRemove);
    this.setState({
      showNewTermDialog: false,
      newTermLabelAnnotation: undefined,
      newTermDefinitionAnnotation: undefined,
    });
  };

  private shouldRemoveLabelAnnotation() {
    const { newTermLabelAnnotation } = this.state;
    return (
      newTermLabelAnnotation &&
      !newTermLabelAnnotation.score &&
      !newTermLabelAnnotation.resource
    );
  }

  private onMinimizeTermCreation = () => {
    this.props.publishMessage(
      new Message(
        { messageId: "annotator.createTerm.selectDefinition.message" },
        MessageType.INFO
      )
    );
    this.setState({ showNewTermDialog: false });
  };

  public assignNewTerm = (newTerm: Term) => {
    const dom = [...this.state.internalHtml];
    this.filterShowTermOccurence();
    if (this.state.newTermLabelAnnotation) {
      const ann = AnnotationDomHelper.findAnnotation(
        dom,
        this.state.newTermLabelAnnotation.about!,
        this.state.prefixMap
      );
      if (ann) {
        ann.attribs.resource = newTerm.iri;
        delete ann.attribs.score;
      }
    }
    if (this.state.newTermDefinitionAnnotation) {
      const ann = AnnotationDomHelper.findAnnotation(
        dom,
        this.state.newTermDefinitionAnnotation.about!,
        this.state.prefixMap
      );
      if (ann) {
        ann.attribs.resource = newTerm.iri;
        this.setTermDefinitionSource(newTerm, ann);
      }
    }
    this.setState({
      newTermLabelAnnotation: undefined,
      newTermDefinitionAnnotation: undefined,
    });
    this.updateInternalHtml(dom);
  };

  private updateInternalHtml = (dom: DomHandlerNode[]) => {
    this.setState({ internalHtml: dom });
    const htmlSplit = HtmlDomUtils.splitHtml(this.props.initialHtml);
    const html =
      htmlSplit.prefix + HtmlParserUtils.dom2html(dom) + htmlSplit.suffix;
    return this.props.onUpdate(html);
  };

  private handleMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!hasAccess(AccessLevel.WRITE, this.props.vocabulary.accessLevel)) {
      // Insufficient access level
      return;
    }
    if (this.containerElement.current) {
      HtmlDomUtils.extendSelectionToWords(this.containerElement.current);

      const range = HtmlDomUtils.getSelectionRange();
      if (range && !HtmlDomUtils.isInPopup(range)) {
        if (this.state.newTermLabelAnnotation) {
          this.markTermDefinition();
        } else {
          this.setState({
            showSelectionPurposeDialog: true,
            selectionPurposeDialogAnchorPosition:
              HtmlDomUtils.resolvePopupPosition(e),
          });
        }
      } else {
        this.closeSelectionPurposeDialog();
      }
    }
  };

  public createTermFromSelection = () => {
    // No sticky when new term dialog will be open from the annotation
    const annotationResult = this.createTermOccurrence(true);
    if (annotationResult) {
      const textContent = HtmlDomUtils.getTextContent(annotationResult);
      this.onCreateTerm(textContent, {
        about: annotationResult.attribs.about,
        typeof: AnnotationType.OCCURRENCE,
        property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
      });
    }
    this.filterShowTermOccurence();
  };

  public createTermOccurrence = (preventSticky: boolean = false) => {
    // Ensure the argument is a boolean and not an object interpreted as not empty
    preventSticky = preventSticky === true;
    this.closeSelectionPurposeDialog();
    const about = JsonLdUtils.generateBlankNodeId();
    const annotationResult = this.annotateSelection(
      about,
      AnnotationType.OCCURRENCE
    );
    this.filterShowTermOccurence();
    if (annotationResult != null) {
      this.setState({
        internalHtml: HtmlParserUtils.html2dom(
          annotationResult.container.innerHTML
        ),
        stickyAnnotationId: preventSticky ? "" : about,
      });
      return annotationResult.annotation;
    }
    return null;
  };

  public markTermDefinition = () => {
    this.closeSelectionPurposeDialog();
    this.filterShowDefinitionOccurence();
    const annotation = this.annotateDefinition();
    if (annotation) {
      if (this.state.newTermLabelAnnotation) {
        const textContent = HtmlDomUtils.getTextContent(annotation);
        if (this.createNewTermDialog.current) {
          this.createNewTermDialog.current.setDefinition(textContent);
        }
        this.setState({
          showNewTermDialog: true,
          newTermDefinitionAnnotation: {
            about: annotation.attribs.about,
            typeof: AnnotationType.DEFINITION,
            property: VocabularyUtils.IS_DEFINITION_OF_TERM,
          },
          stickyAnnotationId: "", // No sticky definition annotation if new term dialog is open
        });
      }
    }
  };

  private filterShowDefinitionOccurence() {
    this.props.setAnnotatorLegendFilter(
      AnnotationClass.DEFINITION,
      AnnotationOrigin.SELECTED,
      true
    );
    this.props.setAnnotatorLegendFilter(
      AnnotationClass.PENDING_DEFINITION,
      AnnotationOrigin.SELECTED,
      true
    );
  }

  private filterShowTermOccurence() {
    this.props.setAnnotatorLegendFilter(
      AnnotationClass.SUGGESTED_OCCURRENCE,
      AnnotationOrigin.SELECTED,
      true
    );
    this.props.setAnnotatorLegendFilter(
      AnnotationClass.ASSIGNED_OCCURRENCE,
      AnnotationOrigin.SELECTED,
      true
    );
  }

  private annotateDefinition() {
    const about = JsonLdUtils.generateBlankNodeId();
    const annotationResult = this.annotateSelection(
      about,
      AnnotationType.DEFINITION
    );
    if (annotationResult != null) {
      this.setState({
        internalHtml: HtmlParserUtils.html2dom(
          annotationResult.container.innerHTML
        ),
        stickyAnnotationId: about,
      });
      return annotationResult.annotation;
    }
    return null;
  }

  public closeSelectionPurposeDialog = () => {
    this.setState({ showSelectionPurposeDialog: false });
  };

  public updateTermOccurrenceHighlight = (change: number) => {
    if (this.state.highlightedTerm === null) {
      return;
    }
    const occurrences = getTermOccurrences(this.state.highlightedTerm!.iri!);
    const newHighlightIndex = this.state.highlightedOccurrenceIndex + change;
    if (occurrences.length <= newHighlightIndex || newHighlightIndex < 0) {
      return;
    }
    if (
      occurrences.length > 0 &&
      this.state.highlightedOccurrenceIndex >= 0 &&
      this.state.highlightedOccurrenceIndex <= occurrences.length
    ) {
      HtmlDomUtils.removeClassFromElement(
        occurrences[this.state.highlightedOccurrenceIndex],
        "annotator-highlighted-annotation-current"
      );
    }
    const occurrence = occurrences[newHighlightIndex];
    HtmlDomUtils.addClassToElement(
      occurrence,
      "annotator-highlighted-annotation-current"
    );
    occurrence.scrollIntoView({ block: "center" });
    this.setState({ highlightedOccurrenceIndex: newHighlightIndex });
  };

  public render() {
    return (
      <>
        <WindowTitle title={this.props.i18n("annotator")} />
        <HeaderWithActions
          title={this.renderTitle()}
          className={classNames("annotator-header", {
            "annotator-header-scrolled": window.scrollY > 0,
          })}
          actions={[
            <HighlightTermOccurrencesButton
              key="highlight-occurrences-button"
              onChange={(t) =>
                this.setState(
                  {
                    highlightedTerm: t,
                    // Since the term changed, all existing highlights are removed, including additional assigned classes
                    highlightedOccurrenceIndex: -1,
                  },
                  () => this.updateTermOccurrenceHighlight(1)
                )
              }
              term={this.state.highlightedTerm}
              highlightIndex={this.state.highlightedOccurrenceIndex}
              onHighlightIndexChange={this.updateTermOccurrenceHighlight}
            />,
            <IfVocabularyActionAuthorized
              key="text-analysis-button"
              vocabulary={this.props.vocabulary}
              requiredAccessLevel={AccessLevel.WRITE}
            >
              <TextAnalysisInvocationButton
                key="text-analysis-invocation-button"
                className="annotator-action-button"
                fileIri={this.props.fileIri}
                defaultVocabularyIri={IRIImpl.toString(
                  this.props.vocabularyIri
                )}
              />
            </IfVocabularyActionAuthorized>,
            <AnnotatorDownloadActions
              fileIri={this.props.fileIri}
              key="annotator-download-actions"
            />,
            <LegendToggle key="legend-toggle" />,
          ]}
        />
        <Card>
          <CardBody>
            <CreateTermFromAnnotation
              ref={this.createNewTermDialog}
              show={this.state.showNewTermDialog}
              onClose={this.onCloseCreate}
              onMinimize={this.onMinimizeTermCreation}
              onTermCreated={this.assignNewTerm}
              vocabularyIri={this.props.vocabularyIri}
            />
            <SelectionPurposeDialog
              target={this.generateVirtualPopperAnchor()}
              show={this.state.showSelectionPurposeDialog}
              onCreateTerm={this.createTermFromSelection}
              onMarkOccurrence={this.createTermOccurrence}
              onMarkDefinition={this.markTermDefinition}
              onCancel={this.closeSelectionPurposeDialog}
            />
            <TermDefinitionEdit
              term={this.state.selectedTerm}
              annotationElement={
                this.state.existingTermDefinitionAnnotationElement
              }
              onCancel={this.onCloseTermDefinitionDialog}
              onSave={this.onSaveTermDefinition}
            />
            <div
              id="annotator"
              ref={this.containerElement}
              onMouseUp={this.handleMouseUp}
            >
              <AnnotatorContent
                content={this.state.internalHtml}
                prefixMap={this.state.prefixMap}
                stickyAnnotationId={this.state.stickyAnnotationId}
                accessLevel={
                  this.props.vocabulary.accessLevel || AccessLevel.NONE
                }
                onCreateTerm={this.onCreateTerm}
                onUpdate={this.onAnnotationTermSelected}
                onRemove={this.onRemove}
                onResetSticky={this.resetStickyAnnotationId}
                highlightedTerm={this.state.highlightedTerm}
                annotationLanguage={
                  this.props.annotationLanguage || this.props.file.language
                }
              />
            </div>
          </CardBody>
        </Card>
      </>
    );
  }

  private renderTitle() {
    return (
      <>
        {this.props.file.getLabel()}
        <div className="small italics">
          <VocabularyLink vocabulary={this.props.vocabulary} />
        </div>
      </>
    );
  }

  private generateVirtualPopperAnchor(): HTMLElement {
    // Based on https://popper.js.org/docs/v2/virtual-elements/
    return HtmlDomUtils.generateVirtualElement(
      this.state.selectionPurposeDialogAnchorPosition.x,
      this.state.selectionPurposeDialogAnchorPosition.y
    );
  }

  /**
   * Creates a new annotation around the current text selection and returns it.
   * @param about
   * @param annotationType Type of the annotation to create
   */
  private annotateSelection(
    about: string,
    annotationType: string
  ): { container: HTMLElement; annotation: Element } | null {
    const range = HtmlDomUtils.getSelectionRange()?.cloneRange();
    if (!range) {
      return null;
    }
    if (annotationType === AnnotationType.DEFINITION) {
      HtmlDomUtils.extendRangeToPreventNodeCrossing(range);
    }
    const rangeContent = HtmlDomUtils.getRangeContent(range);
    const newAnnotationNode = AnnotationDomHelper.createNewAnnotation(
      about,
      rangeContent,
      annotationType
    );
    return {
      container: HtmlDomUtils.replaceRange(
        this.containerElement.current!,
        range,
        HtmlParserUtils.dom2html([newAnnotationNode])
      ),
      annotation: newAnnotationNode,
    };
  }
}

export default connect(
  (state: TermItState) => ({
    user: state.user,
    file: state.selectedFile,
    vocabulary: state.vocabulary,
  }),
  (dispatch: ThunkDispatch) => {
    return {
      publishMessage: (message: Message) => dispatch(publishMessage(message)),
      setTermDefinitionSource: (src: TermOccurrence, term: Term) =>
        dispatch(setTermDefinitionSource(src, term)),
      updateTerm: (term: Term) => dispatch(updateTerm(term)),
      approveTermOccurrence: (occurrence: AssetData) =>
        dispatch(approveOccurrence(occurrence, true)),
      saveTermOccurrence: (occurrence: TermOccurrence) =>
        dispatch(saveOccurrence(occurrence)),
      removeTermOccurrence: (occurrence: AssetData) =>
        dispatch(removeOccurrence(occurrence, true)),
      setAnnotatorLegendFilter: (
        annotationClass: AnnotationClass,
        annotationOrigin: AnnotationOrigin,
        enabled: boolean
      ) =>
        dispatch(
          setAnnotatorLegendFilter(annotationClass, annotationOrigin, enabled)
        ),
    };
  }
)(injectIntl(withI18n(Annotator)));
