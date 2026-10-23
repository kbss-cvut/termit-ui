import { RdfsResourceData } from "../../../model/RdfsResource";
import CreatePropertyForm from "../CreatePropertyForm";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { fireEvent } from "@testing-library/react";
import type { Mock } from "vitest";

describe("CreatePropertyForm", () => {
  let onCreate: (data: RdfsResourceData) => void;
  let toggleModal: () => void;

  beforeEach(() => {
    onCreate = vi.fn();
    toggleModal = vi.fn();
    mockUseI18n();
  });

  function input<T extends HTMLElement>(name: string): T {
    return document.querySelector(`[name='${name}']`) as T;
  }

  function submitButton(): HTMLElement {
    return document.querySelector(
      "button#create-property-submit"
    ) as HTMLElement;
  }

  function renderForm(languages: string[], language: string) {
    return renderWithIntl(
      <CreatePropertyForm
        onOptionCreate={onCreate}
        toggleModal={toggleModal}
        languages={languages}
        language={language}
      />
    );
  }

  it("adds rdf:Property to types on create", () => {
    renderForm(["en"], "en");
    fireEvent.change(input<HTMLInputElement>("iri"), {
      target: { value: Generator.generateUri() },
    });
    fireEvent.change(input<HTMLInputElement>("label"), {
      target: { value: "Test" },
    });
    fireEvent.click(submitButton());
    expect(onCreate).toHaveBeenCalled();
    const data: RdfsResourceData = (onCreate as Mock).mock.calls[0][0];
    expect(data.types).toBeDefined();
    expect(data.types!.indexOf(VocabularyUtils.RDF_PROPERTY)).not.toEqual(-1);
  });

  it("wont send label and comment as empty strings when they are blank", () => {
    const languages = ["en", "cs"];
    const language = "en";
    renderForm(languages, language);
    const SPACE_CHARACTER = " ";
    const iri = Generator.generateUri();

    fireEvent.change(input<HTMLInputElement>("iri"), {
      target: { value: iri },
    });
    fireEvent.change(input<HTMLInputElement>("label"), {
      target: { value: SPACE_CHARACTER },
    });
    fireEvent.change(input<HTMLTextAreaElement>("comment"), {
      target: { value: SPACE_CHARACTER },
    });

    fireEvent.click(submitButton());
    expect(onCreate).toHaveBeenCalledWith({
      iri,
      label: undefined,
      comment: undefined,
      types: [VocabularyUtils.RDF_PROPERTY],
    });
  });
});
