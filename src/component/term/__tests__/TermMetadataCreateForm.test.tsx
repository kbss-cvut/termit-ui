import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
import { TermMetadataCreateForm } from "../TermMetadataCreateForm";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import Ajax from "../../../util/Ajax";
import VocabularyUtils from "../../../util/VocabularyUtils";
import AssetFactory from "../../../util/AssetFactory";
import {
  mountWithIntl,
  promiseDelay,
} from "../../../__tests__/environment/Environment";
import CustomInput from "../../misc/CustomInput";
import {
  getLocalized,
  langString,
  pluralLangString,
} from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import StringListEdit from "../../misc/StringListEdit";

jest.mock("../TermAssignments");
jest.mock("../ParentTermSelector");
jest.mock("../../misc/AssetLabel");
jest.mock("../TermTypesEdit");

jest.mock("../../../util/Ajax", () => {
  const originalModule = jest.requireActual("../../../util/Ajax");
  return {
    ...originalModule,
    default: jest.fn(),
  };
});

describe("TermMetadataCreateForm", () => {
  const vocabularyIri = Generator.generateUri();

  let onChange: (change: object, callback?: () => void) => void;

  beforeEach(() => {
    onChange = jest.fn();
    Ajax.head = jest.fn().mockResolvedValue({});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("generates identifier on mount if a valid label is provided", () => {
    Ajax.post = jest.fn().mockResolvedValue(Generator.generateUri());
    const termData = { label: langString("test label") };
    shallow<TermMetadataCreateForm>(
      <TermMetadataCreateForm
        onChange={onChange}
        termData={termData}
        language={Constants.DEFAULT_LANGUAGE}
        labelExist={{}}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    expect(Ajax.post).toHaveBeenCalled();
    const config = (Ajax.post as jest.Mock).mock.calls[0][1];
    expect(config.getParams().name).toEqual(getLocalized(termData.label));
    expect(config.getParams().contextIri).toEqual(
      VocabularyUtils.create(vocabularyIri)
    );
    expect(config.getParams().assetType).toEqual("TERM");
  });

  it("generates identifier on label change for non-empty label", () => {
    Ajax.post = jest.fn().mockResolvedValue(Generator.generateUri());
    const wrapper = mountWithIntl(
      <TermMetadataCreateForm
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        labelExist={{}}
        termData={AssetFactory.createEmptyTermData()}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    const labelInput = wrapper.find('input[name="create-term-label"]');
    (labelInput.getDOMNode() as HTMLInputElement).value = "a";
    labelInput.simulate("change", labelInput);
    expect(Ajax.post).toHaveBeenCalled();
    const idCall = (Ajax.post as jest.Mock).mock.calls.find((c: any[]) =>
      c[0].endsWith("/identifiers")
    );
    expect(idCall).toBeDefined();
    expect(idCall[1].getParams().name).toEqual("a");
  });

  it("handles possible race condition when generating identifier multiple times", () => {
    const firstIri = Generator.generateUri();
    const secondIri = Generator.generateUri();
    Ajax.post = jest
      .fn()
      .mockImplementationOnce(() => {
        return promiseDelay(200, { data: firstIri });
      })
      .mockImplementationOnce(() => Promise.resolve({ data: secondIri }));
    const wrapper = mountWithIntl(
      <TermMetadataCreateForm
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        labelExist={{}}
        termData={AssetFactory.createEmptyTermData()}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    const labelInput = wrapper.find('input[name="create-term-label"]');
    (labelInput.getDOMNode() as HTMLInputElement).value = "a";
    labelInput.simulate("change", labelInput);
    jest.advanceTimersByTime(100);
    (labelInput.getDOMNode() as HTMLInputElement).value = "ab";
    labelInput.simulate("change", labelInput);
    jest.advanceTimersByTime(200);
    return Promise.resolve().then(() => {
      wrapper.update();
      expect(Ajax.post).toHaveBeenCalledTimes(2);
      const changesCalls = (onChange as jest.Mock).mock.calls;
      changesCalls.forEach((call) => {
        expect(call[0].iri).not.toEqual(firstIri);
      });
    });
  });

  it("correctly passes selected parent terms to onChange handler", () => {
    const wrapper = shallow<TermMetadataCreateForm>(
      <TermMetadataCreateForm
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        labelExist={{}}
        termData={AssetFactory.createEmptyTermData()}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    const parents = [Generator.generateTerm()];
    wrapper.instance().onParentSelect(parents);
    expect(onChange).toHaveBeenCalledWith({ parentTerms: parents });
  });

  it("checks for label uniqueness in vocabulary on label change", () => {
    const wrapper = shallow<TermMetadataCreateForm>(
      <TermMetadataCreateForm
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        labelExist={{}}
        termData={AssetFactory.createEmptyTermData()}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    const mock = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ data: "" }));
    Ajax.post = mock;
    const newLabel = "New label";
    wrapper
      .find(CustomInput)
      .findWhere((ci) => ci.prop("name") === "create-term-label")
      .simulate("change", {
        currentTarget: {
          name: "create-term-label",
          value: newLabel,
        },
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
    const wrapper = shallow<TermMetadataCreateForm>(
      <TermMetadataCreateForm
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        labelExist={{}}
        termData={AssetFactory.createEmptyTermData()}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(true));
    wrapper
      .find(CustomInput)
      .findWhere((ci) => ci.prop("name") === "create-term-label")
      .simulate("change", {
        currentTarget: {
          name: "create-term-label",
          value: "",
        },
      });
    return Promise.resolve().then(() => {
      // Label check, identifier generation
      expect(Ajax.get).not.toHaveBeenCalled();
    });
  });

  it("passes existing label value in selected language to label edit input", () => {
    Ajax.post = jest.fn().mockResolvedValue(Generator.generateUri());
    const termData = AssetFactory.createEmptyTermData();
    termData.label = { en: "Building", cs: "Budova" };
    const wrapper = shallow<TermMetadataCreateForm>(
      <TermMetadataCreateForm
        onChange={onChange}
        language={"en"}
        labelExist={{}}
        termData={termData}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    const labelInput = wrapper
      .find(CustomInput)
      .findWhere((ci) => ci.prop("name") === "create-term-label");
    expect(labelInput.prop("value")).toEqual(termData.label.en);
  });

  it("passes altLabel and hiddenLabel values in selected language to string list edit", () => {
    const termData = AssetFactory.createEmptyTermData();
    termData.altLabels = {
      en: ["building", "construction"],
      cs: ["budova", "stavba"],
    };
    termData.hiddenLabels = { en: ["shack"], cs: ["barák", "dům"] };
    const wrapper = shallow<TermMetadataCreateForm>(
      <TermMetadataCreateForm
        onChange={onChange}
        language={"cs"}
        labelExist={{}}
        termData={termData}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    const stringListEdits = wrapper.find(StringListEdit);
    expect(stringListEdits.at(0).prop("list")).toEqual(termData.altLabels.cs);
    expect(stringListEdits.at(1).prop("list")).toEqual(
      termData.hiddenLabels.cs
    );
  });

  it("maps list of string alt labels to multilingual strings with selected language", () => {
    const wrapper = shallow<TermMetadataCreateForm>(
      <TermMetadataCreateForm
        onChange={onChange}
        language={"cs"}
        labelExist={{}}
        termData={AssetFactory.createEmptyTermData("cs")}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    const list = ["budova", "stavba"];
    wrapper.instance().onAltLabelsChange(list);
    expect(onChange).toHaveBeenCalledWith({
      altLabels: pluralLangString(list, "cs"),
    });
  });

  it("maps list of string hidden labels to multilingual strings with selected language", () => {
    const wrapper = shallow<TermMetadataCreateForm>(
      <TermMetadataCreateForm
        onChange={onChange}
        language={"de"}
        labelExist={{}}
        termData={AssetFactory.createEmptyTermData("de")}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    const list = ["bau", "gebäude"];
    wrapper.instance().onHiddenLabelsChange(list);
    expect(onChange).toHaveBeenCalledWith({
      hiddenLabels: pluralLangString(list, "de"),
    });
  });

  it("merges existing label value in different language with newly set value in selected language", () => {
    Ajax.post = jest.fn().mockResolvedValue(Generator.generateUri());
    const termData = AssetFactory.createEmptyTermData();
    const enLabel = "Building";
    const csLabel = "Budova";
    termData.label = { en: enLabel };
    const wrapper = shallow<TermMetadataCreateForm>(
      <TermMetadataCreateForm
        onChange={onChange}
        language="cs"
        termData={termData}
        labelExist={{}}
        vocabularyIri={vocabularyIri}
        {...intlFunctions()}
      />
    );
    const labelInput = wrapper
      .find(CustomInput)
      .findWhere((ci) => ci.prop("name") === "create-term-label");
    labelInput.simulate("change", {
      currentTarget: {
        value: csLabel,
      },
    });
    wrapper.update();
    expect(onChange).toHaveBeenCalledWith({
      label: { en: enLabel, cs: csLabel },
      labelExist: { cs: false },
    });
  });
});
