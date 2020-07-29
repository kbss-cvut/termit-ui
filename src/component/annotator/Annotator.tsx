import * as React from "react";
import {Element, Node as DomHandlerNode} from "domhandler";
import HtmlParserUtils from "./HtmlParserUtils";
import AnnotationDomHelper, {AnnotationType} from "./AnnotationDomHelper";
import Term from "../../model/Term";
import HtmlDomUtils from "./HtmlDomUtils";
import LegendToggle from "./LegendToggle";
import {DomUtils} from "htmlparser2";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import CreateTermFromAnnotation, {CreateTermFromAnnotation as CT} from "./CreateTermFromAnnotation";
import SelectionPurposeDialog from "./SelectionPurposeDialog";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import Message from "../../model/Message";
import {publishMessage} from "../../action/SyncActions";
import MessageType from "../../model/MessageType";
import TermOccurrence, {TextQuoteSelector} from "../../model/TermOccurrence";
import {setTermDefinitionSource} from "../../action/AsyncTermActions";
import JsonLdUtils from "../../util/JsonLdUtils";
import Utils from "../../util/Utils";
import TextAnalysisButtonAnnotatorWrapper from "./TextAnalysisButtonAnnotatorWrapper";
import AnnotatorContent from "./AnnotatorContent";

interface AnnotatorProps {
    fileIri: IRI;
    vocabularyIri: IRI;
    initialHtml: string;
    scrollTo?: TextQuoteSelector;   // Selector of an annotation to scroll to (and highlight) after rendering

    onUpdate(newHtml: string): void;

    publishMessage(message: Message): void;

    setTermDefinitionSource(src: TermOccurrence, term: Term): Promise<any>;
}

interface AnnotatorState {
    prefixMap: Map<string, string>;
    internalHtml: DomHandlerNode[];
    stickyAnnotationId: string;

    showSelectionPurposeDialog: boolean;
    selectionPurposeDialogAnchorPosition: { x: number, y: number };

    showNewTermDialog: boolean;
    newTermLabelAnnotation?: AnnotationSpanProps; // Annotation which is being used for new term label
    newTermDefinitionAnnotation?: AnnotationSpanProps; // Annotation which is being used for new term definition
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

interface HtmlSplit {
    prefix: string,
    body: string,
    suffix: string
}

export class Annotator extends React.Component<AnnotatorProps, AnnotatorState> {
    private containerElement = React.createRef<HTMLDivElement>();
    private createNewTermDialog = React.createRef<CT>();

    constructor(props: AnnotatorProps) {
        super(props);
        const htmlSplit = Annotator.matchHtml(props.initialHtml);
        const prefixMap = Annotator.getPrefixesOfHtmlTag(htmlSplit.prefix + htmlSplit.suffix);
        this.state = {
            prefixMap,
            internalHtml: HtmlParserUtils.html2dom(htmlSplit.body),
            stickyAnnotationId: "",
            showSelectionPurposeDialog: false,
            selectionPurposeDialogAnchorPosition: {x: 0, y: 0},
            showNewTermDialog: false
        };
    }

    private static getPrefixesOfHtmlTag(html: string): Map<string, string> {
        const dom = HtmlParserUtils.html2dom(html);
        const htmlNode = DomUtils.findOneChild(
            (n: DomHandlerNode) => (n as Element).tagName === "html" && (n as Element).attribs && !!(n as Element).attribs.prefix,
            dom);
        if (htmlNode) {
            return HtmlParserUtils.getPrefixMap(htmlNode);
        }
        return new Map();
    }

    public componentDidMount(): void {
        this.highlightAnnotation();
    }

    private highlightAnnotation(): void {
        const scrollTo = this.props.scrollTo;
        if (scrollTo) {
            try {
                const highlightedElem = HtmlDomUtils.findAnnotationElementBySelector(document, scrollTo);
                highlightedElem.scrollIntoView({block: "center"});
                HtmlDomUtils.addClassToElement(highlightedElem, "annotator-highlighted-annotation");
                setTimeout(() => HtmlDomUtils.removeClassFromElement(highlightedElem, "annotator-highlighted-annotation"),
                    ANNOTATION_HIGHLIGHT_TIMEOUT);
                if (highlightedElem.hasAttribute("about")) {
                    this.setState({stickyAnnotationId: highlightedElem.getAttribute("about")!});
                }
            } catch (e) {
                this.props.publishMessage(new Message({messageId: "annotator.findAnnotation.error"}, MessageType.ERROR));
            }
        }
    }

    public resetStickyAnnotationId = () => {
        this.setState({stickyAnnotationId: ""});
    };

    public onRemove = (annotationId: string | string[]) => {
        const dom = [...this.state.internalHtml];
        let removed = false;
        for (const id of Utils.sanitizeArray(annotationId)) {
            const ann = AnnotationDomHelper.findAnnotation(dom, id, this.state.prefixMap);
            if (ann) {
                AnnotationDomHelper.removeAnnotation(ann);
                removed = true;
            }
        }
        if (removed) {
            this.setState({stickyAnnotationId: ""});
            this.updateInternalHtml(dom);
        }
    };

