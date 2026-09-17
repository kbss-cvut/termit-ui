import * as React from "react";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Annotation } from "../Annotation";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import Term from "../../../model/Term";
import { AnnotationSpanProps } from "../Annotator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { AnnotationType } from "../AnnotationDomHelper";
import { MemoryRouter } from "react-router-dom";
import Generator from "../../../__tests__/environment/Generator";
import { langString } from "../../../model/MultilingualString";
import AnnotatorLegendFilter from "../../../model/AnnotatorLegendFilter";
import AccessLevel from "../../../model/acl/AccessLevel";
import type { Mock } from "vitest";

vi.mock("../AnnotationTerms", () => ({
  default: () => <div>Annotation terms</div>,
}));

describe("Annotation", () => {
  const term = new Term({
    label: langString("Mesto"),
    iri: "http://data.iprpraha.cz/zdroj/slovnik/mpp-3/pojem/mesto",
  });
  const text = "mesta";
  const suggestedOccProps = {
    about: "_:abcdef",
    property: "ddo:je-vyskytem-termu",
    typeof: "ddo:vyskyt-termu",
    text,
  };
  let assignedOccProps: any;
  let filter: AnnotatorLegendFilter;

  let mockedFunctions: {
    onFetchTerm: (
      termIri: string,
      abortController: AbortController
    ) => Promise<Term>;
    onCreateTerm: (label: string, annotation: AnnotationSpanProps) => void;
    onResetSticky: () => void;
    onUpdate: (annotation: AnnotationSpanProps, term: Term | null) => void;
  };
  beforeEach(() => {
    assignedOccProps = {
      ...suggestedOccProps,
      resource: term.iri,
      score: "1.0",
    };
    mockedFunctions = {
      onFetchTerm: vi.fn().mockResolvedValue(term),
      onCreateTerm: vi.fn(),
      onResetSticky: vi.fn(),
      onUpdate: vi.fn(),
    };
    filter = new AnnotatorLegendFilter();
  });

  /* --- recognizes occurrence --- */
  it("recognizes suggested occurrence", () => {
    const { container } = renderWithIntl(
      <Annotation {...mockedFunctions} {...suggestedOccProps} filter={filter} />
    );

    expect(container.querySelector(".suggested-term-occurrence")).toBeTruthy();
  });

  it("recognizes assigned occurrence", async () => {
    const { container } = renderWithIntl(
      <Annotation {...mockedFunctions} {...assignedOccProps} />
    );

    await waitFor(() =>
      expect(container.querySelector(".assigned-term-occurrence")).toBeTruthy()
    );
  });

  it("fetches assigned term on mount", () => {
    renderWithIntl(<Annotation {...mockedFunctions} {...assignedOccProps} />);
    expect(mockedFunctions.onFetchTerm).toHaveBeenCalledWith(
      assignedOccProps.resource,
      expect.any(AbortController)
    );
  });

  it("fetches assigned term when it changes on update", () => {
    const { rerender } = renderWithIntl(
      <Annotation {...mockedFunctions} {...assignedOccProps} />
    );
    const newResource = Generator.generateUri();
    rerender(
      <Annotation
        {...mockedFunctions}
        {...assignedOccProps}
        resource={newResource}
      />
    );
    expect(mockedFunctions.onFetchTerm).toHaveBeenCalledWith(
      newResource,
      expect.any(AbortController)
    );
  });

  it("recognizes invalid occurrence", async () => {
    mockedFunctions.onFetchTerm = vi.fn().mockRejectedValue("Term not found.");
    const { container } = renderWithIntl(
      <Annotation {...assignedOccProps} {...mockedFunctions} />
    );

    await waitFor(() =>
      expect(container.querySelector(".invalid-term-occurrence")).toBeTruthy()
    );
  });

  it("recognizes term definition", async () => {
    const props = Object.assign({}, assignedOccProps, {
      typeof: AnnotationType.DEFINITION,
      property: VocabularyUtils.IS_DEFINITION_OF_TERM,
    });
    mockedFunctions.onFetchTerm = vi.fn().mockResolvedValue(term);
    const user = userEvent.setup();
    renderWithIntl(<Annotation {...mockedFunctions} {...props} />);
    await waitFor(() => expect(mockedFunctions.onFetchTerm).toHaveBeenCalled());

    await user.click(document.getElementById("idabcdef")!);

    expect(await screen.findByText("Term:")).toBeInTheDocument();
  });

  it("recognizes pending term definition", async () => {
    const props = Object.assign({}, assignedOccProps, {
      typeof: AnnotationType.DEFINITION,
      property: VocabularyUtils.IS_DEFINITION_OF_TERM,
    });
    // No term assigned, yet
    delete props.resource;
    const { container } = renderWithIntl(
      <Annotation {...mockedFunctions} {...props} />
    );

    await waitFor(() =>
      expect(container.querySelector(".pending-term-definition")).toBeTruthy()
    );
  });

  /* --- pinning --- */
  it("keeps occurrence view form open on mouse leave if pinned", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <MemoryRouter>
        <Annotation
          {...mockedFunctions}
          {...assignedOccProps}
          accessLevel={AccessLevel.WRITE}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText("Term occurrence")).not.toBeInTheDocument();
    await user.click(document.getElementById("idabcdef")!);
    expect(await screen.findByText("Term occurrence")).toBeInTheDocument();

    fireEventMouseLeave(document.getElementById("idabcdef")!);

    expect(screen.getByText("Term occurrence")).toBeInTheDocument();
  });

  it("automatically renders annotation popup open on mount if sticky is passed", async () => {
    renderWithIntl(
      <MemoryRouter>
        <Annotation
          {...mockedFunctions}
          {...assignedOccProps}
          accessLevel={AccessLevel.WRITE}
          sticky={true}
        />
      </MemoryRouter>
    );
    expect(await screen.findByText("Term occurrence")).toBeInTheDocument();
  });

  it("renders annotation popup open and pinned when sticky becomes true on update", async () => {
    const { rerender } = renderWithIntl(
      <MemoryRouter>
        <Annotation
          {...mockedFunctions}
          {...assignedOccProps}
          accessLevel={AccessLevel.WRITE}
        />
      </MemoryRouter>
    );
    expect(screen.queryByText("Term occurrence")).not.toBeInTheDocument();
    rerender(
      <MemoryRouter>
        <Annotation
          {...mockedFunctions}
          {...assignedOccProps}
          accessLevel={AccessLevel.WRITE}
          sticky={true}
        />
      </MemoryRouter>
    );
    expect(await screen.findByText("Term occurrence")).toBeInTheDocument();
  });

  // This means that the annotation is new, so let the user directly edit it
  it("renders annotation popup open and in edit mode on mount if sticky is passed and no term is associated with annotation", async () => {
    assignedOccProps.resource = "";
    renderWithIntl(
      <MemoryRouter>
        <Annotation
          {...mockedFunctions}
          {...assignedOccProps}
          accessLevel={AccessLevel.WRITE}
          sticky={true}
        />
      </MemoryRouter>
    );
    expect(await screen.findByText("Term occurrence")).toBeInTheDocument();
  });

  /* --- registers actions --- */
  it("registers remove action if onRemove is bound", async () => {
    renderWithIntl(
      <MemoryRouter>
        <Annotation
          {...mockedFunctions}
          sticky={true}
          {...assignedOccProps}
          accessLevel={AccessLevel.WRITE}
          onRemove={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(
      await screen.findByTitle("Remove term occurrence")
    ).toBeInTheDocument();
  });

  it("registers close action for occurrence form", async () => {
    renderWithIntl(
      <MemoryRouter>
        <Annotation
          {...mockedFunctions}
          {...assignedOccProps}
          accessLevel={AccessLevel.WRITE}
          sticky={true}
        />
      </MemoryRouter>
    );

    expect(await screen.findByTitle("Close")).toBeInTheDocument();
  });

  it("renders annotation in div when specified", () => {
    mockedFunctions.onFetchTerm = vi.fn().mockResolvedValue(term);
    const { container } = renderWithIntl(
      <Annotation {...mockedFunctions} {...assignedOccProps} tag="div" />
    );
    expect(container.firstElementChild!.tagName).toEqual("DIV");
  });

  describe("onCreateTerm", () => {
    it("passes content to term creation handler when it is available", () => {
      const props: any = Object.assign({}, assignedOccProps);
      props.content = "test content";
      const ref = React.createRef<Annotation>();
      renderWithIntl(<Annotation ref={ref} {...mockedFunctions} {...props} />);
      act(() => {
        ref.current!.onCreateTerm();
      });
      expect(mockedFunctions.onCreateTerm).toHaveBeenCalled();
      expect((mockedFunctions.onCreateTerm as Mock).mock.calls[0][0]).toEqual(
        props.content
      );
    });

    it("passes the text of the annotation to term creation handler when content is not available", () => {
      const ref = React.createRef<Annotation>();
      renderWithIntl(
        <Annotation ref={ref} {...mockedFunctions} {...assignedOccProps} />
      );
      act(() => {
        ref.current!.onCreateTerm();
      });
      expect(mockedFunctions.onCreateTerm).toHaveBeenCalled();
      expect((mockedFunctions.onCreateTerm as Mock).mock.calls[0][0]).toEqual(
        assignedOccProps.text
      );
    });

    it("passes current annotation as the second argument to term creation handler", () => {
      const props: any = Object.assign({}, assignedOccProps);
      props.content = "test content";
      const ref = React.createRef<Annotation>();
      renderWithIntl(<Annotation ref={ref} {...mockedFunctions} {...props} />);
      act(() => {
        ref.current!.onCreateTerm();
      });
      expect(mockedFunctions.onCreateTerm).toHaveBeenCalled();
      expect((mockedFunctions.onCreateTerm as Mock).mock.calls[0][1]).toEqual({
        about: assignedOccProps.about,
        property: assignedOccProps.property,
        typeof: assignedOccProps.typeof,
        resource: assignedOccProps.resource,
        score: assignedOccProps.score,
      });
    });

    it("closes the detail popup", () => {
      const ref = React.createRef<Annotation>();
      renderWithIntl(
        <Annotation ref={ref} {...mockedFunctions} {...assignedOccProps} />
      );
      act(() => {
        ref.current!.setState({ detailOpened: true });
      });
      expect(ref.current!.state.detailOpened).toBeTruthy();
      act(() => {
        ref.current!.onCreateTerm();
      });
      expect(ref.current!.state.detailOpened).toBeFalsy();
    });
  });

  describe("onCloseDetail", () => {
    it("resets sticky status if annotation was sticky", () => {
      const ref = React.createRef<Annotation>();
      renderWithIntl(
        <Annotation
          ref={ref}
          sticky={true}
          {...mockedFunctions}
          {...assignedOccProps}
        />
      );
      act(() => {
        ref.current!.onCloseDetail();
      });
      expect(mockedFunctions.onResetSticky).toHaveBeenCalled();
    });
  });

  describe("onClick", () => {
    it("closes annotation if it were previously open", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<Annotation>();
      renderWithIntl(
        <MemoryRouter>
          <Annotation
            ref={ref}
            {...mockedFunctions}
            sticky={true}
            {...assignedOccProps}
            accessLevel={AccessLevel.WRITE}
          />
        </MemoryRouter>
      );
      await waitFor(() => expect(ref.current!.state.detailOpened).toBeTruthy());

      await user.click(document.getElementById("idabcdef")!);

      expect(ref.current!.state.detailOpened).toBeFalsy();
    });
  });

  describe("onSelectTerm", () => {
    // Bug #1359, #1360
    it("sets current term to the selected one", async () => {
      const ref = React.createRef<Annotation>();
      renderWithIntl(
        <Annotation
          ref={ref}
          sticky={true}
          {...mockedFunctions}
          {...assignedOccProps}
        />
      );
      await waitFor(() => expect(ref.current!.state.term).toEqual(term));
      const selectedTerm = Generator.generateTerm();
      act(() => {
        ref.current!.onSelectTerm(selectedTerm);
      });
      expect(ref.current!.state.term).toEqual(selectedTerm);
    });

    it("passes selected term to update handler", async () => {
      const ref = React.createRef<Annotation>();
      renderWithIntl(
        <Annotation
          ref={ref}
          sticky={true}
          {...mockedFunctions}
          {...assignedOccProps}
        />
      );
      await waitFor(() => expect(ref.current!.state.term).toEqual(term));
      const selectedTerm = Generator.generateTerm();
      act(() => {
        ref.current!.onSelectTerm(selectedTerm);
      });
      const args = (mockedFunctions.onUpdate as Mock).mock.calls[0];
      expect(args[0].resource).toEqual(selectedTerm.iri);
      expect(args[1]).toEqual(selectedTerm);
    });

    // Bug #1399
    it("sets annotation resource to undefined when null term is selected", async () => {
      const ref = React.createRef<Annotation>();
      renderWithIntl(
        <Annotation
          ref={ref}
          sticky={true}
          {...mockedFunctions}
          {...assignedOccProps}
        />
      );
      await waitFor(() => expect(ref.current!.state.term).toEqual(term));
      act(() => {
        ref.current!.onSelectTerm(null);
      });
      const args = (mockedFunctions.onUpdate as Mock).mock.calls[0];
      expect(args[0].resource).not.toBeDefined();
    });
  });
});

function fireEventMouseLeave(element: Element) {
  element.dispatchEvent(
    new MouseEvent("mouseleave", { bubbles: false, cancelable: true })
  );
}
