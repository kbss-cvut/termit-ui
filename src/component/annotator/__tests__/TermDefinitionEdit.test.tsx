import Term from "../../../model/Term";
import { TermDefinitionEdit } from "../TermDefinitionEdit";
import {
  intlFunctions,
  mockUseI18n,
} from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import { mountWithIntlAttached } from "./AnnotationUtil";
import { ElementType } from "htmlparser2";
import { TermDefinitionBlockEdit } from "../../term/TermDefinitionBlockEdit";
import Constants from "../../../util/Constants";
import CustomInput from "../../misc/CustomInput";
import MarkdownEditor from "../../misc/MarkdownEditor";
import {
  mockStore,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";

jest.mock("../../misc/MarkdownEditor", () => () => <div>Editor</div>);

describe("TermDefinitionEdit", () => {
  let onSave: (update: Term) => void;
  let onCancel: () => void;

  beforeEach(() => {
    onSave = jest.fn();
    onCancel = jest.fn();
    mockStore.getState().configuration.language = Constants.DEFAULT_LANGUAGE;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns null when no element and term are provided", () => {
    mockUseI18n();
    const wrapper = mountWithIntl(
      <TermDefinitionEdit
        onSave={onSave}
        onCancel={onCancel}
        {...intlFunctions()}
      />
    );
    expect(wrapper.find(TermDefinitionEdit).isEmptyRender()).toBeTruthy();
  });

  it("renders simple definition editing block when definition does not exist on selected term", () => {
    const term = Generator.generateTerm();
    const annotatedElement: any = {
      type: ElementType.Text,
      data: "Test definition text",
      attribs: {
        about: "_:123",
        resource: term.iri,
      },
    };
    const wrapper = mountWithIntlAttached(
      <TermDefinitionEdit
        onSave={onSave}
        onCancel={onCancel}
        term={term}
        annotationElement={annotatedElement}
        {...intlFunctions()}
      />
    );
    const definitionEdit = wrapper.find(TermDefinitionBlockEdit);
    expect(definitionEdit.exists()).toBeTruthy();
    expect(definitionEdit.length).toEqual(1);
  });

  it("renders definition blocks with existing and selected text content when term already has definition", () => {
    const term = Generator.generateTerm();
    term.definition = { en: "Original definition text" };
    term.sources = ["hl.1/cl.2/odst.3"];
    const annotatedElement: any = {
      type: ElementType.Text,
      data: "Test definition text",
      attribs: {
        about: "_:123",
        resource: term.iri,
      },
    };
    const wrapper = mountWithIntlAttached(
      <TermDefinitionEdit
        onSave={onSave}
        onCancel={onCancel}
        term={term}
        annotationElement={annotatedElement}
        {...intlFunctions()}
      />
    );
    const definitionEdit = wrapper.find(TermDefinitionBlockEdit);
    expect(definitionEdit.exists()).toBeTruthy();
    expect(definitionEdit.length).toEqual(2);
    const definitionAreas = wrapper.find(MarkdownEditor);
    expect(definitionAreas.get(0).props.value).toEqual(term.definition.en);
    expect(definitionAreas.get(1).props.value).toEqual(annotatedElement.data);
    const sources = wrapper.find(CustomInput);
    sources.forEach((s) => expect(s.prop("value")).toEqual(term.sources![0]));
  });

  it("renders original definition block readOnly", () => {
    const term = Generator.generateTerm();
    term.definition = { en: "Original definition text" };
    const annotatedElement: any = {
      type: ElementType.Text,
      data: "Test definition text",
      attribs: {
        about: "_:123",
        resource: term.iri,
      },
    };
    const wrapper = mountWithIntlAttached(
      <TermDefinitionEdit
        onSave={onSave}
        onCancel={onCancel}
        term={term}
        annotationElement={annotatedElement}
        {...intlFunctions()}
      />
    );
    const definitionEdit = wrapper.find(TermDefinitionBlockEdit);
    expect(definitionEdit.get(0).props.readOnly).toBeTruthy();
  });

  describe("onSave", () => {
    it("passes term with updated term definition based on editing in the component", () => {
      const term = Generator.generateTerm();
      term.definition = { en: "Original definition text" };
      term.sources = ["hl.1/cl.2/odst.3"];
      const annotatedElement: any = {
        type: ElementType.Text,
        data: "Test definition text",
        attribs: {
          about: "_:123",
          resource: term.iri,
        },
      };
      const wrapper = mountWithIntlAttached(
        <TermDefinitionEdit
          onSave={onSave}
          onCancel={onCancel}
          term={term}
          annotationElement={annotatedElement}
          {...intlFunctions()}
        />
      );
      wrapper.find("button#annotator-set-definition-save").simulate("click");
      expect(onSave).toHaveBeenCalled();
      expect((onSave as jest.Mock).mock.calls[0][0].definition).toEqual({
        en: annotatedElement.data,
      });
    });
  });
});
