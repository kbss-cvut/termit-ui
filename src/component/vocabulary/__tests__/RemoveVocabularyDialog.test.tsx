import { renderWithIntl } from "../../../__tests__/environment/Environment";
import Generator from "../../../__tests__/environment/Generator";
import RemoveVocabularyDialog from "../RemoveVocabularyDialog";
import {
  getVocabularyRelations,
  getVocabularyTermsRelations,
} from "../../../action/AsyncVocabularyActions";
import RdfIriStatement from "../../../model/RdfStatement";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Ajax from "../../../util/Ajax";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
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

vi.mock("../../../action/AsyncVocabularyActions", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    getVocabularyRelations: vi.fn(),
    getVocabularyTermsRelations: vi.fn(),
  };
});

vi.mock("../../../action/AsyncActions", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    loadTermInfoByIri: () => () => Promise.resolve(null),
    getLabel: () => () => Promise.resolve(null),
  };
});

const mocks = vi.hoisted(() => ({ dialogProps: {} as any }));
vi.mock("../../misc/ConfirmCancelDialog", () => ({
  default: (props: any) => {
    mocks.dialogProps = props;
    return <div data-testid="confirm-cancel-dialog">{props.children}</div>;
  },
}));

// Temporarily disabled due to issues with mocking popper.js
describe("RemoveVocabularyDialog", () => {
  const vocabulary = Generator.generateVocabulary();
  const locale = intlFunctions().locale;

  const rdfStatement: RdfIriStatement = {
    subject: { iri: Generator.generateUri() },
    relation: { iri: Generator.generateUri() },
    value: { iri: Generator.generateUri() },
  };

  let onCancel: () => void;
  let onSubmit: () => void;

  beforeEach(() => {
    vocabulary.termCount = 5;
    onCancel = vi.fn();
    onSubmit = vi.fn();
    (getVocabularyRelations as Mock).mockResolvedValue([]);
    (getVocabularyTermsRelations as Mock).mockResolvedValue([]);

    (useDispatch as Mock).mockReturnValue((arg: any) => {
      if (arg instanceof Promise) {
        return arg;
      }
      if (arg instanceof Function) {
        return arg();
      }
      return arg;
    });
    (useSelector as Mock).mockReturnValue({ vocabulary });

    Ajax.get = vi.fn().mockResolvedValue(null);

    vi.clearAllMocks();
  });

  it("Disables Remove button when a vocabulary relation exists", async () => {
    (getVocabularyRelations as Mock).mockResolvedValue([rdfStatement]);
    await render();

    expect(mocks.dialogProps["confirmDisabled"]).toBeTruthy();
  });

  it("Disables Remove button when a vocabulary term relation exists", async () => {
    (getVocabularyTermsRelations as Mock).mockResolvedValue([rdfStatement]);
    await render();

    expect(mocks.dialogProps["confirmDisabled"]).toBeTruthy();
  });

  it("Disables Remove button when a vocabulary and a term relation exists", async () => {
    (getVocabularyRelations as Mock).mockResolvedValue([rdfStatement]);
    (getVocabularyTermsRelations as Mock).mockResolvedValue([rdfStatement]);
    await render();

    expect(mocks.dialogProps["confirmDisabled"]).toBeTruthy();
  });

  it("Disables Remove button when no relation exists and vocabulary is not empty", async () => {
    await render();

    expect(mocks.dialogProps["confirmDisabled"]).toBeTruthy();
  });

  it("Enables Remove button when no relation exists and vocabulary is empty", async () => {
    vocabulary.termCount = 0;
    await render();

    expect(mocks.dialogProps["confirmDisabled"]).toBeFalsy();
  });

  it("Hides input for vocabulary name when a vocabulary relation exists", async () => {
    (getVocabularyRelations as Mock).mockResolvedValue([rdfStatement]);
    const { container } = await render();

    expect(container.querySelector("input")).toBeNull();
  });

  it("Hides input for vocabulary name when a term relation exists", async () => {
    (getVocabularyTermsRelations as Mock).mockResolvedValue([rdfStatement]);
    const { container } = await render();

    expect(container.querySelector("input")).toBeNull();
  });
  it("Hides input for vocabulary name when a vocabulary and a term relation exists", async () => {
    (getVocabularyRelations as Mock).mockResolvedValue([rdfStatement]);
    (getVocabularyTermsRelations as Mock).mockResolvedValue([rdfStatement]);
    const { container } = await render();

    expect(container.querySelector("input")).toBeNull();
  });
  it("Hides input for vocabulary name when a vocabulary is empty", async () => {
    vocabulary.termCount = 0;
    const { container } = await render();

    expect(container.querySelector("input")).toBeNull();
  });

  it("Shows input for vocabulary name when no relation exists and vocabulary is not empty", async () => {
    const { container } = await render();

    expect(container.querySelector("input")).not.toBeNull();
  });

  it("Disables submit button when input is empty", async () => {
    const { container } = await render();

    const input = () => container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input(), { target: { value: "" } });

    expect(input().value).toEqual("");
    expect(mocks.dialogProps.confirmDisabled).toBeTruthy();
  });

  it("Disables submit button when input has invalid vocabulary name", async () => {
    const { container } = await render();
    let invalidValue = vocabulary.getLabel(locale) + "invalid";

    const input = () => container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input(), { target: { value: invalidValue } });

    expect(input().value).toEqual(invalidValue);
    expect(mocks.dialogProps.confirmDisabled).toBeTruthy();
  });

  it("Enables submit button when input has valid vocabulary name", async () => {
    const { container } = await render();

    const input = () => container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input(), {
      target: { value: vocabulary.getLabel(locale) },
    });

    expect(input().value).toEqual(vocabulary.getLabel(locale));
    expect(mocks.dialogProps.confirmDisabled).toBeFalsy();
  });

  async function render() {
    const result = renderWithIntl(
      <MemoryRouter>
        <RemoveVocabularyDialog
          show={true}
          onCancel={onCancel}
          onSubmit={onSubmit}
          vocabulary={vocabulary}
        />
      </MemoryRouter>
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(mocks.dialogProps.show).toBeTruthy();
    expect(getVocabularyRelations).toHaveBeenCalled();
    expect(getVocabularyTermsRelations).toHaveBeenCalled();
    return result;
  }
});