    public onAnnotationTermSelected = (annotationSpan: AnnotationSpanProps, term: Term | null) => {
        // Make a shallow copy to force re-render if changes to an annotation are really made
        const dom = [...this.state.internalHtml];
        const ann = AnnotationDomHelper.findAnnotation(dom, annotationSpan.about!, this.state.prefixMap);
        if (ann) {
            if (annotationSpan.resource) {
                ann.attribs.resource = annotationSpan.resource!;
            }
            delete ann.attribs.score;
            if (term !== null) {
                this.createOccurrence(ann, term).then(() => {
                    this.updateInternalHtml(dom);
                });
            } else {
                this.updateInternalHtml(dom);
            }
        }
    };

    private createOccurrence(annotationNode: Element, term: Term): Promise<void> {
        const defSource = new TermOccurrence({
            term,
            target: {
                source: {iri: this.props.fileIri.namespace + this.props.fileIri.fragment},
                selectors: [AnnotationDomHelper.generateSelector(annotationNode)],
                types: [VocabularyUtils.FILE_OCCURRENCE_TARGET]
            },
            types: []
        });
        if (annotationNode.attribs.typeof === AnnotationType.DEFINITION) {
            return this.setTermDefinitionSource(defSource, term);
        } else {
            // TODO Creating occurrences is not implemented, yet
            return Promise.resolve();
        }
    }

    private setTermDefinitionSource(source: TermOccurrence, term: Term) {
        source.types = [VocabularyUtils.TERM_DEFINITION_SOURCE];
        return this.props.setTermDefinitionSource(source, term);
    }

    public onCreateTerm = (label: string, annotation: AnnotationSpanProps) => {
        this.setState({showNewTermDialog: true, newTermLabelAnnotation: Object.assign({}, annotation)});
        if (this.createNewTermDialog.current) {
            this.createNewTermDialog.current.setLabel(label);
        }
    };

    public onCloseCreate = () => {
        const toRemove: string[] = [];
        if (this.state.newTermLabelAnnotation) {
            toRemove.push(this.state.newTermLabelAnnotation.about!)
        }
        if (this.state.newTermDefinitionAnnotation) {
            toRemove.push(this.state.newTermDefinitionAnnotation.about!);
        }
        this.onRemove(toRemove);
        this.setState({
            showNewTermDialog: false,
            newTermLabelAnnotation: undefined,
            newTermDefinitionAnnotation: undefined
        });
    };

    private onMinimizeTermCreation = () => {
        this.props.publishMessage(new Message({messageId: "annotator.createTerm.selectDefinition.message"}, MessageType.INFO));
        this.setState({showNewTermDialog: false});
    };

    public assignNewTerm = (newTerm: Term) => {
        const dom = [...this.state.internalHtml];
        if (this.state.newTermLabelAnnotation) {
            const ann = AnnotationDomHelper.findAnnotation(dom, this.state.newTermLabelAnnotation.about!, this.state.prefixMap);
            if (ann) {
                ann.attribs.resource = newTerm.iri;
                delete ann.attribs.score;
            }
        }
        if (this.state.newTermDefinitionAnnotation) {
            const ann = AnnotationDomHelper.findAnnotation(dom, this.state.newTermDefinitionAnnotation.about!, this.state.prefixMap);
            if (ann) {
                ann.attribs.resource = newTerm.iri;
                this.createOccurrence(ann, newTerm);
            }
        }
        this.setState({newTermLabelAnnotation: undefined, newTermDefinitionAnnotation: undefined});
        this.updateInternalHtml(dom);
    };

    private updateInternalHtml = (dom: DomHandlerNode[]) => {
        this.setState({internalHtml: dom});
        this.props.onUpdate(this.reconstructHtml(HtmlParserUtils.dom2html(dom)));
    };

    private handleMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (this.containerElement.current) {
            HtmlDomUtils.extendSelectionToWords();
            const range = HtmlDomUtils.getSelectionRange();
            if (range && !HtmlDomUtils.isInPopup(range)) {
                if (this.state.newTermLabelAnnotation) {
                    this.markTermDefinition();
                } else {
                    this.setState({
                        showSelectionPurposeDialog: true,
                        selectionPurposeDialogAnchorPosition: Annotator.resolvePopupPosition(e)
                    });
                }
            } else {
                this.closeSelectionPurposeDialog();
            }
        }
    };

    private static resolvePopupPosition(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        const annotatorElem = document.getElementById("annotator")!;
        const fontSize = parseFloat(window.getComputedStyle(annotatorElem).getPropertyValue("font-size"));
        return {
            x: e.clientX,
            y: e.clientY - fontSize / 2
        };
    }

    public createTermFromSelection = () => {
        // No sticky when new term dialog will be open from the annotation
        const annotationResult = this.createTermOccurrence(true);
        if (annotationResult) {
            const textContent = HtmlDomUtils.getTextContent(annotationResult);
            this.onCreateTerm(textContent, {
                about: annotationResult.attribs.about,
                typeof: AnnotationType.OCCURRENCE,
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM
            });
        }
    };

