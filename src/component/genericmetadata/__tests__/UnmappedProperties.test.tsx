import Generator from "../../../__tests__/environment/Generator";
import UnmappedProperties from "../UnmappedProperties";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Utils from "../../../util/Utils";
import OutgoingLink from "../../misc/OutgoingLink";

jest.mock("../../misc/AssetLabel", () => () => <span>Asset</span>);

describe("UnmappedProperties", () => {
  beforeEach(() => {
    mockUseI18n();
  });

  it("renders literal value for a property", () => {
    const properties = new Map([[Generator.generateUri(), ["test"]]]);
    const wrapper = mountWithIntl(
      <UnmappedProperties properties={properties} />
    );
    const items = wrapper.find("li");
    expect(items.length).toEqual(1);
    expect(items.get(0).props.children[0]).toEqual("test");
    expect(items.exists(OutgoingLink)).toBeFalsy();
  });

  it("renders multiple literal values for a property", () => {
    const properties = new Map([[Generator.generateUri(), ["test", "test2"]]]);
    const wrapper = mountWithIntl(
      <UnmappedProperties properties={properties} />
    );
    const items = wrapper.find("li");
    expect(items.length).toEqual(2);
    expect(items.get(0).props.children[0]).toEqual("test");
    expect(items.get(1).props.children[0]).toEqual("test2");
    expect(items.exists(OutgoingLink)).toBeFalsy();
  });

  it("handles object value for a property", () => {
    const v = Generator.generateUri();
    const properties = new Map([[Generator.generateUri(), [{ iri: v }]]]);
    const wrapper = mountWithIntl(
      <UnmappedProperties properties={properties} />
    );
    const items = wrapper.find("li");
    expect(items.length).toEqual(1);
    expect(items.exists(OutgoingLink)).toBeTruthy();
    expect(items.get(0).props.children[0].props.label).toEqual(v);
  });

  it("renders multiple property values sorted lexicographically", () => {
    const values = ["z", "a", "j", "i", "c"];
    const sortedValues = [...values];
    sortedValues.sort(Utils.localeComparator);
    const properties = new Map([[Generator.generateUri(), values]]);
    const wrapper = mountWithIntl(
      <UnmappedProperties properties={properties} />
    );
    const items = wrapper.find("li");
    expect(items.exists(OutgoingLink)).toBeFalsy();
    expect(items.length).toEqual(values.length);
    for (let i = 0; i < sortedValues.length; i++) {
      expect(items.get(i).props.children[0]).toEqual(sortedValues[i]);
    }
  });
});
