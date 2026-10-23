import Generator from "../../../__tests__/environment/Generator";
import UnmappedProperties from "../UnmappedProperties";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import Utils from "../../../util/Utils";
import { screen, within } from "@testing-library/react";

vi.mock("../../misc/AssetLabel", () => ({ default: () => <span>Asset</span> }));

describe("UnmappedProperties", () => {
  beforeEach(() => {
    mockUseI18n();
  });

  it("renders literal value for a property", () => {
    const properties = new Map([[Generator.generateUri(), ["test"]]]);
    renderWithIntl(<UnmappedProperties properties={properties} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("test");
    expect(within(items[0]).queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders multiple literal values for a property", () => {
    const properties = new Map([[Generator.generateUri(), ["test", "test2"]]]);
    renderWithIntl(<UnmappedProperties properties={properties} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("test");
    expect(items[1]).toHaveTextContent("test2");
    expect(within(items[0]).queryByRole("link")).not.toBeInTheDocument();
    expect(within(items[1]).queryByRole("link")).not.toBeInTheDocument();
  });

  it("handles object value for a property", () => {
    const v = Generator.generateUri();
    const properties = new Map([[Generator.generateUri(), [{ iri: v }]]]);
    renderWithIntl(<UnmappedProperties properties={properties} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    const link = within(items[0]).getByRole("link");
    expect(link).toHaveAttribute("href", v);
    expect(items[0]).toHaveTextContent(v);
  });

  it("renders multiple property values sorted lexicographically", () => {
    const values = ["z", "a", "j", "i", "c"];
    const sortedValues = [...values];
    sortedValues.sort(Utils.localeComparator);
    const properties = new Map([[Generator.generateUri(), values]]);
    renderWithIntl(<UnmappedProperties properties={properties} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(values.length);
    for (let i = 0; i < sortedValues.length; i++) {
      expect(items[i]).toHaveTextContent(sortedValues[i]);
      expect(within(items[i]).queryByRole("link")).not.toBeInTheDocument();
    }
  });
});
