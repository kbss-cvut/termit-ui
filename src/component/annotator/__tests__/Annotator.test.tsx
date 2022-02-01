import {
  mockWindowSelection,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import { Element } from "domhandler";
import { AnnotationSpanProps, Annotator } from "../Annotator";
import { shallow } from "enzyme";
import Annotation from "..//Annotation";
import {
  createAnnotation,
  mountWithIntlAttached,
  surroundWithHtml,
} from "./AnnotationUtil";
import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import SelectionPurposeDialog from "../SelectionPurposeDialog";
import HtmlDomUtils from "../HtmlDomUtils";
import CreateTermFromAnnotation from "../CreateTermFromAnnotation";
import Message from "../../../model/Message";
import AnnotationDomHelper, { AnnotationType } from "../AnnotationDomHelper";
import TermOccurrence, {
  TextQuoteSelector,
} from "../../../model/TermOccurrence";
import AnnotatorContent from "../AnnotatorContent";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import User from "../../../model/User";
import File from "../../../model/File";

jest.mock("../HtmlDomUtils");
jest.mock("../../misc/AssetIriLink");

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
    onUpdate(newHtml: string): void;
    publishMessage(msg: Message): void;
    setTermDefinitionSource(src: TermOccurrence, term: Term): Promise<any>;
    updateTerm(term: Term): Promise<any>;
    removeOccurrence: (occurrence: TermOccurrence) => Promise<any>;
  };
  let user: User;
  let file: File;
  let stateProps: {
    user: User;
    file: File;
  };

  beforeEach(() => {
    mockedCallbackProps = {
      onUpdate: jest.fn(),
      publishMessage: jest.fn(),
      setTermDefinitionSource: jest.fn().mockResolvedValue(null),
      updateTerm: jest.fn().mockResolvedValue({}),
      removeOccurrence: jest.fn().mockResolvedValue({}),
    };
    user = Generator.generateUser();
    file = new File({
      iri: Generator.generateUri(),
      label: "test.html",
      types: [VocabularyUtils.FILE],
    });
    stateProps = { user, file };
  });

  it("renders body of provided html content", () => {
    const wrapper = mountWithIntl(
      <Annotator
        fileIri={fileIri}
        vocabularyIri={vocabularyIri}
        {...mockedCallbackProps}
        {...stateProps}
        initialHtml={generalHtmlContent}
        {...intlFunctions()}
      />
    );

    expect(wrapper.html().includes(sampleContent)).toBe(true);
  });

  it("renders body of provided html content with replaced anchor hrefs", () => {
    const htmlContent = surroundWithHtml(
      'This is a <a href="https://example.org/link">link</a>'
    );

    const wrapper = mountWithIntl(
      <Annotator
        fileIri={fileIri}
        vocabularyIri={vocabularyIri}
        {...mockedCallbackProps}
        {...stateProps}
        initialHtml={htmlContent}
        {...intlFunctions()}
      />
    );
    const sampleOutput =
      'This is a <a data-href="https://example.org/link">link</a>';
    expect(wrapper.html().includes(sampleOutput)).toBe(true);
  });

  it("renders annotation of suggested occurrence of a term", () => {
    const htmlWithOccurrence = surroundWithHtml(
      createAnnotation(suggestedOccProps, "města")
    );
    const wrapper = mountWithIntlAttached(
      <Annotator
        fileIri={fileIri}
        vocabularyIri={vocabularyIri}
        {...mockedCallbackProps}
        {...stateProps}
        initialHtml={htmlWithOccurrence}
        {...intlFunctions()}
      />
    );

    const constructedAnnProps = wrapper.find(Annotation).props();
    const expectedAnnProps = { ...suggestedOccProps };

    expect(constructedAnnProps).toEqual(
      expect.objectContaining(expectedAnnProps)
    );
  });

  describe("on mount", () => {
    const selector: TextQuoteSelector = {
      exactMatch: "test-term",
      types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
    };

    it("scrolls to and highlights annotation identified by specified selector", () => {
      const element = document.createElement("div");
      HtmlDomUtils.findAnnotationElementBySelector = jest
        .fn()
        .mockReturnValue(element);
      HtmlDomUtils.addClassToElement = jest.fn();
      HtmlDomUtils.removeClassFromElement = jest.fn();
      element.scrollIntoView = jest.fn();
      shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...stateProps}
          {...mockedCallbackProps}
          initialHtml={generalHtmlContent}
          scrollTo={selector}
          {...intlFunctions()}
        />
      );
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
      HtmlDomUtils.findAnnotationElementBySelector = jest
        .fn()
        .mockReturnValue(element);
      HtmlDomUtils.addClassToElement = jest.fn();
      HtmlDomUtils.removeClassFromElement = jest.fn();
      element.scrollIntoView = jest.fn();
      jest.useFakeTimers();
      shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...stateProps}
          {...mockedCallbackProps}
          initialHtml={generalHtmlContent}
          scrollTo={selector}
          {...intlFunctions()}
        />
      );
      jest.runAllTimers();
      expect(HtmlDomUtils.removeClassFromElement).toHaveBeenCalledWith(
        element,
        "annotator-highlighted-annotation"
      );
    });

    it("shows error message when annotation for highlighting cannot be found", () => {
      HtmlDomUtils.findAnnotationElementBySelector = jest
        .fn()
        .mockImplementation(() => {
          throw new Error("Unable to find annotation.");
        });
      jest.useFakeTimers();
      shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...stateProps}
          {...mockedCallbackProps}
          initialHtml={generalHtmlContent}
          scrollTo={selector}
          {...intlFunctions()}
        />
      );
      jest.runAllTimers();
    });

    it("sets sticky annotation id to highlighted annotation", () => {
      const about = "_:117";
      const element = document.createElement("div");
      element.setAttribute("about", about);
      HtmlDomUtils.findAnnotationElementBySelector = jest
        .fn()
        .mockReturnValue(element);
      HtmlDomUtils.addClassToElement = jest.fn();
      HtmlDomUtils.removeClassFromElement = jest.fn();
      element.scrollIntoView = jest.fn();
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...stateProps}
          {...mockedCallbackProps}
          initialHtml={generalHtmlContent}
          scrollTo={selector}
          {...intlFunctions()}
        />
      );
      wrapper.update();
      expect(wrapper.state().stickyAnnotationId).toEqual(about);
    });
  });

  // todo rewrite it with xpath-range functions
  xit("renders annotation over selected text on mouseup event", () => {
    const div = document.createElement("div");
    document.body.appendChild(div);
    const wrapper = mountWithIntl(
      <Annotator
        fileIri={fileIri}
        vocabularyIri={vocabularyIri}
        {...mockedCallbackProps}
        {...stateProps}
        initialHtml={generalHtmlContent}
        {...intlFunctions()}
      />,
      { attachTo: div }
    );
    const newSpan = div.querySelector("span");
    const annTarget = { element: newSpan, text: "some text" };
    // @ts-ignore
    wrapper.find(Annotator).instance().surroundSelection = () => annTarget;

    expect(wrapper.html().includes("suggested-term")).toBeFalsy();

    wrapper.simulate("mouseUp");

    expect(wrapper.html().includes("suggested-term")).toBeTruthy();
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
    });

    it("stores annotation from which the new term is being created for later reference", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      wrapper.instance().onCreateTerm("label", annotation);
      expect(wrapper.state().newTermLabelAnnotation).toEqual(annotation);
    });

    // Bug #1245
    it("removes created label annotation when new term creation is cancelled", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      wrapper.instance().setState({ newTermLabelAnnotation: annotation });
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotation);
      AnnotationDomHelper.removeAnnotation = jest.fn();

      wrapper.instance().onCloseCreate();
      expect(wrapper.state().newTermLabelAnnotation).not.toBeDefined();
      expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledWith(
        annotation,
        expect.anything()
      );
    });

    // Bug #1443
    it("does not remove suggested label occurrence when new term creation is cancelled", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      annotation.score = "1.0";
      wrapper.instance().setState({ newTermLabelAnnotation: annotation });
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotation);
      AnnotationDomHelper.removeAnnotation = jest.fn();

      wrapper.instance().onCloseCreate();
      // Workaround for not.toHaveBeenCalled throwing an error
      expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledTimes(0);
    });

    it("does not confirmed term label occurrence when new term creation is cancelled", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      annotation.resource = Generator.generateUri();
      wrapper.instance().setState({ newTermLabelAnnotation: annotation });
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotation);
      AnnotationDomHelper.removeAnnotation = jest.fn();

      wrapper.instance().onCloseCreate();
      // Workaround for not.toHaveBeenCalled throwing an error
      expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledTimes(0);
    });

    // Bug #1245
    it("removes created definition annotation when new term creation is cancelled", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      const labelAnnotation = annotation;
      const definitionAnnotation = {
        about: "_:14",
        content: "term definition text",
        property: VocabularyUtils.IS_DEFINITION_OF_TERM,
        typeof: VocabularyUtils.TERM_DEFINITION_SOURCE,
      };
      wrapper.instance().setState({
        newTermLabelAnnotation: labelAnnotation,
        newTermDefinitionAnnotation: definitionAnnotation,
      });
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockImplementation((dom: any, annotationId: string) => {
          return annotationId === labelAnnotation.about
            ? labelAnnotation
            : definitionAnnotation;
        });
      AnnotationDomHelper.removeAnnotation = jest.fn();

      wrapper.instance().onCloseCreate();
      expect(wrapper.state().newTermDefinitionAnnotation).not.toBeDefined();
      expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalledWith(
        definitionAnnotation,
        expect.anything()
      );
    });

    it("makes a shallow copy of parsed content to force its re-render when new term is created", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      const annotationNode = {
        attribs: {
          about: annotation.about,
          typeof: annotation.typeof,
        },
      };
      wrapper.instance().setState({ newTermLabelAnnotation: annotation });
      const originalContent = wrapper.find(AnnotatorContent).prop("content");
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotationNode);
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
        nodeType: Node.TEXT_NODE,
      };
      range = {
        startOffset: 1,
        endOffset: 10,
        startContainer: container,
        endContainer: container,
        commonAncestorContainer: container,
      };
      HtmlDomUtils.getSelectionRange = jest.fn().mockReturnValue(range);
    });

    it("displays selection purpose dialog at an anchor at the beginning of the selection", () => {
      mockWindowSelection({
        isCollapsed: false,
        rangeCount: 1,
        getRangeAt: () => range,
      });
      window.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: () => "16px",
      });
      const wrapper = mountWithIntl(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      wrapper.find("#annotator").simulate("mouseUp");
      wrapper.update();
      expect(wrapper.find(SelectionPurposeDialog).props().show).toBeTruthy();
    });

    it("closes selection purpose dialog when no selection is made", () => {
      window.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: () => "16px",
      });
      const wrapper = mountWithIntl(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      wrapper.find("#annotator").simulate("mouseUp");
      expect(wrapper.find(SelectionPurposeDialog).props().show).toBeTruthy();
      HtmlDomUtils.getSelectionRange = jest.fn().mockReturnValue(null);
      wrapper.find("#annotator").simulate("mouseUp");
      expect(wrapper.find(SelectionPurposeDialog).props().show).toBeFalsy();
    });

    it("does nothing when current user is restricted", () => {
      user.types.push(VocabularyUtils.USER_RESTRICTED);
      mockWindowSelection({
        isCollapsed: false,
        rangeCount: 1,
        getRangeAt: () => range,
      });
      window.getComputedStyle = jest.fn().mockReturnValue({
        getPropertyValue: () => "16px",
      });
      const wrapper = mountWithIntl(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      const originalState = Object.assign({}, wrapper.find(Annotator).state());
      wrapper.find("#annotator").simulate("mouseUp");
      wrapper.update();
      expect(wrapper.find(SelectionPurposeDialog).props().show).toBeFalsy();
      expect(wrapper.find(Annotator).state()).toEqual(originalState);
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
      };
    });

    // Bug #1230
    it("does not mark term occurrence sticky when it is being used to create new term", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      HtmlDomUtils.getSelectionRange = jest.fn().mockReturnValue(range);
      const text = "12345 54321";
      HtmlDomUtils.getRangeContent = jest.fn().mockReturnValue({
        length: 1,
        item: () => ({ nodeType: Node.TEXT_NODE, textContent: text }),
      });
      HtmlDomUtils.replaceRange = jest.fn().mockReturnValue(generalHtmlContent);
      wrapper.instance().createTermFromSelection();
      wrapper.update();
      expect(wrapper.instance().state.stickyAnnotationId).toEqual("");
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
      };
    });

    it("sets content from the created annotation as definition of the term being currently created", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      wrapper.setState({ newTermLabelAnnotation: annotation });
      HtmlDomUtils.getSelectionRange = jest.fn().mockReturnValue(range);
      const text = "12345 54321";
      HtmlDomUtils.getRangeContent = jest.fn().mockReturnValue({
        length: 1,
        item: () => ({ nodeType: Node.TEXT_NODE, textContent: text }),
      });
      HtmlDomUtils.replaceRange = jest.fn().mockReturnValue(generalHtmlContent);
      wrapper.instance().markTermDefinition();
      wrapper.update();
      expect(wrapper.find(CreateTermFromAnnotation).prop("show")).toBeTruthy();
    });

    // Bug #1230
    it("does not mark term definition sticky when it is being used as new term's definition", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      wrapper.setState({ newTermLabelAnnotation: annotation });
      HtmlDomUtils.getSelectionRange = jest.fn().mockReturnValue(range);
      const text = "12345 54321";
      HtmlDomUtils.getRangeContent = jest.fn().mockReturnValue({
        length: 1,
        item: () => ({ nodeType: Node.TEXT_NODE, textContent: text }),
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
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockImplementation((dom, about) =>
          about === labelAnnotation.about ? labelNode : defNode
        );
    });

    it("assigns new term to the annotation used to define new term label", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      wrapper.setState({ newTermLabelAnnotation: labelAnnotation });
      const term = Generator.generateTerm();

      wrapper.instance().assignNewTerm(term);
      expect(labelNode.attribs.resource).toEqual(term.iri);
    });

    it("assigns new term to the annotation used to define new term definition", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      wrapper.setState({
        newTermLabelAnnotation: labelAnnotation,
        newTermDefinitionAnnotation: definitionAnnotation,
      });

      const term = Generator.generateTerm();
      wrapper.instance().assignNewTerm(term);
      expect(labelNode.attribs.resource).toEqual(term.iri);
      expect(defNode.attribs.resource).toEqual(term.iri);
    });

    it("sets definition source of the new term", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      wrapper.setState({
        newTermLabelAnnotation: labelAnnotation,
        newTermDefinitionAnnotation: definitionAnnotation,
      });
      const term = Generator.generateTerm();
      wrapper.instance().assignNewTerm(term);
      expect(mockedCallbackProps.setTermDefinitionSource).toHaveBeenCalled();
      const src = (mockedCallbackProps.setTermDefinitionSource as jest.Mock)
        .mock.calls[0][0];
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

    it("creates term definition source when annotation is definition", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotationNode);
      wrapper.setState({
        existingTermDefinitionAnnotationElement: annotationNode as Element,
      });
      wrapper.instance().onSaveTermDefinition(term);

      expect(mockedCallbackProps.setTermDefinitionSource).toHaveBeenCalled();
      const src = (mockedCallbackProps.setTermDefinitionSource as jest.Mock)
        .mock.calls[0][0];
      expect(src).toBeInstanceOf(TermOccurrence);
      expect(src.term).toEqual(term);
      expect(src.target.source.iri).toEqual(fileIri.toString());
      expect(
        src.types.indexOf(VocabularyUtils.TERM_DEFINITION_SOURCE)
      ).not.toEqual(-1);
      expect(src.types.indexOf(VocabularyUtils.TERM_OCCURRENCE)).toEqual(-1);
    });

    it("makes a shallow copy of parsed content to force its re-render", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      const originalContent = wrapper.find(AnnotatorContent).prop("content");
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotationNode);
      wrapper.setState({
        existingTermDefinitionAnnotationElement: annotationNode as Element,
      });
      wrapper.instance().onSaveTermDefinition(term);
      wrapper.update();

      return Promise.resolve().then(() => {
        const newContent = wrapper.find(AnnotatorContent).prop("content");
        expect(newContent).not.toBe(originalContent);
      });
    });

    it("removes previously created annotation when term definition assignment fails", async () => {
      mockedCallbackProps.setTermDefinitionSource = jest
        .fn()
        .mockRejectedValue({});
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotationNode);
      AnnotationDomHelper.removeAnnotation = jest.fn();
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      wrapper.setState({
        existingTermDefinitionAnnotationElement: annotationNode as Element,
      });
      await wrapper.instance().onSaveTermDefinition(term);
      wrapper.update();

      return Promise.resolve().then(() => {
        expect(mockedCallbackProps.setTermDefinitionSource).toHaveBeenCalled();
        expect(AnnotationDomHelper.removeAnnotation).toHaveBeenCalled();
      });
    });

    it("updates term with the specified definition content", async () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotationNode);
      wrapper.setState({
        existingTermDefinitionAnnotationElement: annotationNode as Element,
      });
      await wrapper.instance().onSaveTermDefinition(term);
      return Promise.resolve().then(() => {
        expect(mockedCallbackProps.updateTerm).toHaveBeenCalledWith(term);
      });
    });
  });

  describe("onRemove", () => {
    it("makes a shallow copy of parsed content to force its re-render", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      const originalContent = wrapper.find(AnnotatorContent).prop("content");
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
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotationNode);
      wrapper.instance().onRemove(annotation.about);
      wrapper.update();

      return Promise.resolve().then(() => {
        const newContent = wrapper.find(AnnotatorContent).prop("content");
        expect(newContent).not.toBe(originalContent);
      });
    });

    it("removes occurrence when occurrence IRI is provided", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
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
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotationNode);
      const occurrenceIri = Generator.generateUri();
      wrapper.instance().onRemove(annotation.about, occurrenceIri);

      return Promise.resolve().then(() => {
        expect(mockedCallbackProps.removeOccurrence).toHaveBeenCalledWith({
          iri: occurrenceIri,
        });
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
      AnnotationDomHelper.findAnnotation = jest
        .fn()
        .mockReturnValue(annotationNode);
    });

    it("sets annotation resource attribute to provided value when a term was indeed selected", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      const term = Generator.generateTerm();
      annotation.resource = term.iri;
      wrapper.instance().onAnnotationTermSelected(annotation, term);
      expect(annotationNode.attribs.resource).toBeDefined();
      expect(annotationNode.attribs.resource).toEqual(term.iri);
    });

    // Bug #1399
    it("deletes annotation resource attribute when null term is selected", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      annotationNode.resource = Generator.generateUri();
      wrapper.instance().onAnnotationTermSelected(annotation, null);
      expect(annotationNode.attribs.resource).not.toBeDefined();
    });

    it("updates content when annotation is term occurrence", () => {
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      const term = Generator.generateTerm();
      annotation.resource = term.iri;
      wrapper.instance().onAnnotationTermSelected(annotation, term);
      expect(mockedCallbackProps.onUpdate).toHaveBeenCalled();
    });

    // Term definition sources have to be confirmed by user before the HTML is updated
    it("does not update content when annotation is term definition source", () => {
      annotation.property = VocabularyUtils.IS_DEFINITION_OF_TERM;
      annotation.typeof = AnnotationType.DEFINITION;
      const wrapper = shallow<Annotator>(
        <Annotator
          fileIri={fileIri}
          vocabularyIri={vocabularyIri}
          {...mockedCallbackProps}
          {...stateProps}
          initialHtml={generalHtmlContent}
          {...intlFunctions()}
        />
      );
      const term = Generator.generateTerm();
      annotation.resource = term.iri;
      wrapper.instance().onAnnotationTermSelected(annotation, term);
      expect(mockedCallbackProps.onUpdate).not.toHaveBeenCalled();
    });
  });
});
