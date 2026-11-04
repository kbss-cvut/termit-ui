import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import { TermMetadataCreateForm } from "../TermMetadataCreateForm";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Ajax from "../../../util/Ajax";
import VocabularyUtils from "../../../util/VocabularyUtils";
import AssetFactory from "../../../util/AssetFactory";
import {
  promiseDelay,
  renderWithIntl,
} from "../../../__tests__/environment/Environment";
import {
  getLocalized,
  langString,
  pluralLangString,
} from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import { fireEvent } from "@testing-library/react";
import { Mock, vi } from "vitest";

vi.mock("../ParentTermSelector", () => ({
  default: () => <div>Parent term selector</div>,
}));
vi.mock("../../misc/AssetLabel", () => ({
  default: () => <span>Asset label</span>,
}));
vi.mock("../TermTypesEdit", () => ({
  default: () => <div>Term types edit</div>,
}));
vi.mock("../../misc/HelpIcon", () => ({ default: () => <span>Help</span> }));
vi.mock("../../misc/MultilingualIcon", () => ({
  default: () => <span>Multilingual</span>,
}));
vi.mock("../../misc/ValueListEdit", () => ({
  default: (props: { list?: string[] }) => (
    <div className="string-list-edit" data-list={JSON.stringify(props.list)} />
  ),
}));
vi.mock(import("../../../util/Ajax"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      head: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
    } as any,
  };
});

