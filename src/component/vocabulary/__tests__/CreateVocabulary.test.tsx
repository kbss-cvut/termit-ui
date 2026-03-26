import Routing from "../../../util/Routing";
import CreateVocabulary from "../CreateVocabulary";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Routes from "../../../util/Routes";
import Ajax, { params } from "../../../util/Ajax";
import Vocabulary from "../../../model/Vocabulary";
import { shallow } from "enzyme";
import {
  flushPromises,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import Constants from "../../../util/Constants";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Document from "../../../model/Document";
import CreateVocabularyForm from "../CreateVocabularyForm";
import * as Redux from "react-redux";
import * as AsyncActions from "../../../action/AsyncActions";
import { langString } from "../../../model/MultilingualString";
import MarkdownEditor from "../../misc/MarkdownEditor";
import { act } from "react-dom/test-utils";
import type {Mock} from "vitest";
import {mockAjax} from "../../../__tests__/environment/TestUtil";

vi.mock("react-redux", async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        useSelector: vi.fn(),
        useDispatch: vi.fn(),
    };
});
vi.mock("../../../util/Routing");
mockAjax();
vi.mock("../../misc/HelpIcon", () => ({default: () => <div>Help</div>}));
vi.mock("../../misc/MarkdownEditor", () => ({default: () => <div>Editor</div>}));
vi.mock("../../misc/PromiseTrackingMask", () => ({default: () => <span>Mask</span>}));

describe("Create vocabulary view", () => {
  const iri = "http://onto.fel.cvut.cz/ontologies/termit/vocabulary/test";

  beforeEach(() => {
    mockUseI18n();
    // @ts-ignore
    vi
      .spyOn(Redux, "useDispatch")
      .mockReturnValue(vi.fn().mockResolvedValue(iri));
    vi.spyOn(AsyncActions, "createVocabulary");
    Ajax.post = vi.fn().mockResolvedValue({ data: iri });
    vi.spyOn(AsyncActions, "createFileInDocument");
    vi.spyOn(AsyncActions, "uploadFileContent");
    vi
      .spyOn(Redux, "useSelector")
      .mockReturnValue(Constants.DEFAULT_LANGUAGE);
  });

  it("returns to Vocabulary Management on cancel", () => {
    const wrapper = shallow(<CreateVocabulary />);
    wrapper.find(CreateVocabularyForm).props().onCancel();
    expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.vocabularies);
  });

  it("enables submit button only when name is not empty", async () => {
    const wrapper = mountWithIntl(<CreateVocabulary />);
    let submitButton = wrapper.find("#create-vocabulary-submit").first();
    expect(submitButton.props().disabled).toBeTruthy();
    await act(async () => {
      const nameInput = wrapper.find('input[name="create-vocabulary-label"]');
      (nameInput.getDOMNode() as HTMLInputElement).value = "Metropolitan Plan";
      nameInput.simulate("change", nameInput);
      await flushPromises();
      wrapper.update();
    });
    submitButton = wrapper.find("#create-vocabulary-submit").first();
    expect(submitButton.props().disabled).toBeFalsy();
  });

  it("calls onCreate on submit click", async () => {
    const wrapper = mountWithIntl(<CreateVocabulary />);
    await act(async () => {
      const nameInput = wrapper.find('input[name="create-vocabulary-label"]');
      (nameInput.getDOMNode() as HTMLInputElement).value = "Metropolitan Plan";
      nameInput.simulate("change", nameInput);
      await Ajax.post(
        Constants.API_PREFIX + "/identifiers",
        params({ name: "", assetType: "VOCABULARY" })
      );
      const submitButton = wrapper.find("#create-vocabulary-submit").first();
      submitButton.simulate("click");
    });
    expect(AsyncActions.createVocabulary).toHaveBeenCalled();
  });

  it("transitions to vocabulary summary on success", async () => {
    const wrapper = shallow(<CreateVocabulary />);

    const label = langString("Test vocabulary");
    const comment = langString("Test vocabulary comment");
    wrapper
      .find(CreateVocabularyForm)
      .props()
      .onSave(
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
    const wrapper = mountWithIntl(<CreateVocabulary />);
    const label = "Test vocabulary";
    const comment = "Test vocabulary comment";
    const types = [
      VocabularyUtils.VOCABULARY,
      VocabularyUtils.DOCUMENT_VOCABULARY,
    ];
    await act(async () => {
      wrapper.find(MarkdownEditor).props().onChange!(comment);
      const nameInput = wrapper.find('input[name="create-vocabulary-label"]');
      (nameInput.getDOMNode() as HTMLInputElement).value = label;
      nameInput.simulate("change", nameInput);
      await flushPromises();
      wrapper.update();
      const submitButton = wrapper.find("#create-vocabulary-submit").first();
      submitButton.simulate("click");
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
      })
    );
  });

  describe("IRI generation", () => {
    it("requests IRI generation when name changes", async () => {
      const wrapper = mountWithIntl(<CreateVocabulary />);
      const name = "Metropolitan Plan";
      await act(async () => {
        const nameInput = wrapper.find('input[name="create-vocabulary-label"]');
        (nameInput.getDOMNode() as HTMLInputElement).value = name;
        nameInput.simulate("change", nameInput);
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
      const wrapper = mountWithIntl(<CreateVocabulary />);
      act(() => {
        const iriInput = wrapper.find('input[name="create-vocabulary-iri"]');
        (iriInput.getDOMNode() as HTMLInputElement).value = "http://test";
        iriInput.simulate("change", iriInput);
      });
      act(() => {
        const nameInput = wrapper.find('input[name="create-vocabulary-label"]');
        (nameInput.getDOMNode() as HTMLInputElement).value =
          "Metropolitan Plan";
        nameInput.simulate("change", nameInput);
      });
      expect(Ajax.post).not.toHaveBeenCalled();
    });

    it("displays IRI generated and returned by the server", async () => {
      const wrapper = mountWithIntl(<CreateVocabulary />);
      await act(async () => {
        const nameInput = wrapper.find('input[name="create-vocabulary-label"]');
        (nameInput.getDOMNode() as HTMLInputElement).value =
          "Metropolitan Plan";
        nameInput.simulate("change", nameInput);
        await flushPromises();
      });
      const iriInput = wrapper.find('input[name="create-vocabulary-iri"]');
      expect((iriInput.getDOMNode() as HTMLInputElement).value).toEqual(iri);
    });
  });
});
