import React from "react";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Vocabulary, { EMPTY_VOCABULARY } from "../../../model/Vocabulary";
import { createMemoryHistory, Location } from "history";
import { match as Match, MemoryRouter } from "react-router";
import { VocabularySummary } from "../VocabularySummary";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import * as redux from "react-redux";
import Generator from "../../../__tests__/environment/Generator";
import TermItState from "../../../model/TermItState";
import AccessLevel from "../../../model/acl/AccessLevel";
import { langString } from "../../../model/MultilingualString";
import { DEFAULT_CONFIGURATION } from "../../../model/Configuration";
import { StompClient } from "../../hoc/withStompClient";
import { fireEvent } from "@testing-library/react";
import { act } from "react";
import type { Mock } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});
vi.mock("../../changetracking/AssetHistory", () => ({
  default: () => <div>Asset history</div>,
}));
vi.mock("../../term/Terms", () => ({ default: () => <div>Terms</div> }));
vi.mock("../TermChangeFrequency", () => ({
  default: () => <div>Term frequency</div>,
}));
vi.mock("../VocabularyEdit", () => ({
  VocabularyEdit: () => <div className="vocabulary-edit" />,
  default: () => <div className="vocabulary-edit" />,
}));

describe("VocabularySummary", () => {
  const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
  const normalizedName = "test-vocabulary";

  let location: Location;
  const history = createMemoryHistory();
  let match: Match<any>;

  let removeVocabulary: (iri: IRI) => Promise<any>;

  let onLoad: (iri: IRI) => void;
  let onUpdate: (vocabulary: Vocabulary) => Promise<any>;
  let exportToCsv: (iri: IRI) => void;
  let exportToExcel: (iri: IRI) => void;
  let exportToTurtle: (iri: IRI) => void;
  let exportWithReferences: (iri: IRI) => void;
  let requestVocabularyValidation: (iri: IRI, stompClient: StompClient) => void;
  let exportFunctions: any;

  let vocabulary: Vocabulary;
  let state: TermItState;

  beforeEach(() => {
    onLoad = vi.fn().mockResolvedValue({});
    onUpdate = vi.fn().mockResolvedValue(undefined);
    removeVocabulary = vi.fn().mockImplementation(() => Promise.resolve());
    exportToCsv = vi.fn();
    exportToExcel = vi.fn();
    exportToTurtle = vi.fn();
    exportWithReferences = vi.fn();
    requestVocabularyValidation = vi.fn();
    exportFunctions = {
      exportToCsv,
      exportToExcel,
      exportToTurtle,
      exportWithReferences,
    };
    location = {
      pathname: "/vocabulary/" + normalizedName,
      search: `namespace=${namespace}`,
      hash: "",
      state: {},
    };
    match = {
      params: {
        name: normalizedName,
      },
      path: location.pathname,
      isExact: true,
      url: "http://localhost:3000/" + location.pathname,
    };
    state = new TermItState();
    vocabulary = new Vocabulary({
      iri: namespace + normalizedName,
      label: langString("Test vocabulary"),
      accessLevel: AccessLevel.WRITE,
    });
    const user = Generator.generateUser();
    user.types.push(VocabularyUtils.USER_EDITOR);
    state.user = user;
    (redux.useSelector as Mock).mockImplementation((selector) =>
      selector(state)
    );
  });

  function summaryElement(
    props: Partial<React.ComponentProps<typeof VocabularySummary>> = {},
    ref?: React.RefObject<VocabularySummary>
  ) {
    return (
      <MemoryRouter>
        <VocabularySummary
          ref={ref}
          vocabulary={EMPTY_VOCABULARY}
          updateVocabulary={onUpdate}
          loadVocabulary={onLoad}
          removeVocabulary={removeVocabulary}
          history={history}
          location={location}
          configuration={DEFAULT_CONFIGURATION}
          {...exportFunctions}
          requestVocabularyValidation={requestVocabularyValidation}
          match={match}
          {...intlFunctions()}
          {...props}
        />
      </MemoryRouter>
    );
  }

  function renderSummary(
    props: Partial<React.ComponentProps<typeof VocabularySummary>> = {},
    ref: React.RefObject<VocabularySummary> = React.createRef()
  ) {
    return renderWithIntl(summaryElement(props, ref));
  }

  it("loads vocabulary on mount", () => {
    renderSummary();
    expect(onLoad).toHaveBeenCalledWith({
      fragment: normalizedName,
      namespace,
    });
  });

  it("passes namespace to vocabulary loading when specified", () => {
    location.search = "?namespace=" + namespace;
    renderSummary();
    expect(onLoad).toHaveBeenCalledWith({
      fragment: normalizedName,
      namespace,
    });
  });

  it("does not attempt to reload vocabulary when namespace is missing in location and fragment is identical", () => {
    const ref = React.createRef<VocabularySummary>();
    const { rerender } = renderSummary({}, ref);
    rerender(summaryElement({ vocabulary }, ref));
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it("invokes remove action and closes remove confirmation dialog on remove", () => {
    const ref = React.createRef<VocabularySummary>();
    renderSummary({ vocabulary }, ref);
    act(() => ref.current!.onRemove());
    expect(removeVocabulary).toHaveBeenCalledWith(vocabulary);
    expect(ref.current!.state.showRemoveDialog).toBeFalsy();
  });

  it("opens edit view on edit button click", () => {
    const { container } = renderSummary({ vocabulary });
    expect(container.querySelector(".vocabulary-edit")).toBeNull();
    fireEvent.click(container.querySelector("#vocabulary-summary-edit")!);
    expect(container.querySelector(".vocabulary-edit")).toBeInTheDocument();
  });

  it("hides edit button on on edit", () => {
    const ref = React.createRef<VocabularySummary>();
    const { container } = renderSummary({ vocabulary }, ref);
    act(() => ref.current!.onEdit());
    expect(container.querySelector("#vocabulary-summary-edit")).toBeNull();
  });

  it("invokes vocabulary update action on save", () => {
    const ref = React.createRef<VocabularySummary>();
    renderSummary({ vocabulary }, ref);
    act(() => ref.current!.onEdit());
    const update = new Vocabulary({
      iri: vocabulary.iri,
      label: langString("Updated label"),
    });
    act(() => ref.current!.onSave(update));
    expect(onUpdate).toHaveBeenCalledWith(update);
  });

  it("closes edit after successful update", async () => {
    const ref = React.createRef<VocabularySummary>();
    renderSummary({ vocabulary }, ref);
    act(() => ref.current!.onEdit());
    await act(async () => {
      ref.current!.onSave(vocabulary);
      await Promise.resolve();
    });
    expect(ref.current!.state.edit).toBeFalsy();
  });

  it("reloads vocabulary after successful update", async () => {
    location.search = "?namespace=" + namespace;
    const ref = React.createRef<VocabularySummary>();
    renderSummary({ vocabulary }, ref);
    act(() => ref.current!.onEdit());
    await act(async () => {
      ref.current!.onSave(vocabulary);
      await Promise.resolve();
    });
    expect(onLoad).toHaveBeenCalledWith(VocabularyUtils.create(vocabulary.iri));
  });

  it("reloads Vocabulary when File was added into the Vocabulary's Document", () => {
    const ref = React.createRef<VocabularySummary>();
    renderSummary({}, ref);
    act(() => ref.current!.loadVocabulary());
    expect(onLoad).toHaveBeenCalledWith(VocabularyUtils.create(vocabulary.iri));
  });

  it("does not render modification buttons for user with read access", () => {
    vocabulary.accessLevel = AccessLevel.READ;
    const { container } = renderSummary({ vocabulary });
    expect(
      container.querySelector("#vocabulary-summary-edit")
    ).not.toBeInTheDocument();
    expect(
      container.querySelector("#vocabulary-summary-remove")
    ).not.toBeInTheDocument();
  });
});
