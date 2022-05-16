import { TextQuoteSelector } from "../../../model/TermOccurrence";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Term from "../../../model/Term";
import Routes from "../../../util/Routes";
import { VocabularyData } from "../../../model/Vocabulary";
import { TermDefinitionSourceLink } from "../TermDefinitionSourceLink";
import {
  flushPromises,
  mockStore,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router";
import { langString } from "../../../model/MultilingualString";
import ActionType from "../../../action/ActionType";
import * as Actions from "../../../action/AsyncResourceActions";
import File from "../../../model/File";

describe("TermDefinitionSourceLink", () => {
  const file: File = new File(
    Object.assign(Generator.generateAssetData(), {
      owner: { iri: Generator.generateUri(), label: "document", files: [] },
    })
  );
  let term: Term;

  beforeEach(() => {
    const vocabulary: VocabularyData = {
      iri: Generator.generateUri(),
      label: "Test vocabulary",
    };
    term = new Term({
      iri: Generator.generateUri(),
      label: langString("Test"),
      scopeNote: langString("test"),
      vocabulary,
      definitionSource: {
        term: { iri: "test", label: langString("test") },
        target: {
          source: { iri: Generator.generateUri() },
          selectors: [],
          types: [VocabularyUtils.FILE_OCCURRENCE_TARGET],
        },
        types: [VocabularyUtils.TERM_DEFINITION_SOURCE],
      },
    });
    term.definitionSource!.term = term;
  });

  it("pushes definition source selector to transition payload store when transition to definition source is triggered", async () => {
    const loadFileMetadata = jest.fn().mockResolvedValue(file);
    jest.spyOn(Actions, "loadFileMetadata").mockReturnValue(loadFileMetadata);
    const selector: TextQuoteSelector = {
      iri: Generator.generateUri(),
      exactMatch: "test",
      types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
    };
    term.definitionSource!.target!.selectors = [selector];
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <TermDefinitionSourceLink term={term} />
      </MemoryRouter>
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper
      .find("button#term-metadata-definitionSource-goto")
      .simulate("click");
    const action = mockStore
      .getActions()
      .find((a) => a.type === ActionType.PUSH_ROUTING_PAYLOAD);
    expect(action).toBeDefined();
    expect(action.routeName).toEqual(Routes.annotateFile.name);
    expect(action.payload).toEqual({ selector });
  });

  it("loads file metadata on mount", async () => {
    jest.spyOn(Actions, "loadFileMetadata");
    mountWithIntl(
      <MemoryRouter>
        <TermDefinitionSourceLink term={term} />
      </MemoryRouter>
    );
    await act(async () => {
      await flushPromises();
    });
    return Promise.resolve().then(() => {
      expect(Actions.loadFileMetadata).toHaveBeenCalledWith(
        VocabularyUtils.create(term.definitionSource!.target!.source!.iri!)
      );
    });
  });
});
