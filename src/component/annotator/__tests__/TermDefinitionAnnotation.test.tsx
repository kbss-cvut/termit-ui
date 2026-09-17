import Generator from "../../../__tests__/environment/Generator";
import Term from "../../../model/Term";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { TermDefinitionAnnotation } from "../TermDefinitionAnnotation";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import * as Actions from "../../../action/AsyncTermActions";
import * as redux from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import type { Mock } from "vitest";
import AccessLevel from "../../../model/acl/AccessLevel";
import { MemoryRouter } from "react-router";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useDispatch: vi.fn(),
  };
});

describe("TermDefinitionAnnotation", () => {
  const annotationProps = {
    target: "test",
    resource: Generator.generateUri(),
    text: "Test definition",
  };

  let actions: {
    onRemove: () => void;
    onSelectTerm: (term: Term | null) => void;
    onToggleDetailOpen: () => void;
    onClose: () => void;
  };

  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    actions = {
      onRemove: vi.fn(),
      onSelectTerm: vi.fn(),
      onToggleDetailOpen: vi.fn(),
      onClose: vi.fn(),
    };
    mockUseI18n();
    fakeDispatch = vi.fn();
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
    const target = document.createElement("span");
    target.id = "test";
    document.body.appendChild(target);
  });

  afterEach(() => {
    document.getElementById("test")?.remove();
  });

  function renderComponent(props: any) {
    return renderWithIntl(
      <MemoryRouter>
        <TermDefinitionAnnotation
          isOpen={true}
          {...annotationProps}
          {...actions}
          accessLevel={AccessLevel.WRITE}
          {...props}
        />
      </MemoryRouter>
    );
  }

  it("renders term definition view by default", () => {
    renderComponent({ term: Generator.generateTerm() });
    expect(screen.getByText("Term:")).toBeInTheDocument();
    expect(screen.queryByText("Term not selected.")).not.toBeInTheDocument();
  });

  it("renders term definition edit when no term is provided", () => {
    renderComponent({ term: null });
    expect(screen.getByText("Term not selected.")).toBeInTheDocument();
  });

  it("switches from editing to view mode when a term is provided", () => {
    const { rerender } = renderComponent({ term: null });
    expect(screen.getByText("Term not selected.")).toBeInTheDocument();
    const term = Generator.generateTerm();
    rerender(
      <MemoryRouter>
        <TermDefinitionAnnotation
          isOpen={true}
          {...annotationProps}
          {...actions}
          accessLevel={AccessLevel.WRITE}
          term={term}
        />
      </MemoryRouter>
    );
    expect(screen.queryByText("Term not selected.")).not.toBeInTheDocument();
    expect(screen.getByText("Term:")).toBeInTheDocument();
  });

  describe("onRemove", () => {
    it("removes term definition source via action as well as invoking annotation removal", async () => {
      const term = Generator.generateTerm();
      vi.spyOn(Actions, "removeTermDefinitionSource");
      const user = userEvent.setup();
      renderComponent({ term });

      await user.click(screen.getByTitle("Remove"));

      expect(actions.onRemove).toHaveBeenCalled();
      expect(Actions.removeTermDefinitionSource).toHaveBeenCalledWith(term);
    });
  });
});