describe("TermMetadataCreateForm", () => {
  const vocabularyIri = Generator.generateUri();

  let onChange: (change: object, callback?: () => void) => void;

  beforeEach(() => {
    onChange = vi.fn();
    Ajax.head = vi.fn().mockResolvedValue({});
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderForm(
    props: Partial<React.ComponentProps<typeof TermMetadataCreateForm>> = {},
    ref: React.RefObject<TermMetadataCreateForm> = React.createRef()
  ) {
    return renderWithIntl(
      <TermMetadataCreateForm
        ref={ref}
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        labelExist={{}}
        termData={AssetFactory.createEmptyTermData()}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
        {...props}
      />
    );
  }

  function labelInput(container: HTMLElement) {
    return container.querySelector(
      'input[name="create-term-label"]'
    ) as HTMLInputElement;
  }

  it("generates identifier on mount if a valid label is provided", () => {
    Ajax.post = vi.fn().mockResolvedValue(Generator.generateUri());
    const termData = { label: langString("test label") };
    renderForm({ termData });
    expect(Ajax.post).toHaveBeenCalled();
    const config = (Ajax.post as Mock).mock.calls[0][1];
    expect(config.getParams().name).toEqual(getLocalized(termData.label));
    expect(config.getParams().contextIri).toEqual(
      VocabularyUtils.create(vocabularyIri)
    );
    expect(config.getParams().assetType).toEqual("TERM");
  });

  it("generates identifier on label change for non-empty label", () => {
    Ajax.post = vi.fn().mockResolvedValue(Generator.generateUri());
    const { container } = renderForm();
    fireEvent.change(labelInput(container), { target: { value: "a" } });
    expect(Ajax.post).toHaveBeenCalled();
    const idCall = (Ajax.post as Mock).mock.calls.find((c: any[]) =>
      c[0].endsWith("/identifiers")
    );
    expect(idCall).toBeDefined();
    expect(idCall![1].getParams().name).toEqual("a");
  });

  it("handles possible race condition when generating identifier multiple times", () => {
    const firstIri = Generator.generateUri();
    const secondIri = Generator.generateUri();
    Ajax.post = vi
      .fn()
      .mockImplementationOnce(() => {
        return promiseDelay(200, { data: firstIri });
      })
      .mockImplementationOnce(() => Promise.resolve({ data: secondIri }));
    const { container } = renderForm();
    const input = labelInput(container);
    fireEvent.change(input, { target: { value: "a" } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: "ab" } });
    vi.advanceTimersByTime(200);
    return Promise.resolve().then(() => {
      expect(Ajax.post).toHaveBeenCalledTimes(2);
      const changesCalls = (onChange as Mock).mock.calls;
      changesCalls.forEach((call) => {
        expect(call[0].iri).not.toEqual(firstIri);
      });
    });
  });

  it("correctly passes selected parent terms to onChange handler", () => {
    const ref = React.createRef<TermMetadataCreateForm>();
    renderForm({}, ref);
    const parents = [Generator.generateTerm(vocabularyIri)];
    ref.current!.onParentSelect(parents);
    expect(onChange).toHaveBeenCalledWith({
      parentTerms: parents,
    });
  });

  it("checks for label uniqueness in vocabulary on label change", () => {
    const { container } = renderForm();
    const mock = vi
      .fn()
      .mockImplementation(() => Promise.resolve({ data: "" }));
    Ajax.post = mock;
    const newLabel = "New label";
    fireEvent.change(labelInput(container), {
      target: { name: "create-term-label", value: newLabel },
    });
    return Promise.resolve().then(() => {
      // Label check
      expect(Ajax.head).toHaveBeenCalledTimes(1);
      // Identifier generation
      expect(Ajax.post).toHaveBeenCalledTimes(1);
      expect(mock.mock.calls[0][1].getParams().name).toEqual(newLabel);
    });
  });

  it("does not check for label uniqueness for empty label", () => {
    const { container } = renderForm();
    Ajax.get = vi.fn().mockImplementation(() => Promise.resolve(true));
    fireEvent.change(labelInput(container), {
      target: { name: "create-term-label", value: "" },
    });
    return Promise.resolve().then(() => {
      // Label check, identifier generation
      expect(Ajax.get).not.toHaveBeenCalled();
    });
  });

  it("passes existing label value in selected language to label edit input", () => {
    Ajax.post = vi.fn().mockResolvedValue(Generator.generateUri());
    const termData = AssetFactory.createEmptyTermData();
    termData.label = { en: "Building", cs: "Budova" };
    const { container } = renderForm({ termData, language: "en" });
    expect(labelInput(container).value).toEqual(termData.label.en);
  });

  it("passes altLabel and hiddenLabel values in selected language to string list edit", () => {
    const termData = AssetFactory.createEmptyTermData();
    termData.altLabels = {
      en: ["building", "construction"],
      cs: ["budova", "stavba"],
    };
    termData.hiddenLabels = { en: ["shack"], cs: ["barák", "dům"] };
    const { container } = renderForm({ termData, language: "cs" });
    const stringListEdits = container.querySelectorAll(".string-list-edit");
    expect(JSON.parse(stringListEdits[0].getAttribute("data-list")!)).toEqual(
      termData.altLabels.cs
    );
    expect(JSON.parse(stringListEdits[1].getAttribute("data-list")!)).toEqual(
      termData.hiddenLabels.cs
    );
  });

  it("maps list of string alt labels to multilingual strings with selected language", () => {
    const ref = React.createRef<TermMetadataCreateForm>();
    renderForm(
      { language: "cs", termData: AssetFactory.createEmptyTermData("cs") },
      ref
    );
    const list = ["budova", "stavba"];
    ref.current!.onAltLabelsChange(list);
    expect(onChange).toHaveBeenCalledWith({
      altLabels: pluralLangString(list, "cs"),
    });
  });

  it("maps list of string hidden labels to multilingual strings with selected language", () => {
    const ref = React.createRef<TermMetadataCreateForm>();
    renderForm(
      { language: "de", termData: AssetFactory.createEmptyTermData("de") },
      ref
    );
    const list = ["bau", "gebäude"];
    ref.current!.onHiddenLabelsChange(list);
    expect(onChange).toHaveBeenCalledWith({
      hiddenLabels: pluralLangString(list, "de"),
    });
  });

  it("merges existing label value in different language with newly set value in selected language", () => {
    Ajax.post = vi.fn().mockResolvedValue(Generator.generateUri());
    const termData = AssetFactory.createEmptyTermData();
    const enLabel = "Building";
    const csLabel = "Budova";
    termData.label = { en: enLabel };
    const { container } = renderForm({ termData, language: "cs" });
    fireEvent.change(labelInput(container), {
      target: { value: csLabel },
    });
    expect(onChange).toHaveBeenCalledWith({
      label: { en: enLabel, cs: csLabel },
      labelExist: { cs: false },
    });
  });
});
