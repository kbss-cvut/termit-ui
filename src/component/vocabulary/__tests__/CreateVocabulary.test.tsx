import Routing from "../../../util/Routing";
import CreateVocabulary from "../CreateVocabulary";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Routes from "../../../util/Routes";
import Ajax, { params } from "../../../util/Ajax";
import Vocabulary from "../../../model/Vocabulary";
import {
  flushPromises,
  renderWithIntl,
} from "../../../__tests__/environment/Environment";
import Constants from "../../../util/Constants";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Document from "../../../model/Document";
import * as Redux from "react-redux";
import * as AsyncActions from "../../../action/AsyncActions";
import { langString } from "../../../model/MultilingualString";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/react";
import { Mock, vi } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});
vi.mock(import("../../../util/Ajax"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      post: vi.fn(),
    } as any,
  };
});
vi.mock("../../../util/Routing");
vi.mock("../../misc/HelpIcon", () => ({ default: () => <div>Help</div> }));
const mocks = vi.hoisted(() => ({
  formProps: {} as any,
  editorProps: {} as any,
}));
vi.mock("../../misc/MarkdownEditor", () => ({
  default: (props: any) => {
    mocks.editorProps = props;
    return <div>Editor</div>;
  },
}));
vi.mock("../CreateVocabularyForm", async (importOriginal) => {
  const actual =
    (await importOriginal()) as typeof import("../CreateVocabularyForm");
  return {
    __esModule: true,
    default: (props: any) => {
      mocks.formProps = props;
      const Form = actual.default;
      return <Form {...props} />;
    },
  };
});
vi.mock("../../misc/PromiseTrackingMask", () => ({
  default: () => <span>Mask</span>,
}));

describe("Create vocabulary view", () => {
  const iri = "http://onto.fel.cvut.cz/ontologies/termit/vocabulary/test";

  beforeEach(() => {
    mockUseI18n();
    // @ts-ignore
    vi.spyOn(Redux, "useDispatch").mockReturnValue(
      vi.fn().mockResolvedValue(iri)
    );
    vi.spyOn(AsyncActions, "createVocabulary");
    Ajax.post = vi.fn().mockResolvedValue({ data: iri });
    vi.spyOn(AsyncActions, "createFileInDocument");
    vi.spyOn(AsyncActions, "uploadFileContent");
    vi.spyOn(Redux, "useSelector").mockReturnValue(Constants.DEFAULT_LANGUAGE);
  });

  it("returns to Vocabulary Management on cancel", () => {
    const { container } = renderWithIntl(<CreateVocabulary />);
    fireEvent.click(container.querySelector("#create-vocabulary-cancel")!);
    expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.vocabularies);
  });

  it("enables submit button only when name is not empty", async () => {
    const { container } = renderWithIntl(<CreateVocabulary />);
    let submitButton = container.querySelector(
      "#create-vocabulary-submit"
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBeTruthy();
    await act(async () => {
      fireEvent.change(
        container.querySelector('input[name="create-vocabulary-label"]')!,
        { target: { value: "Metropolitan Plan" } }
      );
      await flushPromises();
    });
    submitButton = container.querySelector(
      "#create-vocabulary-submit"
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBeFalsy();
  });

  it("calls onCreate on submit click", async () => {
    const { container } = renderWithIntl(<CreateVocabulary />);
    await act(async () => {
      fireEvent.change(
        container.querySelector('input[name="create-vocabulary-label"]')!,
        { target: { value: "Metropolitan Plan" } }
      );
      await Ajax.post(
        Constants.API_PREFIX + "/identifiers",
        params({ name: "", assetType: "VOCABULARY" })
      );
      fireEvent.click(container.querySelector("#create-vocabulary-submit")!);
    });
    expect(AsyncActions.createVocabulary).toHaveBeenCalled();
  });

  it("transitions to vocabulary summary on success", async () => {
    renderWithIntl(<CreateVocabulary />);

    const label = langString("Test vocabulary");
    const comment = langString("Test vocabulary comment");
    mocks.formProps.onSave(
      new Vocabulary({
        iri,
        label,
        comment,
        document: new Document({
          iri: `${iri}/document`,
          label: "Document",
          files: [],
        }),
      }),
      [],
      []
    );
    await flushPromises();
    expect(AsyncActions.createVocabulary).toHaveBeenCalled();
    expect(Routing.transitionTo).toHaveBeenCalled();
    const calls = (Routing.transitionTo as Mock).mock.calls;
    const args = calls[calls.length - 1];
    expect(args[0]).toEqual(Routes.vocabularySummary);
    expect(args[1]).toEqual({
      params: new Map([["name", "test"]]),
      query: new Map(),
    });
  });

  it("passes state representing new vocabulary to vocabulary creation handler on submit", async () => {
    const { container } = renderWithIntl(<CreateVocabulary />);
    const label = "Test vocabulary";
    const comment = "Test vocabulary comment";
    const types = [VocabularyUtils.VOCABULARY];
    await act(async () => {
      mocks.editorProps.onChange!(comment);
      fireEvent.change(
        container.querySelector('input[name="create-vocabulary-label"]')!,
        { target: { value: label } }
      );
      await flushPromises();
      fireEvent.click(container.querySelector("#create-vocabulary-submit")!);
      await flushPromises();
    });
    const docIri = iri + "/document";
    const docLabel = "Document for Test vocabulary";
    const docTypes = [VocabularyUtils.RESOURCE, VocabularyUtils.DOCUMENT];
    const document = new Document({
      iri: docIri,
      label: docLabel,
      types: docTypes,
      files: [],
    });
    expect(AsyncActions.createVocabulary).toHaveBeenCalledWith(
      new Vocabulary({
        iri,
        label: langString(label),
        comment: langString(comment),
        document,
        types,
        primaryLanguage: Constants.DEFAULT_LANGUAGE,
        preferredNamespaceUri: iri,
      })
    );
  });

  describe("IRI generation", () => {
    it("requests IRI generation when name changes", async () => {
      const { container } = renderWithIntl(<CreateVocabulary />);
      const name = "Metropolitan Plan";
      await act(async () => {
        fireEvent.change(
          container.querySelector('input[name="create-vocabulary-label"]')!,
          { target: { value: name } }
        );
        await flushPromises();
      });
      expect(Ajax.post).toHaveBeenCalledWith(
        Constants.API_PREFIX + "/identifiers",
        params({
          name,
          assetType: "VOCABULARY",
        })
      );
    });

    it("does not request IRI generation when IRI value had been changed manually before", () => {
      const { container } = renderWithIntl(<CreateVocabulary />);
      act(() => {
        fireEvent.change(
          container.querySelector('input[name="create-vocabulary-iri"]')!,
          { target: { value: "http://test" } }
        );
      });
      act(() => {
        fireEvent.change(
          container.querySelector('input[name="create-vocabulary-label"]')!,
          { target: { value: "Metropolitan Plan" } }
        );
      });
      expect(Ajax.post).not.toHaveBeenCalledWith(
        Constants.API_PREFIX + "/identifiers",
        expect.anything()
      );
    });

    it("displays IRI generated and returned by the server", async () => {
      const { container } = renderWithIntl(<CreateVocabulary />);
      await act(async () => {
        fireEvent.change(
          container.querySelector('input[name="create-vocabulary-label"]')!,
          { target: { value: "Metropolitan Plan" } }
        );
        await flushPromises();
      });
      const iriInput = container.querySelector(
        'input[name="create-vocabulary-iri"]'
      ) as HTMLInputElement;
      expect(iriInput.value).toEqual(iri);
    });
  });
});
