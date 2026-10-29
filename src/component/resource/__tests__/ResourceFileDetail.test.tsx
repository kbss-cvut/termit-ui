import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import { TextAnalysisRecord } from "../../../model/TextAnalysisRecord";
import { createMemoryHistory } from "history";
import { ResourceFileDetail } from "../ResourceFileDetail";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import File from "../../../model/File";
import Generator from "../../../__tests__/environment/Generator";
import Resource, { EMPTY_RESOURCE } from "../../../model/Resource";
import Routes from "../../../util/Routes";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { act, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import type { Mock } from "vitest";

vi.mock("../../file/FileContentDetail", () => ({
  default: ({
    vocabularyIri,
    scrollTo,
  }: {
    vocabularyIri: IRI;
    scrollTo?: { exactMatch: string };
  }) => (
    <div>
      <div data-testid="file-detail">{JSON.stringify(vocabularyIri)}</div>
      {scrollTo && <div>{scrollTo.exactMatch}</div>}
    </div>
  ),
}));
vi.mock("../../vocabulary/VocabularySelect", () => ({
  default: () => <div>Vocabulary selector</div>,
}));

describe("ResourceFileDetail", () => {
  const resourceName = "test-resource";
  const resourceNamespace = VocabularyUtils.FILE + "/";
  let resource: File;
  let props: ComponentProps<typeof ResourceFileDetail>;
  let loadResource: Mock<
    ComponentProps<typeof ResourceFileDetail>["loadResource"]
  >;
  let loadLatestTextAnalysisRecord: Mock<
    ComponentProps<typeof ResourceFileDetail>["loadLatestTextAnalysisRecord"]
  >;
  let popRoutingPayload: Mock<
    ComponentProps<typeof ResourceFileDetail>["popRoutingPayload"]
  >;

  beforeEach(() => {
    loadResource = vi.fn();
    loadLatestTextAnalysisRecord = vi.fn().mockResolvedValue(null);
    popRoutingPayload = vi.fn();
    const location = {
      pathname: "/resource/" + resourceName + "/annotate/",
      search: "?fileNamespace=" + resourceNamespace,
      hash: "",
      state: {},
    };
    resource = new File({
      iri: resourceNamespace + resourceName,
      label: "Test resource",
      types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
    });
    props = {
      resource,
      routeTransitionPayload: {},
      loadResource,
      loadLatestTextAnalysisRecord,
      popRoutingPayload,
      clearResource: vi.fn(),
      location,
      history: createMemoryHistory(),
      match: {
        params: { fileName: resourceName },
        path: location.pathname,
        isExact: true,
        url: "http://localhost:3000/" + location.pathname + location.search,
      },
      ...intlFunctions(),
    };
  });

  async function renderDetail(overrides: Partial<typeof props> = {}) {
    props = { ...props, ...overrides };
    const result = renderWithIntl(<ResourceFileDetail {...props} />);
    await act(async () => {});
    return {
      ...result,
      update: async (changes: Partial<typeof props>) => {
        props = { ...props, ...changes };
        await act(async () => {
          result.rerender(<ResourceFileDetail {...props} />);
        });
      },
    };
  }

  function setOwner(vocabularyIri = Generator.generateUri()) {
    resource.owner = {
      iri: Generator.generateUri(),
      label: "Test document",
      vocabulary: { iri: vocabularyIri },
      files: [resource],
    };
    return vocabularyIri;
  }

  function expectVocabulary(iri: string) {
    expect(screen.getByTestId("file-detail")).toHaveTextContent(
      JSON.stringify(VocabularyUtils.create(iri))
    );
  }

  function mockAnalysisRecord() {
    const vocabularyIri = Generator.generateUri();
    loadLatestTextAnalysisRecord.mockResolvedValue(
      new TextAnalysisRecord({
        iri: Generator.generateUri(),
        analyzedResource: resource,
        created: new Date().toISOString(),
        vocabularies: [{ iri: vocabularyIri }],
      })
    );
    return vocabularyIri;
  }

  it("loads resource on mount", async () => {
    await renderDetail();
    expect(loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(resourceNamespace + resourceName)
    );
  });

  it("retrieves vocabulary IRI from provided resource when it belongs to a document related to a vocabulary", async () => {
    const vocabularyIri = setOwner();
    await renderDetail();
    expectVocabulary(vocabularyIri);
    expect(loadLatestTextAnalysisRecord).not.toHaveBeenCalled();
  });

  it("retrieves vocabulary IRI from resource when it belongs to a document related to a vocabulary on update", async () => {
    const vocabularyIri = setOwner();
    const view = await renderDetail({ resource: EMPTY_RESOURCE });
    await view.update({ resource });
    expectVocabulary(vocabularyIri);
  });

  it("retrieves latest text analysis record for a standalone file on mount", async () => {
    const vocabularyIri = mockAnalysisRecord();
    await renderDetail();
    expect(loadLatestTextAnalysisRecord).toHaveBeenCalledWith(
      VocabularyUtils.create(resourceNamespace + resourceName)
    );
    await waitFor(() => expectVocabulary(vocabularyIri));
  });

  it("retrieves latest text analysis record for a standalone file", async () => {
    const vocabularyIri = mockAnalysisRecord();
    const view = await renderDetail({ resource: EMPTY_RESOURCE });
    await view.update({ resource });
    expect(loadLatestTextAnalysisRecord).toHaveBeenCalledWith(
      VocabularyUtils.create(resourceNamespace + resourceName)
    );
    expectVocabulary(vocabularyIri);
  });

  it("renders vocabulary selector when no text analysis record exists for a standalone file", async () => {
    const view = await renderDetail({ resource: EMPTY_RESOURCE });
    await view.update({ resource });
    expect(loadLatestTextAnalysisRecord).toHaveBeenCalledWith(
      VocabularyUtils.create(resourceNamespace + resourceName)
    );
    expect(screen.queryByTestId("file-detail")).not.toBeInTheDocument();
    expect(screen.getByText("Vocabulary selector")).toBeInTheDocument();
  });

  it("rechecks for Vocabulary IRI when new File is provided", async () => {
    setOwner();
    const view = await renderDetail();
    const vocabularyIri = Generator.generateUri();
    const anotherFile = new File({
      iri: Generator.generateUri(),
      label: resourceName,
      owner: {
        iri: Generator.generateUri(),
        label: "Test document two",
        vocabulary: { iri: vocabularyIri },
        files: [],
      },
      types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
    });
    await view.update({ resource: anotherFile });
    expectVocabulary(vocabularyIri);
  });

  it("does not attempt to load text analysis record when current resource is empty", async () => {
    const view = await renderDetail();
    loadLatestTextAnalysisRecord.mockClear();
    await view.update({ resource: EMPTY_RESOURCE });
    expect(loadLatestTextAnalysisRecord).not.toHaveBeenCalled();
  });

  it("does not attempt to load text analysis record when current resource is not file", async () => {
    await renderDetail({
      resource: new Resource({
        iri: Generator.generateUri(),
        label: "test resource",
        types: [VocabularyUtils.RESOURCE],
      }),
    });
    expect(loadLatestTextAnalysisRecord).not.toHaveBeenCalled();
  });

  it("extracts selector of annotation to highlight from route transition payload", async () => {
    setOwner();
    const selector = {
      iri: Generator.generateUri(),
      exactMatch: "test-term",
      types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
    };
    await renderDetail({
      routeTransitionPayload: { [Routes.annotateFile.name]: { selector } },
    });
    expect(screen.getByText(selector.exactMatch)).toBeInTheDocument();
  });

  it("clears route transition payload for file annotation route after mount", async () => {
    await renderDetail();
    expect(popRoutingPayload).toHaveBeenCalled();
  });

  it("reloads resource when filename in URL changes", async () => {
    const view = await renderDetail();
    const newResourceName = "different-resource";
    await view.update({
      match: { ...props.match, params: { fileName: newResourceName } },
    });
    expect(loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(resourceNamespace + newResourceName)
    );
  });

  it("reloads resource when namespace in URL changes", async () => {
    const view = await renderDetail();
    const newNamespace = `${Generator.generateUri()}/`;
    const location = {
      ...props.location,
      search: `?fileNamespace=${newNamespace}`,
    };
    await view.update({
      location,
      match: {
        ...props.match,
        url: "http://localhost:3000/" + location.pathname + location.search,
      },
    });
    expect(loadResource).toHaveBeenCalledWith(
      VocabularyUtils.create(newNamespace + resourceName)
    );
  });

  it("sets vocabulary IRI in state to undefined to force its reload when namespace in URL changes", async () => {
    const vocabularyIri = setOwner();
    const view = await renderDetail();
    expectVocabulary(vocabularyIri);
    await view.update({
      location: {
        ...props.location,
        search: `?fileNamespace=${Generator.generateUri()}/`,
      },
    });
    expect(screen.queryByTestId("file-detail")).not.toBeInTheDocument();
  });

  // Bug #1587
  it("does not reset vocabulary IRI when namespace is only encoded", async () => {
    const vocabularyIri = setOwner();
    const view = await renderDetail();
    expectVocabulary(vocabularyIri);
    await view.update({
      location: {
        ...props.location,
        search: "?fileNamespace=" + encodeURIComponent(resourceNamespace),
      },
    });
    expectVocabulary(vocabularyIri);
  });
});
