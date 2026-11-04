import Term from "../../../model/Term";
import { TermDefinitionEdit } from "../TermDefinitionEdit";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import { ElementType } from "htmlparser2";
import Constants from "../../../util/Constants";
import {
  mockStore,
  renderWithIntl,
} from "../../../__tests__/environment/Environment";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mock } from "vitest";

vi.mock("../../misc/MarkdownEditor", () => ({
  default: (props: any) => (
    <div data-testid="markdown-editor" data-readonly={String(!!props.readOnly)}>
      {props.value}
    </div>
  ),
}));

describe("TermDefinitionEdit", () => {
  let onSave: (update: Term) => void;
  let onCancel: () => void;

  beforeEach(() => {
    onSave = vi.fn();
    onCancel = vi.fn();
    mockUseI18n();
    mockStore.getState().configuration.language = Constants.DEFAULT_LANGUAGE;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when no element and term are provided", () => {
    const { container } = renderWithIntl(
      <TermDefinitionEdit onSave={onSave} onCancel={onCancel} />
    );
    expect(container).toBeEmptyDOMElement();
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
    renderWithIntl(
      <TermDefinitionEdit
        onSave={onSave}
        onCancel={onCancel}
        term={term}
        annotationElement={annotatedElement}
      />
    );
    expect(screen.getAllByTestId("markdown-editor")).toHaveLength(1);
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
    renderWithIntl(
      <TermDefinitionEdit
        onSave={onSave}
        onCancel={onCancel}
        term={term}
        annotationElement={annotatedElement}
      />
    );
    const definitionAreas = screen.getAllByTestId("markdown-editor");
    expect(definitionAreas).toHaveLength(2);
    expect(definitionAreas[0]).toHaveTextContent(term.definition.en);
    expect(definitionAreas[1]).toHaveTextContent(annotatedElement.data);
    const sources = screen.getAllByDisplayValue(term.sources![0]);
    expect(sources).toHaveLength(2);
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
    renderWithIntl(
      <TermDefinitionEdit
        onSave={onSave}
        onCancel={onCancel}
        term={term}
        annotationElement={annotatedElement}
      />
    );
    const definitionAreas = screen.getAllByTestId("markdown-editor");
    expect(definitionAreas[0]).toHaveAttribute("data-readonly", "true");
    expect(definitionAreas[1]).toHaveAttribute("data-readonly", "false");
  });

  describe("onSave", () => {
    it("passes term with updated term definition based on editing in the component", async () => {
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
      const user = userEvent.setup();
      renderWithIntl(
        <TermDefinitionEdit
          onSave={onSave}
          onCancel={onCancel}
          term={term}
          annotationElement={annotatedElement}
        />
      );
      await user.click(screen.getByRole("button", { name: /save/i }));
      expect(onSave).toHaveBeenCalled();
      expect((onSave as Mock).mock.calls[0][0].definition).toEqual({
        en: annotatedElement.data,
      });
    });
  });
});
