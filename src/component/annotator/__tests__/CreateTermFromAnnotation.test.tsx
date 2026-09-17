import * as React from "react";
import { render, act } from "@testing-library/react";
import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { CreateTermFromAnnotation } from "../CreateTermFromAnnotation";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import type { Mock } from "vitest";

vi.mock("../../term/TermMetadataCreateForm", () => ({
  default: () => <div data-testid="term-metadata-create-form" />,
}));
vi.mock("../../multilingual/EditLanguageSelector", () => ({
  default: () => <div data-testid="edit-language-selector" />,
}));

describe("CreateTermFromAnnotation", () => {
  const vocabularyIri = VocabularyUtils.create(
    VocabularyUtils.NS_TERMIT + "test-vocabulary"
  );

  let onClose: () => void;
  let onMinimize: () => void;
  let createTerm: (term: Term) => Promise<any>;
  let onTermCreated: (term: Term) => void;

  let propsFunctions: any;

  beforeEach(() => {
    onClose = vi.fn();
    onMinimize = vi.fn();
    createTerm = vi.fn().mockResolvedValue({});
    onTermCreated = vi.fn();
    propsFunctions = { onClose, onMinimize, createTerm, onTermCreated };
  });

  function renderComponent(): CreateTermFromAnnotation {
    const ref = React.createRef<CreateTermFromAnnotation>();
    render(
      <CreateTermFromAnnotation
        ref={ref}
        show={true}
        vocabularyIri={vocabularyIri}
        vocabularyPrimaryLanguage={Constants.DEFAULT_LANGUAGE}
        {...propsFunctions}
        {...intlFunctions()}
      />
    );
    return ref.current!;
  }

  it("resets state before close", () => {
    const instance = renderComponent();
    act(() => {
      instance.setState({ iri: "http://test", label: langString("test") });
    });
    act(() => {
      instance.onCancel();
    });
    expect(onClose).toHaveBeenCalled();
    expect(instance.state.iri).toEqual("");
    expect(instance.state.label).toEqual(langString(""));
  });

  describe("setLabel", () => {
    it("sets label in state", () => {
      const instance = renderComponent();
      expect(instance.state.label).toEqual(langString(""));
      const label = "Test";
      act(() => {
        instance.setLabel(label);
      });
      expect(instance.state.label).toEqual(
        langString(label, Constants.DEFAULT_LANGUAGE)
      );
    });

    it("removes leading and trailing whitespaces from the specified label", () => {
      const instance = renderComponent();
      expect(instance.state.label).toEqual(langString(""));
      const label = "    Test    \n";
      act(() => {
        instance.setLabel(label);
      });
      expect(instance.state.label).toEqual(
        langString(label.trim(), Constants.DEFAULT_LANGUAGE)
      );
    });
  });

  describe("setDefinition", () => {
    it("sets definition in state", () => {
      const instance = renderComponent();
      expect(instance.state.definition).toEqual(
        langString("", Constants.DEFAULT_LANGUAGE)
      );
      const definition = "Test definition";
      act(() => {
        instance.setDefinition(definition);
      });
      expect(instance.state.definition).toEqual(
        langString(definition, Constants.DEFAULT_LANGUAGE)
      );
    });

    it("removes leading and trailing whitespaces from the specified definition", () => {
      const instance = renderComponent();
      expect(instance.state.definition).toEqual(
        langString("", Constants.DEFAULT_LANGUAGE)
      );
      const definition = "  Test definition \n";
      act(() => {
        instance.setDefinition(definition);
      });
      expect(instance.state.definition).toEqual(
        langString(definition.trim(), Constants.DEFAULT_LANGUAGE)
      );
    });
  });

  it("onSave creates new term from current state and saves it", () => {
    const instance = renderComponent();
    const iri = vocabularyIri + "/term/test-term";
    const label = langString("Test label");
    const sources = ["source.html", "http://onto.fel.cvut.cz"];
    act(() => {
      instance.setState({ iri, label, sources });
    });
    act(() => {
      instance.onSave();
    });
    expect(createTerm).toHaveBeenCalled();
    const term = (createTerm as Mock).mock.calls[0][0];
    expect(term).toBeInstanceOf(Term);
    expect(term.iri).toEqual(iri);
    expect(term.label).toEqual(label);
    expect(term.sources).toEqual(sources);
    expect(term.types).toContain(VocabularyUtils.TERM);
    expect((createTerm as Mock).mock.calls[0][1]).toEqual(vocabularyIri);
  });

  it("invokes close and clears state after successful term creation", async () => {
    const instance = renderComponent();
    act(() => {
      instance.setState({
        iri: vocabularyIri + "/term/test-term",
        label: langString("Test term"),
      });
    });
    await act(async () => {
      await instance.onSave();
    });
    expect(onClose).toHaveBeenCalled();
    expect(instance.state.iri).toEqual("");
    expect(instance.state.label).toEqual(langString(""));
  });

  // Bug #1463
  it("clears also alt labels and hidden labels from state after successful term creation", async () => {
    const instance = renderComponent();
    act(() => {
      instance.setState({
        iri: vocabularyIri + "/term/test-term",
        label: langString("Test term"),
        altLabels: { en: ["test one", "test two"] },
        hiddenLabels: { en: ["hidden one", "hidden two"] },
      });
    });
    await act(async () => {
      await instance.onSave();
    });
    expect(onClose).toHaveBeenCalled();
    expect(instance.state.altLabels).not.toBeDefined();
    expect(instance.state.hiddenLabels).not.toBeDefined();
  });

  it("invokes onTermCreated with the new term after successful term creation", async () => {
    const termIri = vocabularyIri + "/term/test-term";
    const termLabel = langString("Test term");
    const instance = renderComponent();
    act(() => {
      instance.setState({ iri: termIri, label: termLabel });
    });
    await act(async () => {
      await instance.onSave();
    });
    expect(onTermCreated).toHaveBeenCalled();
    const newTerm = (onTermCreated as Mock).mock.calls[0][0];
    expect(newTerm.iri).toEqual(termIri);
    expect(newTerm.label).toEqual(termLabel);
  });
});
