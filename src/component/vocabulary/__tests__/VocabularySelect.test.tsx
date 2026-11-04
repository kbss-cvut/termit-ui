import {
  default as Vocabulary,
  EMPTY_VOCABULARY,
} from "../../../model/Vocabulary";
import VocabularySelect from "../VocabularySelect";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import * as redux from "react-redux";
import * as Actions from "../../../action/AsyncActions";
import { fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

describe("VocabularySelect", () => {
  let voc: Vocabulary;
  let onVocabularySet: (voc: Vocabulary) => void;
  let vocabularies: { [key: string]: Vocabulary };

  beforeEach(() => {
    onVocabularySet = vi.fn();
    voc = EMPTY_VOCABULARY;
    vocabularies = {};
    vocabularies[EMPTY_VOCABULARY.iri] = EMPTY_VOCABULARY;
  });

  it("loads vocabularies on mount", () => {
    (redux.useSelector as Mock).mockReturnValue({});
    const fakeDispatch = vi.fn();
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
    const loadAction = vi.fn();
    vi.spyOn(Actions, "loadVocabulariesIfNotLoaded").mockReturnValue(
      loadAction
    );
    mockUseI18n();
    renderWithIntl(
      <VocabularySelect vocabulary={voc} onVocabularySet={onVocabularySet} />
    );
    expect(Actions.loadVocabulariesIfNotLoaded).toHaveBeenCalled();
    expect(fakeDispatch).toHaveBeenCalledWith(loadAction);
  });

  it("VocabularySelect Selection calls the callback", () => {
    (redux.useSelector as Mock).mockReturnValue(vocabularies);
    const fakeDispatch = vi.fn();
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
    mockUseI18n();
    const { container } = renderWithIntl(
      <VocabularySelect vocabulary={voc} onVocabularySet={onVocabularySet} />
    );
    fireEvent.click(container.querySelector(".dropdown-toggle")!);
    fireEvent.click(container.querySelector(".m-vocabulary-select-item")!);
    expect(onVocabularySet).toHaveBeenCalled();
  });
});
