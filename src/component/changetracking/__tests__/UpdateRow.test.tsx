import {
  UpdateRecord,
  UpdateValueType,
} from "../../../model/changetracking/UpdateRecord";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { shallow } from "enzyme";
import { UpdateRow } from "../UpdateRow";
import {
  intlFunctions,
  mockUseI18n,
} from "../../../__tests__/environment/IntlUtil";
import OutgoingLink from "../../misc/OutgoingLink";
import { Label } from "reactstrap";
import Constants from "../../../util/Constants";

describe("UpdateRow", () => {
  beforeEach(() => {
    mockUseI18n();
  });

  it("renders id value as an outgoing link", () => {
    const newValue = Generator.generateUri();
    const record = generateUpdateRecord({ iri: newValue });
    const wrapper = shallow(<UpdateRow record={record} {...intlFunctions()} />);
    const link = wrapper.find(OutgoingLink);
    expect(link.exists()).toBeTruthy();
    expect(link.prop("iri")).toEqual(newValue);
  });

  it("renders id value as outgoing link and literal as literal in combined value", () => {
    const idValue = Generator.generateUri();
    const literalValue = "117";
    const record = new UpdateRecord({
      iri: Generator.generateUri(),
      timestamp: new Date().toISOString(),
      author: Generator.generateUser(),
      changedEntity: { iri: Generator.generateUri() },
      changedAttribute: { iri: "http://purl.org/dc/terms/source" },
      originalValue: [{ iri: idValue }, literalValue],
      types: [VocabularyUtils.UPDATE_EVENT],
    });
    const wrapper = shallow(<UpdateRow record={record} {...intlFunctions()} />);
    const link = wrapper.find(OutgoingLink);
    expect(link.exists()).toBeTruthy();
    expect(link.prop("iri")).toEqual(idValue);
    const label = wrapper.find(Label);
    expect(label.exists()).toBeTruthy();
    expect(label.children().text()).toEqual(literalValue);
  });

  it("renders lang string value change", () => {
    const newValue = {
      "@language": Constants.DEFAULT_LANGUAGE,
      "@value": "Test value",
    };
    const record = generateUpdateRecord(newValue);
    const wrapper = shallow(<UpdateRow record={record} {...intlFunctions()} />);
    const label = wrapper.find(Label);
    expect(label.exists()).toBeTruthy();
    expect(label.childAt(1).childAt(0).text()).toContain(
      Constants.DEFAULT_LANGUAGE
    );
    expect(label.childAt(0).text()).toContain(newValue["@value"]);
  });

  function generateUpdateRecord(newValue: UpdateValueType) {
    return new UpdateRecord({
      iri: Generator.generateUri(),
      timestamp: new Date().toISOString(),
      author: Generator.generateUser(),
      changedEntity: { iri: Generator.generateUri() },
      changedAttribute: { iri: VocabularyUtils.SKOS_PREF_LABEL },
      newValue,
      types: [VocabularyUtils.UPDATE_EVENT],
    });
  }

  it("renders multilingual string value change", () => {
    const newValue = [
      {
        "@language": Constants.DEFAULT_LANGUAGE,
        "@value": "Test value",
      },
      {
        "@language": "cs",
        "@value": "Testovaci hodnota",
      },
    ];
    const record = generateUpdateRecord(newValue);
    const wrapper = shallow(<UpdateRow record={record} {...intlFunctions()} />);
    const label = wrapper.find(Label);
    expect(label.exists()).toBeTruthy();
    expect(label.length).toEqual(newValue.length);
    newValue.forEach((nv) => {
      const matching = label.filterWhere(
        (lab) =>
          lab.childAt(1).childAt(0).text().indexOf(nv["@language"]) !== -1
      );
      expect(matching.exists()).toBeTruthy();
      expect(matching.childAt(0).text()).toContain(nv["@value"]);
    });
  });

  it("handles combination of tagged and language-less values in change", () => {
    const newValue = [
      {
        "@language": Constants.DEFAULT_LANGUAGE,
        "@value": "Test value",
      },
      "test",
    ];
    const record = generateUpdateRecord(newValue);
    const wrapper = shallow(<UpdateRow record={record} {...intlFunctions()} />);
    const label = wrapper.find(Label);
    expect(label.exists()).toBeTruthy();
    expect(label.length).toEqual(newValue.length);
  });
});
