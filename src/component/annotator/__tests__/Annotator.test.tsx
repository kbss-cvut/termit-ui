import {mockWindowSelection, mountWithIntl} from "../../../__tests__/environment/Environment";
import * as React from "react";
import {Annotator} from "../Annotator";
import {shallow} from "enzyme";
import Annotation from "..//Annotation";
import {createAnnotation, mountWithIntlAttached, surroundWithHtml} from "./AnnotationUtil";
import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import SelectionPurposeDialog from "../SelectionPurposeDialog";
import HtmlDomUtils from "../HtmlDomUtils";
import CreateTermFromAnnotation from "../CreateTermFromAnnotation";
import Message from "../../../model/Message";
import AnnotationDomHelper, {AnnotationType} from "../AnnotationDomHelper";
import TermOccurrence, {TextQuoteSelector} from "../../../model/TermOccurrence";
import AnnotatorContent from "../AnnotatorContent";

jest.mock("../HtmlDomUtils");

describe("Annotator", () => {

    const fileIri = VocabularyUtils.create(Generator.generateUri());
    const vocabularyIri = VocabularyUtils.create(Generator.generateUri());
    const sampleContent = "<div><span>sample content</span></div>";
    const generalHtmlContent = surroundWithHtml(sampleContent);
    const suggestedOccProps = {
        about: "_:-421713841",
        property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
        typeof: VocabularyUtils.TERM_OCCURRENCE
    };
    let mockedCallbackProps: {
        onUpdate(newHtml: string): void;
        publishMessage(msg: Message): void;
        setTermDefinitionSource(src: TermOccurrence, term: Term): Promise<any>;
    };
    beforeEach(() => {
        mockedCallbackProps = {
            onUpdate: jest.fn(),
            publishMessage: jest.fn(),
            setTermDefinitionSource: jest.fn().mockResolvedValue(null)
        }
    });

    it("renders body of provided html content", () => {
        const wrapper = mountWithIntl(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                 {...mockedCallbackProps}
                                                 initialHtml={generalHtmlContent}

        />);

        expect(wrapper.html().includes(sampleContent)).toBe(true);
    });

    it("renders body of provided html content with replaced anchor hrefs", () => {
        const htmlContent = surroundWithHtml("This is a <a href=\"https://example.org/link\">link</a>");

        const wrapper = mountWithIntl(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                 {...mockedCallbackProps}
                                                 initialHtml={htmlContent}

        />);
        const sampleOutput = "This is a <a data-href=\"https://example.org/link\">link</a>";
        expect(wrapper.html().includes(sampleOutput)).toBe(true);
    });

    it("renders annotation of suggested occurrence of a term", () => {
        const htmlWithOccurrence = surroundWithHtml(
            createAnnotation(
                suggestedOccProps,
                "města"
            )
        );
        const wrapper = mountWithIntlAttached(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                         {...mockedCallbackProps}
                                                         initialHtml={htmlWithOccurrence}

        />);

        const constructedAnnProps = wrapper.find(Annotation).props();
        const expectedAnnProps = {...suggestedOccProps};

        expect(constructedAnnProps)
            .toEqual(expect.objectContaining(expectedAnnProps))
    });

    describe("on mount", () => {

        const selector: TextQuoteSelector = {
            exactMatch: "test-term",
            types: [VocabularyUtils.TEXT_QUOTE_SELECTOR]
        };

        it("scrolls to and highlights annotation identified by specified selector", () => {
            const element = document.createElement("div");
            HtmlDomUtils.findAnnotationElementBySelector = jest.fn().mockReturnValue(element);
            HtmlDomUtils.addClassToElement = jest.fn();
            HtmlDomUtils.removeClassFromElement = jest.fn();
            element.scrollIntoView = jest.fn();
            shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                          {...mockedCallbackProps} initialHtml={generalHtmlContent}
                                          scrollTo={selector}/>);
            expect(HtmlDomUtils.findAnnotationElementBySelector).toHaveBeenCalledWith(document, selector);
            expect(HtmlDomUtils.addClassToElement).toHaveBeenCalledWith(element, "annotator-highlighted-annotation");
            expect(element.scrollIntoView).toHaveBeenCalled();
        });

        it("removes highlight from highlighted annotation after specified timeout", () => {
            const element = document.createElement("div");
            HtmlDomUtils.findAnnotationElementBySelector = jest.fn().mockReturnValue(element);
            HtmlDomUtils.addClassToElement = jest.fn();
            HtmlDomUtils.removeClassFromElement = jest.fn();
            element.scrollIntoView = jest.fn();
            jest.useFakeTimers();
            shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                          {...mockedCallbackProps} initialHtml={generalHtmlContent}
                                          scrollTo={selector}/>);
            jest.runAllTimers();
            expect(HtmlDomUtils.removeClassFromElement).toHaveBeenCalledWith(element, "annotator-highlighted-annotation");
        });

        it("shows error message when annotation for highlighting cannot be found", () => {
            HtmlDomUtils.findAnnotationElementBySelector = jest.fn().mockImplementation(() => {
                throw new Error("Unable to find annotation.")
            });
            jest.useFakeTimers();
            shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                          {...mockedCallbackProps} initialHtml={generalHtmlContent}
                                          scrollTo={selector}/>);
            jest.runAllTimers();

        });

        it("sets sticky annotation id to highlighted annotation", () => {
            const about = "_:117";
            const element = document.createElement("div");
            element.setAttribute("about", about);
            HtmlDomUtils.findAnnotationElementBySelector = jest.fn().mockReturnValue(element);
            HtmlDomUtils.addClassToElement = jest.fn();
            HtmlDomUtils.removeClassFromElement = jest.fn();
            element.scrollIntoView = jest.fn();
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps} initialHtml={generalHtmlContent}
                                                          scrollTo={selector}/>);
            wrapper.update();
            expect(wrapper.state().stickyAnnotationId).toEqual(about);
        });
    });

    // todo rewrite it with xpath-range functions
    xit("renders annotation over selected text on mouseup event", () => {
        const div = document.createElement("div");
        document.body.appendChild(div);
        const wrapper = mountWithIntl(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                 {...mockedCallbackProps}
                                                 initialHtml={generalHtmlContent}
        />, {attachTo: div});
        const newSpan = div.querySelector("span");
        const annTarget = {element: newSpan, text: "some text"};
        // @ts-ignore
        wrapper.find(Annotator).instance().surroundSelection = () => annTarget;

        expect(wrapper.html().includes("suggested-term")).toBeFalsy();

        wrapper.simulate("mouseUp");

        expect(wrapper.html().includes("suggested-term")).toBeTruthy()
    });

    describe("onCreateTerm", () => {

        it("stores annotation from which the new term is being created for later reference", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const annotation = {
                about: "_:13",
                content: "infrastruktura",
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                typeof: VocabularyUtils.TERM_OCCURRENCE
            };
            wrapper.instance().onCreateTerm("label", annotation);
            expect(wrapper.state().newTermLabelAnnotation).toEqual(annotation);
        });

        // Bug #1245
        it("removes created label annotation when new term creation is cancelled", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const annotation = {
                about: "_:13",
                content: "infrastruktura",
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                typeof: VocabularyUtils.TERM_OCCURRENCE
            };
            wrapper.instance().setState({newTermLabelAnnotation: annotation});
            AnnotationDomHelper.findAnnotation = jest.fn().mockReturnValue(annotation);
            AnnotationDomHelper.removeAnnotation = jest.fn();

            wrapper.instance().onCloseCreate();
            expect(wrapper.state().newTermLabelAnnotation).not.toBeDefined();
            expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledWith(annotation, expect.anything());
        });

        // Bug #1443
        it("does not remove suggested label occurrence when new term creation is cancelled", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const annotation = {
                about: "_:13",
                content: "infrastruktura",
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                typeof: VocabularyUtils.TERM_OCCURRENCE,
                score: "1.0"
            };
            wrapper.instance().setState({newTermLabelAnnotation: annotation});
            AnnotationDomHelper.findAnnotation = jest.fn().mockReturnValue(annotation);
            AnnotationDomHelper.removeAnnotation = jest.fn();

            wrapper.instance().onCloseCreate();
            // Workaround for not.toHaveBeenCalled throwing an error
            expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledTimes(0);
        });

        it("does not confirmed term label occurrence when new term creation is cancelled", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const annotation = {
                about: "_:13",
                content: "infrastruktura",
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                typeof: VocabularyUtils.TERM_OCCURRENCE,
                resource: Generator.generateUri()
            };
            wrapper.instance().setState({newTermLabelAnnotation: annotation});
            AnnotationDomHelper.findAnnotation = jest.fn().mockReturnValue(annotation);
            AnnotationDomHelper.removeAnnotation = jest.fn();

            wrapper.instance().onCloseCreate();
            // Workaround for not.toHaveBeenCalled throwing an error
            expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledTimes(0);
        });

        // Bug #1245
        it("removes created definition annotation when new term creation is cancelled", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const labelAnnotation = {
                about: "_:13",
                content: "infrastruktura",
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                typeof: VocabularyUtils.TERM_OCCURRENCE
            };
            const definitionAnnotation = {
                about: "_:14",
                content: "term definition text",
                property: VocabularyUtils.IS_DEFINITION_OF_TERM,
                typeof: VocabularyUtils.TERM_DEFINITION_SOURCE
            }
            wrapper.instance().setState({
                newTermLabelAnnotation: labelAnnotation,
                newTermDefinitionAnnotation: definitionAnnotation
            });
            AnnotationDomHelper.findAnnotation = jest.fn().mockImplementation((dom: any, annotationId: string) => {
                return annotationId === labelAnnotation.about ? labelAnnotation : definitionAnnotation;
            });
            AnnotationDomHelper.removeAnnotation = jest.fn();

            wrapper.instance().onCloseCreate();
            expect(wrapper.state().newTermDefinitionAnnotation).not.toBeDefined();
            expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledWith(definitionAnnotation, expect.anything());
        });

        it("makes a shallow copy of parsed content to force its re-render when new term is created", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const annotation = {
                about: "_:13",
                content: "infrastruktura",
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                typeof: VocabularyUtils.TERM_OCCURRENCE
            };
            const annotationNode = {
                attribs: {
                    about: annotation.about,
                    typeof: annotation.typeof
                }
            };
            wrapper.instance().setState({newTermLabelAnnotation: annotation});
            const originalContent = wrapper.find(AnnotatorContent).prop("content");
            AnnotationDomHelper.findAnnotation = jest.fn().mockReturnValue(annotationNode);
            const newTerm = Generator.generateTerm(vocabularyIri.toString());

            wrapper.instance().assignNewTerm(newTerm);
            wrapper.update();

            return Promise.resolve().then(() => {
                const newContent = wrapper.find(AnnotatorContent).prop("content");
                expect(newContent).not.toBe(originalContent);
            });
        });
    });

    describe("onMouseUp", () => {

        let range: any;

        beforeEach(() => {
            const container = {
                nodeType: Node.TEXT_NODE
            };
            range = {
                startOffset: 1,
                endOffset: 10,
                startContainer: container,
                endContainer: container,
                commonAncestorContainer: container
            };
            HtmlDomUtils.getSelectionRange = jest.fn().mockReturnValue(range);
        });

        it("displays selection purpose dialog at an anchor at the beginning of the selection", () => {
            mockWindowSelection({isCollapsed: false, rangeCount: 1, getRangeAt: () => range});
            window.getComputedStyle = jest.fn().mockReturnValue({
                getPropertyValue: () => "16px"
            });
            const wrapper = mountWithIntl(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                     {...mockedCallbackProps}
                                                     initialHtml={generalHtmlContent}
            />);
            wrapper.find("#annotator").simulate("mouseUp");
            wrapper.update();
            expect(wrapper.find(SelectionPurposeDialog).props().show).toBeTruthy();
        });

        it("closes selection purpose dialog when no selection is made", () => {
            window.getComputedStyle = jest.fn().mockReturnValue({
                getPropertyValue: () => "16px"
            });
            const wrapper = mountWithIntl(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                     {...mockedCallbackProps}
                                                     initialHtml={generalHtmlContent}
            />);
            wrapper.find("#annotator").simulate("mouseUp");
            expect(wrapper.find(SelectionPurposeDialog).props().show).toBeTruthy();
            HtmlDomUtils.getSelectionRange = jest.fn().mockReturnValue(null);
            wrapper.find("#annotator").simulate("mouseUp");
            expect(wrapper.find(SelectionPurposeDialog).props().show).toBeFalsy();
        });
    });

    describe("createTermFromSelection", () => {
        let range: any;

        beforeEach(() => {
            const container = {
                nodeType: Node.TEXT_NODE
            };
            range = {
                startOffset: 1,
                endOffset: 10,
                startContainer: container,
                endContainer: container,
                commonAncestorContainer: container
            };
        });

        // Bug #1230
        it("does not mark term occurrence sticky when it is being used to create new term", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            HtmlDomUtils.getSelectionRange = jest.fn().mockReturnValue(range);
            const text = "12345 54321";
            HtmlDomUtils.getRangeContent = jest.fn().mockReturnValue({
                length: 1,
                item: () => ({nodeType: Node.TEXT_NODE, textContent: text})
            });
            HtmlDomUtils.replaceRange = jest.fn().mockReturnValue(generalHtmlContent);
            wrapper.instance().createTermFromSelection();
            wrapper.update();
            expect(wrapper.instance().state.stickyAnnotationId).toEqual("");
        });
    });

    describe("markTermDefinition", () => {

        let range: any;

        beforeEach(() => {
            const container = {
                nodeType: Node.TEXT_NODE
            };
            range = {
                startOffset: 1,
                endOffset: 10,
                startContainer: container,
                endContainer: container,
                commonAncestorContainer: container
            };
        });

        it("sets content from the created annotation as definition of the term being currently created", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const annotation = {
                about: "_:13",
                content: "infrastruktura",
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                typeof: VocabularyUtils.TERM_OCCURRENCE
            };
            wrapper.setState({newTermLabelAnnotation: annotation});
            HtmlDomUtils.getSelectionRange = jest.fn().mockReturnValue(range);
            const text = "12345 54321";
            HtmlDomUtils.getRangeContent = jest.fn().mockReturnValue({
                length: 1,
                item: () => ({nodeType: Node.TEXT_NODE, textContent: text})
            });
            HtmlDomUtils.replaceRange = jest.fn().mockReturnValue(generalHtmlContent);
            wrapper.instance().markTermDefinition();
            wrapper.update();
            expect(wrapper.find(CreateTermFromAnnotation).prop("show")).toBeTruthy();
        });

        // Bug #1230
        it("does not mark term definition sticky when it is being used as new term's definition", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const annotation = {
                about: "_:13",
                content: "infrastruktura",
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                typeof: VocabularyUtils.TERM_OCCURRENCE
            };
            wrapper.setState({newTermLabelAnnotation: annotation});
            HtmlDomUtils.getSelectionRange = jest.fn().mockReturnValue(range);
            const text = "12345 54321";
            HtmlDomUtils.getRangeContent = jest.fn().mockReturnValue({
                length: 1,
                item: () => ({nodeType: Node.TEXT_NODE, textContent: text})
            });
            HtmlDomUtils.replaceRange = jest.fn().mockReturnValue(generalHtmlContent);
            wrapper.instance().markTermDefinition();
            wrapper.update();
            expect(wrapper.instance().state.stickyAnnotationId).toEqual("");
        });
    });

    describe("assignNewTerm", () => {

        const labelAnnotation = {
            about: "_:13",
            content: "infrastruktura",
            property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
            typeof: VocabularyUtils.TERM_OCCURRENCE
        };
        const definitionAnnotation = {
            about: "_:14",
            property: VocabularyUtils.IS_DEFINITION_OF_TERM,
            typeof: VocabularyUtils.DEFINITION
        };
        const labelNode = {
            attribs: {
                about: labelAnnotation.about,
                resource: undefined,
                typeof: AnnotationType.OCCURRENCE
            }
        };
        const defNode = {
            attribs: {
                about: definitionAnnotation.about,
                resource: undefined,
                typeof: AnnotationType.DEFINITION
            }
        };

        beforeEach(() => {
            AnnotationDomHelper.findAnnotation = jest.fn().mockImplementation((dom, about) => about === labelAnnotation.about ? labelNode : defNode);
        });

        it("assigns new term to the annotation used to define new term label", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            wrapper.setState({newTermLabelAnnotation: labelAnnotation});
            const term = Generator.generateTerm();

            wrapper.instance().assignNewTerm(term);
            expect(labelNode.attribs.resource).toEqual(term.iri);
        });

        it("assigns new term to the annotation used to define new term definition", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            wrapper.setState({
                newTermLabelAnnotation: labelAnnotation,
                newTermDefinitionAnnotation: definitionAnnotation
            });

            const term = Generator.generateTerm();
            wrapper.instance().assignNewTerm(term);
            expect(labelNode.attribs.resource).toEqual(term.iri);
            expect(defNode.attribs.resource).toEqual(term.iri);
        });

        it("sets definition source of the new term", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            wrapper.setState({
                newTermLabelAnnotation: labelAnnotation,
                newTermDefinitionAnnotation: definitionAnnotation
            });
            const term = Generator.generateTerm();
            wrapper.instance().assignNewTerm(term);
            expect(mockedCallbackProps.setTermDefinitionSource).toHaveBeenCalled();
            const src = (mockedCallbackProps.setTermDefinitionSource as jest.Mock).mock.calls[0][0];
            expect(src.term).toEqual(term);
            expect(src.target.source.iri).toEqual(fileIri.toString());
        });
    });

    describe("onAnnotationTermSelected", () => {
        it("creates term definition source when annotation is definition", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const definitionAnnotation = {
                about: "_:14",
                property: VocabularyUtils.IS_DEFINITION_OF_TERM,
                typeof: VocabularyUtils.DEFINITION
            };
            const term = Generator.generateTerm();
            const defNode = {
                attribs: {
                    about: definitionAnnotation.about,
                    resource: undefined,
                    typeof: definitionAnnotation.typeof
                }
            };
            AnnotationDomHelper.findAnnotation = jest.fn().mockReturnValue(defNode);
            wrapper.instance().onAnnotationTermSelected(definitionAnnotation, term);

            expect(mockedCallbackProps.setTermDefinitionSource).toHaveBeenCalled();
            const src = (mockedCallbackProps.setTermDefinitionSource as jest.Mock).mock.calls[0][0];
            expect(src).toBeInstanceOf(TermOccurrence);
            expect(src.term).toEqual(term);
            expect(src.target.source.iri).toEqual(fileIri.toString());
            expect(src.types.indexOf(VocabularyUtils.TERM_DEFINITION_SOURCE)).not.toEqual(-1);
            expect(src.types.indexOf(VocabularyUtils.TERM_OCCURRENCE)).toEqual(-1);
        });

        it("makes a shallow copy of parsed content to force its re-render", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const originalContent = wrapper.find(AnnotatorContent).prop("content");
            const annotation = {
                about: "_:14",
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                typeof: VocabularyUtils.TERM_OCCURRENCE
            };
            const term = Generator.generateTerm();
            const annotationNode = {
                attribs: {
                    about: annotation.about,
                    resource: term.iri,
                    typeof: annotation.typeof
                }
            };
            AnnotationDomHelper.findAnnotation = jest.fn().mockReturnValue(annotationNode);
            wrapper.instance().onAnnotationTermSelected(annotation, term);
            wrapper.update();

            return Promise.resolve().then(() => {
                const newContent = wrapper.find(AnnotatorContent).prop("content");
                expect(newContent).not.toBe(originalContent);
            });
        });

        it("removes previously created annotation when term definition assignment fails", async () => {
            mockedCallbackProps.setTermDefinitionSource = jest.fn().mockRejectedValue({});
            const definitionAnnotation = {
                about: "_:14",
                property: VocabularyUtils.IS_DEFINITION_OF_TERM,
                typeof: VocabularyUtils.DEFINITION
            };
            const term = Generator.generateTerm();
            const defNode = {
                attribs: {
                    about: definitionAnnotation.about,
                    resource: undefined,
                    typeof: definitionAnnotation.typeof
                }
            };
            AnnotationDomHelper.findAnnotation = jest.fn().mockReturnValue(defNode);
            AnnotationDomHelper.removeAnnotation = jest.fn();
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            await wrapper.instance().onAnnotationTermSelected(definitionAnnotation, term);
            wrapper.update();

            return Promise.resolve().then(() => {
                expect(mockedCallbackProps.setTermDefinitionSource).toHaveBeenCalled();
                expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalled();
            });
        });
    });

    describe("onRemove", () => {
        it("makes a shallow copy of parsed content to force its re-render", () => {
            const wrapper = shallow<Annotator>(<Annotator fileIri={fileIri} vocabularyIri={vocabularyIri}
                                                          {...mockedCallbackProps}
                                                          initialHtml={generalHtmlContent}
            />);
            const originalContent = wrapper.find(AnnotatorContent).prop("content");
            const annotation = {
                about: "_:14",
                property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
                typeof: VocabularyUtils.TERM_OCCURRENCE
            };
            const annotationNode = {
                attribs: {
                    about: annotation.about,
                    resource: Generator.generateUri(),
                    typeof: annotation.typeof
                }
            };
            AnnotationDomHelper.findAnnotation = jest.fn().mockReturnValue(annotationNode);
            wrapper.instance().onRemove(annotation.about);
            wrapper.update();

            return Promise.resolve().then(() => {
                const newContent = wrapper.find(AnnotatorContent).prop("content");
                expect(newContent).not.toBe(originalContent);
            });
        });
    });
});
