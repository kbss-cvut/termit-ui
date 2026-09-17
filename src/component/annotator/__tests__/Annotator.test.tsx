import * as React from "react";
import { act, fireEvent, waitFor } from "@testing-library/react";
import {
  mockWindowSelection,
  renderWithIntl,
  withWebSocket,
} from "../../../__tests__/environment/Environment";
import { Element } from "domhandler";
import { AnnotationSpanProps, Annotator } from "../Annotator";
import { createAnnotation, surroundWithHtml } from "./AnnotationUtil";
import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import HtmlDomUtils from "../HtmlDomUtils";
import Message from "../../../model/Message";
import AnnotationDomHelper, { AnnotationType } from "../AnnotationDomHelper";
import TermOccurrence, {
  TextQuoteSelector,
} from "../../../model/TermOccurrence";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import User from "../../../model/User";
import File from "../../../model/File";
import Vocabulary from "../../../model/Vocabulary";
import AccessLevel from "../../../model/acl/AccessLevel";
import { MemoryRouter } from "react-router";
import { AssetData } from "../../../model/Asset";
import {
  AnnotationClass,
  AnnotationOrigin,
} from "../../../model/AnnotatorLegendFilter";
import { AnnotatorLegendFilterAction } from "../../../action/ActionType";
import type { Mock } from "vitest";

vi.mock("../../misc/AssetIriLink", () => ({
  default: () => <span>AssetIriLink</span>,
}));
vi.mock("../HighlightTermOccurrencesButton", () => ({
  default: () => <button>Highlight terms</button>,
}));

// The real CreateTermFromAnnotation renders a full term creation form (incl. react-bootstrap-toggle and
// a CodeMirror-based MarkdownEditor) which cannot work in jsdom. The mock exposes the imperative
// setLabel/setDefinition API used by Annotator and renders the dialog marker element when shown.
vi.mock("../CreateTermFromAnnotation", () => {
  class MockCreateTermFromAnnotation extends React.Component<{
    show: boolean;
  }> {
    public setLabel() {
      /* Intentionally empty */
    }
    public setDefinition() {
      /* Intentionally empty */
    }
    public render() {
      return this.props.show ? <div id="annotator-create-term" /> : null;
    }
  }
  return {
    default: MockCreateTermFromAnnotation,
    CreateTermFromAnnotation: MockCreateTermFromAnnotation,
  };
});

// AnnotatorContent is not mocked away (its real rendering is exercised by several of the tests below), but its
// props are captured on every render so that tests which used to inspect Enzyme shallow-rendered props (e.g.
// content reference identity, annotationLanguage pass-through) can still assert on them.
let lastAnnotatorContentProps: any = null;
vi.mock("../AnnotatorContent", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    default: (props: any) => {
      lastAnnotatorContentProps = props;
      return <actual.default {...props} />;
    },
  };
});

