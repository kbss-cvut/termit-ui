import { mountWithIntl } from "../../../__tests__/environment/Environment";
import Generator from "../../../__tests__/environment/Generator";
import RemoveVocabularyDialog from "../RemoveVocabularyDialog";
import {
  getVocabularyRelations,
  getVocabularyTermsRelations,
} from "../../../action/AsyncVocabularyActions";
import RDFStatement from "../../../model/RDFStatement";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router";
import { useDispatch } from "react-redux";
import CustomInput from "../../misc/CustomInput";
import React from "react";
import Ajax from "../../../util/Ajax";
import { changeInputValue } from "../../../__tests__/environment/TestUtil";
import ConfirmCancelDialog from "../../misc/ConfirmCancelDialog";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { Input } from "reactstrap";
import { ReactWrapper } from "enzyme";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

jest.mock("../../../action/AsyncVocabularyActions", () => ({
  ...jest.requireActual("../../../action/AsyncVocabularyActions"),
  getVocabularyRelations: jest.fn(),
  getVocabularyTermsRelations: jest.fn(),
}));

jest.mock("../../../action/AsyncActions", () => ({
  ...jest.requireActual("../../../action/AsyncActions"),
  loadTermByIri: jest.fn().mockResolvedValue(null),
}));

describe("RemoveVocabularyDialog", () => {
  const vocabulary = Generator.generateVocabulary();
  const locale = intlFunctions().locale;

  const rdfStatement: RDFStatement = {
    object: { iri: Generator.generateUri() },
    subject: { iri: Generator.generateUri() },
    relation: { iri: Generator.generateUri() },
  };

  let onCancel: () => void;
  let onSubmit: () => void;

  beforeEach(() => {
    vocabulary.termCount = 5;
    onCancel = jest.fn();
    onSubmit = jest.fn();
    (getVocabularyRelations as jest.Mock).mockResolvedValue([]);
    (getVocabularyTermsRelations as jest.Mock).mockResolvedValue([]);

    (useDispatch as jest.Mock).mockReturnValue(
      (value: any) => value || Promise.resolve()
    );

    Ajax.get = jest.fn().mockResolvedValue(null);

    jest.clearAllMocks();
  });

  it("Disables Remove button when a vocabulary relation exists", async () => {
    (getVocabularyRelations as jest.Mock).mockResolvedValue([rdfStatement]);
    let wrapper = await mount();

    const cancelDialog = wrapper.find(ConfirmCancelDialog);
    expect(cancelDialog.props()["confirmDisabled"]).toBeTruthy();
  });

  it("Disables Remove button when a vocabulary term relation exists", async () => {
    (getVocabularyTermsRelations as jest.Mock).mockResolvedValue([
      rdfStatement,
    ]);
    let wrapper = await mount();

    const cancelDialog = wrapper.find(ConfirmCancelDialog);
    expect(cancelDialog.props()["confirmDisabled"]).toBeTruthy();
  });

  it("Disables Remove button when a vocabulary and a term relation exists", async () => {
    (getVocabularyRelations as jest.Mock).mockResolvedValue([rdfStatement]);
    (getVocabularyTermsRelations as jest.Mock).mockResolvedValue([
      rdfStatement,
    ]);
    let wrapper = await mount();

    const cancelDialog = wrapper.find(ConfirmCancelDialog);
    expect(cancelDialog.props()["confirmDisabled"]).toBeTruthy();
  });

  it("Disables Remove button when no relation exists and vocabulary is not empty", async () => {
    let wrapper = await mount();

    const cancelDialog = wrapper.find(ConfirmCancelDialog);
    expect(cancelDialog.props()["confirmDisabled"]).toBeTruthy();
  });

  it("Enables Remove button when no relation exists and vocabulary is empty", async () => {
    vocabulary.termCount = 0;
    let wrapper = await mount();

    const cancelDialog = wrapper.find(ConfirmCancelDialog);
    expect(cancelDialog.props()["confirmDisabled"]).toBeFalsy();
  });

  it("Hides input for vocabulary name when a vocabulary relation exists", async () => {
    (getVocabularyRelations as jest.Mock).mockResolvedValue([rdfStatement]);
    let wrapper = await mount();

    const input = wrapper.find(CustomInput);
    expect(input.exists()).toBeFalsy();
  });

  it("Hides input for vocabulary name when a term relation exists", async () => {
    (getVocabularyTermsRelations as jest.Mock).mockResolvedValue([
      rdfStatement,
    ]);
    let wrapper = await mount();

    const input = wrapper.find(CustomInput);
    expect(input.exists()).toBeFalsy();
  });
  it("Hides input for vocabulary name when a vocabulary and a term relation exists", async () => {
    (getVocabularyRelations as jest.Mock).mockResolvedValue([rdfStatement]);
    (getVocabularyTermsRelations as jest.Mock).mockResolvedValue([
      rdfStatement,
    ]);
    let wrapper = await mount();

    const input = wrapper.find(CustomInput);
    expect(input.exists()).toBeFalsy();
  });
  it("Hides input for vocabulary name when a vocabulary is empty", async () => {
    vocabulary.termCount = 0;
    let wrapper = await mount();

    const input = wrapper.find(CustomInput);
    expect(input.exists()).toBeFalsy();
  });

  it("Shows input for vocabulary name when no relation exists and vocabulary is not empty", async () => {
    let wrapper = await mount();

    const input = wrapper.find(CustomInput);
    expect(input.exists()).toBeTruthy();
  });

  it("Disables submit button when input is empty", async () => {
    let wrapper = await mount();

    const input = wrapper.find(CustomInput).find(Input);
    const dialog = wrapper.find(ConfirmCancelDialog);
    act(() => changeInputValue(input, ""));

    update(wrapper);

    expect(input.props().value).toEqual("");
    expect(dialog.props().confirmDisabled).toBeTruthy();
  });

  it("Disables submit button when input has invalid vocabulary name", async () => {
    let wrapper = await mount();
    let invalidValue = vocabulary.getLabel(locale) + "invalid";

    const input = () => wrapper.find(CustomInput).find(Input);
    const dialog = () => wrapper.find(ConfirmCancelDialog);
    act(() => changeInputValue(input(), invalidValue));

    update(wrapper);

    expect(input().props().value).toEqual(invalidValue);
    expect(dialog().props().confirmDisabled).toBeTruthy();
  });

  it("Enables submit button when input has valid vocabulary name", async () => {
    let wrapper = await mount();

    const input = () => wrapper.find(CustomInput).find(Input);
    const dialog = () => wrapper.find(ConfirmCancelDialog);
    act(() => changeInputValue(input(), vocabulary.getLabel(locale)));

    update(wrapper);

    expect(input().props().value).toEqual(vocabulary.getLabel(locale));
    expect(dialog().props().confirmDisabled).toBeFalsy();
  });

  function update(wrapper: ReactWrapper) {
    act(() => {
      wrapper.update();
    });
  }

  async function mount() {
    let wrapper = mountWithIntl(
      <MemoryRouter>
        <RemoveVocabularyDialog
          show={false}
          onCancel={onCancel}
          onSubmit={onSubmit}
          vocabulary={vocabulary}
        />
      </MemoryRouter>
    );
    await act(
      () =>
        new Promise((resolve): void => {
          // because of wrappers
          wrapper.setProps(
            {
              children: React.cloneElement(wrapper.props().children, {
                show: true,
                onCancel: onCancel,
                onSubmit: onSubmit,
                vocabulary,
              }),
            },
            resolve
          );
        })
    );

    act(() => {
      wrapper.update();
    });

    expect(wrapper.find(RemoveVocabularyDialog).props().show).toBeTruthy();
    expect(getVocabularyRelations).toHaveBeenCalled();
    expect(getVocabularyTermsRelations).toHaveBeenCalled();
    return wrapper!;
  }
});