    public createTermOccurrence = (preventSticky: boolean = false) => {
        // Ensure the argument is a boolean and not an object interpreted as not empty
        preventSticky = preventSticky === true;
        this.closeSelectionPurposeDialog();
        const about = JsonLdUtils.generateBlankNodeId();
        const annotationResult = this.annotateSelection(about, AnnotationType.OCCURRENCE);
        if (annotationResult != null) {
            this.setState({
                internalHtml: HtmlParserUtils.html2dom(annotationResult.container.innerHTML),
                stickyAnnotationId: preventSticky ? "" : about
            });
            return annotationResult.annotation;
        }
        return null;
    };

    public markTermDefinition = () => {
        this.closeSelectionPurposeDialog();
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
                        property: VocabularyUtils.IS_DEFINITION_OF_TERM
                    },
                    stickyAnnotationId: ""  // No sticky definition annotation if new term dialog is open
                });
            }
        }
    };

    private annotateDefinition() {
        const about = JsonLdUtils.generateBlankNodeId();
        const annotationResult = this.annotateSelection(about, AnnotationType.DEFINITION);
        if (annotationResult != null) {
            this.setState({
                internalHtml: HtmlParserUtils.html2dom(annotationResult.container.innerHTML),
                stickyAnnotationId: about
            });
            return annotationResult.annotation;
        }
        return null;
    }

    public closeSelectionPurposeDialog = () => {
        this.setState({showSelectionPurposeDialog: false});
    };

    public render() {
        return <div>
            <LegendToggle/>
            <TextAnalysisButtonAnnotatorWrapper fileIri={this.props.fileIri} vocabularyIri={this.props.vocabularyIri}/>
            <CreateTermFromAnnotation ref={this.createNewTermDialog}
                                      show={this.state.showNewTermDialog} onClose={this.onCloseCreate}
                                      onMinimize={this.onMinimizeTermCreation} onTermCreated={this.assignNewTerm}
                                      vocabularyIri={this.props.vocabularyIri}/>
            <SelectionPurposeDialog target={this.generateVirtualPopperAnchor()}
                                    show={this.state.showSelectionPurposeDialog}
                                    onCreateTerm={this.createTermFromSelection}
                                    onMarkOccurrence={this.createTermOccurrence}
                                    onMarkDefinition={this.markTermDefinition}
                                    onCancel={this.closeSelectionPurposeDialog}/>
            <div id="annotator"
                 ref={this.containerElement}
                 onMouseUp={this.handleMouseUp}>
                <AnnotatorContent content={this.state.internalHtml} prefixMap={this.state.prefixMap}
                                  stickyAnnotationId={this.state.stickyAnnotationId}
                                  onCreateTerm={this.onCreateTerm} onUpdate={this.onAnnotationTermSelected}
                                  onRemove={this.onRemove} onResetSticky={this.resetStickyAnnotationId}/>
            </div>
        </div>
    }

    private generateVirtualPopperAnchor(): HTMLElement {
        // Based on https://popper.js.org/docs/v2/virtual-elements/
        return HtmlDomUtils.generateVirtualElement(this.state.selectionPurposeDialogAnchorPosition.x, this.state.selectionPurposeDialogAnchorPosition.y);
    }

    private reconstructHtml(htmlBodyContent: string) {
        const htmlSplit = Annotator.matchHtml(this.props.initialHtml);
        return htmlSplit.prefix + htmlBodyContent + htmlSplit.suffix;
    }

    /**
     * Creates a new annotation around the current text selection and returns it.
     * @param about
     * @param annotationType Type of the annotation to create
     */
    private annotateSelection(about: string, annotationType: string): { container: HTMLElement, annotation: Element } | null {
        const originalRange = HtmlDomUtils.getSelectionRange();
        if (originalRange && !HtmlDomUtils.doesRangeSpanMultipleElements(originalRange)) {
            const rangeContent = HtmlDomUtils.getRangeContent(originalRange);
            const newAnnotationNode = AnnotationDomHelper.createNewAnnotation(about, rangeContent, annotationType);
            return {
                container: HtmlDomUtils.replaceRange(
                    this.containerElement.current!,
                    originalRange,
                    HtmlParserUtils.dom2html([newAnnotationNode])
                ),
                annotation: newAnnotationNode
            };
        }
        return null;
    }

    private static matchHtml(htmlContent: string): HtmlSplit {
        const htmlSplit = htmlContent.split(/(<body.*>|<\/body>)/ig);

        if (htmlSplit.length === 5) {
            return {
                prefix: htmlSplit[0] + htmlSplit[1],
                body: htmlSplit[2],
                suffix: htmlSplit[3] + htmlSplit[4]
            }
        }
        return {
            prefix: "",
            body: htmlContent,
            suffix: ""
        }

    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        publishMessage: (message: Message) => dispatch(publishMessage(message)),
        setTermDefinitionSource: (src: TermOccurrence, term: Term) => dispatch(setTermDefinitionSource(src, term))
    };
})(Annotator);