describe("Annotator", () => {
  const fileIri = VocabularyUtils.create(Generator.generateUri());
  const vocabularyIri = VocabularyUtils.create(Generator.generateUri());
  const sampleContent = "<div><span>sample content</span></div>";
  const generalHtmlContent = surroundWithHtml(sampleContent);
  const suggestedOccProps = {
    about: "_:-421713841",
    property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
    typeof: VocabularyUtils.TERM_OCCURRENCE,
  };
  let mockedCallbackProps: {
    onUpdate(newHtml: string): Promise<void>;
    publishMessage(msg: Message): void;
    setTermDefinitionSource(src: TermOccurrence, term: Term): Promise<any>;
    updateTerm(term: Term): Promise<any>;
    approveTermOccurrence: (occurrence: AssetData) => Promise<any>;
    removeTermOccurrence: (occurrence: AssetData) => Promise<any>;
    saveTermOccurrence: (occurrence: TermOccurrence) => Promise<any>;
    setAnnotatorLegendFilter: (
      annotationClass: AnnotationClass,
      annotationOrigin: AnnotationOrigin,
      enabled: boolean
    ) => AnnotatorLegendFilterAction;
  };
  let user: User;
  let file: File;
  let vocabulary: Vocabulary;
  let stateProps: {
    user: User;
    file: File;
    vocabulary: Vocabulary;
  };
  const originalGenerateVirtualElement = HtmlDomUtils.generateVirtualElement;

  beforeEach(() => {
    mockedCallbackProps = {
      onUpdate: vi.fn().mockResolvedValue(undefined),
      publishMessage: vi.fn(),
      setTermDefinitionSource: vi.fn().mockResolvedValue(null),
      updateTerm: vi.fn().mockResolvedValue({}),
      approveTermOccurrence: vi.fn().mockResolvedValue({}),
      removeTermOccurrence: vi.fn().mockResolvedValue({}),
      saveTermOccurrence: vi.fn().mockResolvedValue({}),
      setAnnotatorLegendFilter: vi.fn().mockResolvedValue({}),
    };
    user = Generator.generateUser();
    file = new File({
      iri: Generator.generateUri(),
      label: "test.html",
      types: [VocabularyUtils.FILE],
    });
    vocabulary = Generator.generateVocabulary({
      iri: vocabularyIri.toString(),
      accessLevel: AccessLevel.WRITE,
    });
    stateProps = { user, file, vocabulary };
    lastAnnotatorContentProps = null;
  });

  function renderAnnotator(props: any = {}, ref?: React.RefObject<Annotator>) {
    return renderWithIntl(
      withWebSocket(
        <MemoryRouter>
          <Annotator
            ref={ref}
            fileIri={fileIri}
            vocabularyIri={vocabularyIri}
            {...mockedCallbackProps}
            {...stateProps}
            initialHtml={generalHtmlContent}
            {...intlFunctions()}
            {...props}
          />
        </MemoryRouter>
      )
    );
  }

  it("renders body of provided html content", () => {
    const { container } = renderAnnotator();

    expect(container.innerHTML.includes(sampleContent)).toBe(true);
  });

  it("preserves absolute URL href anchors", () => {
    const htmlContent = surroundWithHtml(
      'This is a <a href="https://example.org/link">link</a>'
    );

    const { container } = renderAnnotator({ initialHtml: htmlContent });
    const sampleOutput =
      'This is a <a href="https://example.org/link" target="_blank" rel="noopener noreferrer">link</a>';
    expect(container.innerHTML.includes(sampleOutput)).toBe(true);
  });

  it("renders body of provided html content with replaced relative anchor hrefs", () => {
    const htmlContent = surroundWithHtml('This is a <a href="./link">link</a>');

    const { container } = renderAnnotator({ initialHtml: htmlContent });
    const sampleOutput = 'This is a <a data-href="./link">link</a>';
    expect(container.innerHTML.includes(sampleOutput)).toBe(true);
  });

  it("renders annotation of suggested occurrence of a term", () => {
    const htmlWithOccurrence = surroundWithHtml(
      createAnnotation(suggestedOccProps, "města")
    );
    renderAnnotator({ initialHtml: htmlWithOccurrence });

    const annotationElement = document.querySelector(
      `[about="${suggestedOccProps.about}"]`
    );
    expect(annotationElement).toBeTruthy();
    expect(annotationElement!.getAttribute("property")).toEqual(
      suggestedOccProps.property
    );
    expect(annotationElement!.getAttribute("typeof")).toEqual(
      suggestedOccProps.typeof
    );
  });

  it("passes file language to content rendering", () => {
    file.language = "en";
    renderAnnotator();
    expect(lastAnnotatorContentProps.annotationLanguage).toEqual(file.language);
  });

  it("passes provided annotation language to content rendering", () => {
    file.language = "en";
    renderAnnotator({ annotationLanguage: "cs" });
    expect(lastAnnotatorContentProps.annotationLanguage).toEqual("cs");
  });

  describe("on mount", () => {
    const selector: TextQuoteSelector = {
      exactMatch: "test-term",
      types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
    };

    it("scrolls to and highlights annotation identified by specified selector", () => {
      const element = document.createElement("div");
      HtmlDomUtils.findAnnotationElementBySelector = vi
        .fn()
        .mockReturnValue(element);
      HtmlDomUtils.addClassToElement = vi.fn();
      HtmlDomUtils.removeClassFromElement = vi.fn();
      element.scrollIntoView = vi.fn();
      renderAnnotator({ scrollTo: selector });
      expect(HtmlDomUtils.findAnnotationElementBySelector).toHaveBeenCalledWith(
        document,
        selector
      );
      expect(HtmlDomUtils.addClassToElement).toHaveBeenCalledWith(
        element,
        "annotator-highlighted-annotation"
      );
      expect(element.scrollIntoView).toHaveBeenCalled();
    });

    it("removes highlight from highlighted annotation after specified timeout", () => {
      const element = document.createElement("div");
      HtmlDomUtils.findAnnotationElementBySelector = vi
        .fn()
        .mockReturnValue(element);
      HtmlDomUtils.addClassToElement = vi.fn();
      HtmlDomUtils.removeClassFromElement = vi.fn();
      element.scrollIntoView = vi.fn();
      vi.useFakeTimers();
      renderAnnotator({ scrollTo: selector });
      act(() => {
        vi.runAllTimers();
      });
      expect(HtmlDomUtils.removeClassFromElement).toHaveBeenCalledWith(
        element,
        "annotator-highlighted-annotation"
      );
      vi.useRealTimers();
    });

    it("shows error message when annotation for highlighting cannot be found", () => {
      HtmlDomUtils.findAnnotationElementBySelector = vi
        .fn()
        .mockImplementation(() => {
          throw new Error("Unable to find annotation.");
        });
      vi.useFakeTimers();
      renderAnnotator({ scrollTo: selector });
      act(() => {
        vi.runAllTimers();
      });
      vi.useRealTimers();
    });

    it("sets sticky annotation id to highlighted annotation", () => {
      const about = "_:117";
      const element = document.createElement("div");
      element.setAttribute("about", about);
      HtmlDomUtils.findAnnotationElementBySelector = vi
        .fn()
        .mockReturnValue(element);
      HtmlDomUtils.addClassToElement = vi.fn();
      HtmlDomUtils.removeClassFromElement = vi.fn();
      element.scrollIntoView = vi.fn();
      const ref = React.createRef<Annotator>();
      renderAnnotator({ scrollTo: selector }, ref);
      expect(ref.current!.state.stickyAnnotationId).toEqual(about);
    });
  });

  // todo rewrite it with xpath-range functions
  it.skip("renders annotation over selected text on mouseup event", () => {
    const ref = React.createRef<Annotator>();
    const { container } = renderAnnotator({}, ref);
    const newSpan = container.querySelector("span");
    const annTarget = { element: newSpan, text: "some text" };
    // @ts-ignore
    ref.current!.surroundSelection = () => annTarget;

    expect(container.innerHTML.includes("suggested-term")).toBeFalsy();

    fireEvent.mouseUp(document.getElementById("annotator")!);

    expect(container.innerHTML.includes("suggested-term")).toBeTruthy();
  });

  describe("onCreateTerm", () => {
    let annotation: AnnotationSpanProps;

    beforeEach(() => {
      annotation = {
        about: "_:13",
        content: "infrastruktura",
        property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
        typeof: VocabularyUtils.TERM_OCCURRENCE,
      };
      HtmlDomUtils.generateVirtualElement = vi.fn();
    });

    it("stores annotation from which the new term is being created for later reference", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      act(() => {
        ref.current!.onCreateTerm("label", annotation);
      });
      expect(ref.current!.state.newTermLabelAnnotation).toEqual(annotation);
    });

    // Bug #1245
    it("removes created label annotation when new term creation is cancelled", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      act(() => {
        ref.current!.setState({ newTermLabelAnnotation: annotation });
      });
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockReturnValue({ attribs: { ...annotation } });
      AnnotationDomHelper.removeAnnotation = vi.fn();

      act(() => {
        ref.current!.onCloseCreate();
      });
      expect(ref.current!.state.newTermLabelAnnotation).not.toBeDefined();
      expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledWith(
        { attribs: { ...annotation } },
        expect.anything()
      );
    });

    // Bug #1443
    it("does not remove suggested label occurrence when new term creation is cancelled", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      annotation.score = "1.0";
      act(() => {
        ref.current!.setState({ newTermLabelAnnotation: annotation });
      });
      AnnotationDomHelper.findAnnotation = vi.fn().mockReturnValue(annotation);
      AnnotationDomHelper.removeAnnotation = vi.fn();

      act(() => {
        ref.current!.onCloseCreate();
      });
      // Workaround for not.toHaveBeenCalled throwing an error
      expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledTimes(0);
    });

    it("does not confirmed term label occurrence when new term creation is cancelled", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      annotation.resource = Generator.generateUri();
      act(() => {
        ref.current!.setState({ newTermLabelAnnotation: annotation });
      });
      AnnotationDomHelper.findAnnotation = vi.fn().mockReturnValue(annotation);
      AnnotationDomHelper.removeAnnotation = vi.fn();

      act(() => {
        ref.current!.onCloseCreate();
      });
      // Workaround for not.toHaveBeenCalled throwing an error
      expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledTimes(0);
    });

    // Bug #1245
    it("removes created definition annotation when new term creation is cancelled", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const labelAnnotation = annotation;
      const definitionAnnotation = {
        about: "_:14",
        content: "term definition text",
        property: VocabularyUtils.IS_DEFINITION_OF_TERM,
        typeof: VocabularyUtils.TERM_DEFINITION_SOURCE,
      };
      act(() => {
        ref.current!.setState({
          newTermLabelAnnotation: labelAnnotation,
          newTermDefinitionAnnotation: definitionAnnotation,
        });
      });
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockImplementation((dom: any, annotationId: string) => {
          return annotationId === labelAnnotation.about
            ? { attribs: { ...labelAnnotation } }
            : { attribs: { ...definitionAnnotation } };
        });
      AnnotationDomHelper.removeAnnotation = vi.fn();

      act(() => {
        ref.current!.onCloseCreate();
      });
      expect(ref.current!.state.newTermDefinitionAnnotation).not.toBeDefined();
      expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledWith(
        { attribs: { ...definitionAnnotation } },
        expect.anything()
      );
    });

    it("makes a shallow copy of parsed content to force its re-render when new term is created", async () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const annotationNode = {
        attribs: {
          about: annotation.about,
          typeof: annotation.typeof,
        },
      };
      act(() => {
        ref.current!.setState({ newTermLabelAnnotation: annotation });
      });
      const originalContent = lastAnnotatorContentProps.content;
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockReturnValue(annotationNode);
      const newTerm = Generator.generateTerm(vocabularyIri.toString());

      act(() => {
        ref.current!.assignNewTerm(newTerm);
      });

      await waitFor(() => {
        expect(lastAnnotatorContentProps.content).not.toBe(originalContent);
      });
    });
  });

  describe("onMouseUp", () => {
    let range: any;

    beforeEach(() => {
      const container = {
        nodeType: Node.TEXT_NODE,
      };
      range = {
        startOffset: 1,
        endOffset: 10,
        startContainer: container,
        endContainer: container,
        commonAncestorContainer: container,
        cloneRange: function () {
          return Object.assign({}, this);
        },
        setStart: function (node: Node, offset: number) {
          this.startContainer = node;
          this.startOffset = offset;
        },
        setEnd: function (node: Node, offset: number) {
          this.endContainer = node;
          this.endOffset = offset;
        },
      };

      HtmlDomUtils.getSelectionRange = vi.fn().mockReturnValue(range);
      HtmlDomUtils.isInPopup = vi.fn().mockReturnValue(false);
      // Restores the original implementation possibly mocked out by other describes
      HtmlDomUtils.generateVirtualElement = originalGenerateVirtualElement;
    });

    it("displays selection purpose dialog at an anchor at the beginning of the selection", () => {
      mockWindowSelection({
        isCollapsed: false,
        rangeCount: 1,
        getRangeAt: () => range,
        removeAllRanges: () => null,
        addRange: (r: Range) => (range = r),
      });
      renderAnnotator();
      fireEvent.mouseUp(document.getElementById("annotator")!);
      expect(
        document.getElementById("annotator-selection-dialog-mark-occurrence")
      ).toBeTruthy();
    });

    it("closes selection purpose dialog when no selection is made", () => {
      renderAnnotator();
      fireEvent.mouseUp(document.getElementById("annotator")!);
      expect(
        document.getElementById("annotator-selection-dialog-mark-occurrence")
      ).toBeTruthy();
      HtmlDomUtils.getSelectionRange = vi.fn().mockReturnValue(null);
      fireEvent.mouseUp(document.getElementById("annotator")!);
      expect(
        document.getElementById("annotator-selection-dialog-mark-occurrence")
      ).toBeFalsy();
    });

    it("does nothing when current user is restricted", () => {
      vocabulary.accessLevel = AccessLevel.READ;
      mockWindowSelection({
        isCollapsed: false,
        rangeCount: 1,
        getRangeAt: () => range,
      });
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const originalState = Object.assign({}, ref.current!.state);
      fireEvent.mouseUp(document.getElementById("annotator")!);
      expect(
        document.getElementById("annotator-selection-dialog-mark-occurrence")
      ).toBeFalsy();
      expect(ref.current!.state).toEqual(originalState);
    });
  });

  describe("createTermFromSelection", () => {
    let range: any;

    beforeEach(() => {
      const container = {
        nodeType: Node.TEXT_NODE,
      };
      range = {
        startOffset: 1,
        endOffset: 10,
        startContainer: container,
        endContainer: container,
        commonAncestorContainer: container,
        cloneRange: function () {
          return Object.assign({}, this);
        },
      };
    });

    // Bug #1230
    it("does not mark term occurrence sticky when it is being used to create new term", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      HtmlDomUtils.getSelectionRange = vi.fn().mockReturnValue(range);
      const text = "12345 54321";
      HtmlDomUtils.getRangeContent = vi.fn().mockReturnValue({
        length: 1,
        item: () => ({ nodeType: Node.TEXT_NODE, textContent: text }),
      });
      HtmlDomUtils.replaceRange = vi.fn().mockReturnValue(generalHtmlContent);
      act(() => {
        ref.current!.createTermFromSelection();
      });
      expect(ref.current!.state.stickyAnnotationId).toEqual("");
    });
  });

  describe("markTermDefinition", () => {
    let range: any;

    const annotation = {
      about: "_:13",
      content: "infrastruktura",
      property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
      typeof: VocabularyUtils.TERM_OCCURRENCE,
    };

    beforeEach(() => {
      const container = {
        nodeType: Node.TEXT_NODE,
      };
      range = {
        startOffset: 1,
        endOffset: 10,
        startContainer: container,
        endContainer: container,
        commonAncestorContainer: container,
        cloneRange: function () {
          return Object.assign({}, this);
        },
      };
    });

    it("sets content from the created annotation as definition of the term being currently created", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      act(() => {
        ref.current!.setState({ newTermLabelAnnotation: annotation });
      });
      HtmlDomUtils.getSelectionRange = vi.fn().mockReturnValue(range);
      const text = "12345 54321";
      HtmlDomUtils.getRangeContent = vi.fn().mockReturnValue({
        length: 1,
        item: () => ({ nodeType: Node.TEXT_NODE, textContent: text }),
      });
      HtmlDomUtils.replaceRange = vi.fn().mockReturnValue(generalHtmlContent);
      act(() => {
        ref.current!.markTermDefinition();
      });
      expect(document.getElementById("annotator-create-term")).toBeTruthy();
    });

    // Bug #1230
    it("does not mark term definition sticky when it is being used as new term's definition", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      act(() => {
        ref.current!.setState({ newTermLabelAnnotation: annotation });
      });
      HtmlDomUtils.getSelectionRange = vi.fn().mockReturnValue(range);
      const text = "12345 54321";
      HtmlDomUtils.getRangeContent = vi.fn().mockReturnValue({
        length: 1,
        item: () => ({ nodeType: Node.TEXT_NODE, textContent: text }),
      });
      HtmlDomUtils.replaceRange = vi.fn().mockReturnValue(generalHtmlContent);
      act(() => {
        ref.current!.markTermDefinition();
      });
      expect(ref.current!.state.stickyAnnotationId).toEqual("");
    });
  });

  describe("assignNewTerm", () => {
    const labelAnnotation = {
      about: "_:13",
      content: "infrastruktura",
      property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
      typeof: VocabularyUtils.TERM_OCCURRENCE,
    };
    const definitionAnnotation = {
      about: "_:14",
      property: VocabularyUtils.IS_DEFINITION_OF_TERM,
      typeof: VocabularyUtils.DEFINITION,
    };
    const labelNode = {
      attribs: {
        about: labelAnnotation.about,
        resource: undefined,
        typeof: AnnotationType.OCCURRENCE,
      },
    };
    const defNode = {
      attribs: {
        about: definitionAnnotation.about,
        resource: undefined,
        typeof: AnnotationType.DEFINITION,
      },
    };

    beforeEach(() => {
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockImplementation((dom, about) =>
          about === labelAnnotation.about ? labelNode : defNode
        );
    });

    it("assigns new term to the annotation used to define new term label", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      act(() => {
        ref.current!.setState({ newTermLabelAnnotation: labelAnnotation });
      });
      const term = Generator.generateTerm();

      act(() => {
        ref.current!.assignNewTerm(term);
      });
      expect(labelNode.attribs.resource).toEqual(term.iri);
    });

    it("assigns new term to the annotation used to define new term definition", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      act(() => {
        ref.current!.setState({
          newTermLabelAnnotation: labelAnnotation,
          newTermDefinitionAnnotation: definitionAnnotation,
        });
      });

      const term = Generator.generateTerm();
      act(() => {
        ref.current!.assignNewTerm(term);
      });
      expect(labelNode.attribs.resource).toEqual(term.iri);
      expect(defNode.attribs.resource).toEqual(term.iri);
    });

    it("sets definition source of the new term", async () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      act(() => {
        ref.current!.setState({
          newTermLabelAnnotation: labelAnnotation,
          newTermDefinitionAnnotation: definitionAnnotation,
        });
      });
      const term = Generator.generateTerm();
      act(() => {
        ref.current!.assignNewTerm(term);
      });
      await waitFor(() => {
        expect(mockedCallbackProps.setTermDefinitionSource).toHaveBeenCalled();
      });
      const src = (mockedCallbackProps.setTermDefinitionSource as Mock).mock
        .calls[0][0];
      expect(src.term).toEqual(term);
      expect(src.target.source.iri).toEqual(fileIri.toString());
    });
  });

  describe("onSaveTermDefinition", () => {
    let definitionAnnotation: AnnotationSpanProps;
    let annotationNode: any;
    let term: Term;

    beforeEach(() => {
      definitionAnnotation = {
        about: "_:14",
        property: VocabularyUtils.IS_DEFINITION_OF_TERM,
        typeof: VocabularyUtils.DEFINITION,
      };
      annotationNode = {
        attribs: {
          about: definitionAnnotation.about,
          resource: undefined,
          typeof: definitionAnnotation.typeof,
        },
      };
      term = Generator.generateTerm();
    });

    it("creates term definition source when annotation is definition", async () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockReturnValue(annotationNode);
      act(() => {
        ref.current!.setState({
          existingTermDefinitionAnnotationElement: annotationNode as Element,
        });
      });
      await act(async () => {
        await ref.current!.onSaveTermDefinition(term);
      });

      expect(mockedCallbackProps.setTermDefinitionSource).toHaveBeenCalled();
      const src = (mockedCallbackProps.setTermDefinitionSource as Mock).mock
        .calls[0][0];
      expect(src).toBeInstanceOf(TermOccurrence);
      expect(src.term).toEqual(term);
      expect(src.target.source.iri).toEqual(fileIri.toString());
      expect(
        src.types.indexOf(VocabularyUtils.TERM_DEFINITION_SOURCE)
      ).not.toEqual(-1);
      expect(src.types.indexOf(VocabularyUtils.TERM_OCCURRENCE)).toEqual(-1);
    });

    it("makes a shallow copy of parsed content to force its re-render", async () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const originalContent = lastAnnotatorContentProps.content;
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockReturnValue(annotationNode);
      act(() => {
        ref.current!.setState({
          existingTermDefinitionAnnotationElement: annotationNode as Element,
        });
      });
      act(() => {
        ref.current!.onSaveTermDefinition(term);
      });

      await waitFor(() => {
        expect(lastAnnotatorContentProps.content).not.toBe(originalContent);
      });
    });

    it("removes previously created annotation when term definition assignment fails", async () => {
      mockedCallbackProps.setTermDefinitionSource = vi
        .fn()
        .mockRejectedValue({});
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockReturnValue(annotationNode);
      AnnotationDomHelper.removeAnnotation = vi.fn();
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      act(() => {
        ref.current!.setState({
          existingTermDefinitionAnnotationElement: annotationNode as Element,
        });
      });
      await act(async () => {
        await ref.current!.onSaveTermDefinition(term);
      });

      expect(mockedCallbackProps.setTermDefinitionSource).toHaveBeenCalled();
      expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalled();
    });

    it("updates term with the specified definition content", async () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockReturnValue(annotationNode);
      act(() => {
        ref.current!.setState({
          existingTermDefinitionAnnotationElement: annotationNode as Element,
        });
      });
      await act(async () => {
        await ref.current!.onSaveTermDefinition(term);
      });
      expect(mockedCallbackProps.updateTerm).toHaveBeenCalledWith(term);
    });
  });

  describe("onRemove", () => {
    it("makes a shallow copy of parsed content to force its re-render", async () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const originalContent = lastAnnotatorContentProps.content;
      const annotation = {
        about: "_:14",
        property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
        typeof: VocabularyUtils.TERM_OCCURRENCE,
      };
      const annotationNode = {
        attribs: {
          about: annotation.about,
          resource: Generator.generateUri(),
          typeof: annotation.typeof,
        },
      };
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockReturnValue(annotationNode);
      act(() => {
        ref.current!.onRemove(annotation.about);
      });

      await waitFor(() => {
        expect(lastAnnotatorContentProps.content).not.toBe(originalContent);
      });
    });

    it("removes term occurrence when annotation was term occurrence", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const annotation = {
        about: "_:14",
        property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
        typeof: VocabularyUtils.TERM_OCCURRENCE,
      };
      const annotationNode = {
        attribs: {
          about: annotation.about,
          resource: Generator.generateUri(),
          typeof: annotation.typeof,
        },
      };
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockReturnValue(annotationNode);
      act(() => {
        ref.current!.onRemove(annotation.about);
      });
      expect(mockedCallbackProps.removeTermOccurrence).toHaveBeenCalledWith({
        iri: `${fileIri.toString()}/occurrences/14`,
      });
    });
  });

  describe("onAnnotationTermSelected", () => {
    let annotation: AnnotationSpanProps;
    let annotationNode: any;

    beforeEach(() => {
      annotation = {
        about: "_:14",
        property: VocabularyUtils.IS_OCCURRENCE_OF_TERM,
        typeof: VocabularyUtils.TERM_OCCURRENCE,
      };
      annotationNode = {
        attribs: {
          about: annotation.about,
          typeof: annotation.typeof,
        },
      };
      AnnotationDomHelper.findAnnotation = vi
        .fn()
        .mockReturnValue(annotationNode);
    });

    it("sets annotation resource attribute to provided value when a term was indeed selected", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const term = Generator.generateTerm();
      annotation.resource = term.iri;
      act(() => {
        ref.current!.onAnnotationTermSelected(annotation, term);
      });
      expect(annotationNode.attribs.resource).toBeDefined();
      expect(annotationNode.attribs.resource).toEqual(term.iri);
    });

    // Bug #1399
    it("deletes annotation resource attribute when null term is selected", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      annotationNode.resource = Generator.generateUri();
      act(() => {
        ref.current!.onAnnotationTermSelected(annotation, null);
      });
      expect(annotationNode.attribs.resource).not.toBeDefined();
    });

    it("updates content when annotation is term occurrence", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const term = Generator.generateTerm();
      annotation.resource = term.iri;
      act(() => {
        ref.current!.onAnnotationTermSelected(annotation, term);
      });
      expect(mockedCallbackProps.onUpdate).toHaveBeenCalled();
    });

    it("approves term occurrences when annotation is term occurrence", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const term = Generator.generateTerm();
      annotation.resource = term.iri;
      annotation.score = "1.0";
      act(() => {
        ref.current!.onAnnotationTermSelected(annotation, term);
      });
      expect(mockedCallbackProps.approveTermOccurrence).toHaveBeenCalledWith({
        iri: `${fileIri.toString()}/occurrences/${annotation.about!.substring(
          2
        )}`,
      });
    });

    // Term definition sources have to be confirmed by user before the HTML is updated
    it("does not update content when annotation is term definition source", () => {
      annotation.property = VocabularyUtils.IS_DEFINITION_OF_TERM;
      annotation.typeof = AnnotationType.DEFINITION;
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const term = Generator.generateTerm();
      annotation.resource = term.iri;
      act(() => {
        ref.current!.onAnnotationTermSelected(annotation, term);
      });
      expect(mockedCallbackProps.onUpdate).not.toHaveBeenCalled();
    });

    it("does not create term occurrence when user approves existing annotation", () => {
      const ref = React.createRef<Annotator>();
      renderAnnotator({}, ref);
      const term = Generator.generateTerm();
      annotation.resource = term.iri;
      annotation.score = "1.0";
      act(() => {
        ref.current!.onAnnotationTermSelected(annotation, term);
      });
      expect(mockedCallbackProps.saveTermOccurrence).not.toHaveBeenCalled();
    });
  });
});
