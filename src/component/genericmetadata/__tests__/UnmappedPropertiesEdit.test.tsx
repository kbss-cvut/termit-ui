import Generator from "../../../__tests__/environment/Generator";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import UnmappedPropertiesEdit from "../UnmappedPropertiesEdit";
import { i18n, mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import RdfsResource from "../../../model/RdfsResource";
import Utils from "../../../util/Utils";
import { langString } from "../../../model/MultilingualString";
import { PropertyValuesType } from "../../../model/WithUnmappedProperties";
import Constants from "../../../util/Constants";
import * as Redux from "react-redux";
import * as AsyncActions from "../../../action/AsyncActions";
import { act, fireEvent, screen } from "@testing-library/react";

let treeSelectOnChange: ((value: any) => void) | undefined;

vi.mock("../../misc/AssetLabel", () => ({ default: () => <span>Asset</span> }));
vi.mock("intelligent-tree-select", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    IntelligentTreeSelect: (props: any) => {
      treeSelectOnChange = props.onChange;
      return <div data-testid="property-select" />;
    },
  };
});
vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

describe("UnmappedPropertiesEdit", () => {
  let onChange: (update: Map<string, PropertyValuesType>) => void;

  beforeEach(() => {
    onChange = vi.fn();
    treeSelectOnChange = undefined;
    vi.spyOn(Redux, "useSelector").mockReturnValue([
      new RdfsResource({
        iri: Generator.generateUri(),
        label: langString("Known unmapped property"),
      }),
    ]);
    const mockDispatch = vi.fn().mockResolvedValue({});
    vi.spyOn(Redux, "useDispatch").mockReturnValue(mockDispatch);
    mockUseI18n();
  });

  it("renders existing properties", () => {
    const property = Generator.generateUri();
    const existing = new Map([[property, ["test"]]]);
    render(existing);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent(existing.get(property)![0]);
  });

  function render(existing: Map<string, PropertyValuesType>) {
    return renderWithIntl(
      <UnmappedPropertiesEdit
        assetType="term"
        properties={existing}
        onChange={onChange}
        languages={["en", "cs"]}
        language={Constants.DEFAULT_LANGUAGE}
      />
    );
  }

  function selectProperty(property: string) {
    act(() => {
      treeSelectOnChange!(
        new RdfsResource({
          iri: property,
          label: langString("Property"),
        })
      );
    });
  }

  function valueInput(): HTMLInputElement {
    return document.querySelector('input[name="value"]') as HTMLInputElement;
  }

  function addButton(): HTMLElement {
    return screen.getByTitle(i18n("properties.edit.add.title"));
  }

  function removeButtons(): HTMLElement[] {
    return screen.getAllByTitle(i18n("properties.edit.remove"));
  }

  it("removes prop value when delete button is clicked", () => {
    const property = Generator.generateUri();
    const existing = new Map([[property, ["test1", "test2"]]]);
    render(existing);

    const buttons = removeButtons();
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[0]);
    expect(onChange).toHaveBeenCalledWith(new Map([[property, ["test2"]]]));
  });

  it("removes prop value on delete button click when it is an object with identifier", () => {
    const property = Generator.generateUri();
    const existing = new Map([
      [
        property,
        [{ iri: "http://example.com/one" }, { iri: "http://example.com/two" }],
      ],
    ]);
    render(existing);

    const buttons = removeButtons();
    expect(buttons).toHaveLength(2);
    fireEvent.click(buttons[1]);
    expect(onChange).toHaveBeenCalledWith(
      new Map([[property, [{ iri: "http://example.com/one" }]]])
    );
  });

  it("removes property completely when only value is deleted", () => {
    const property = Generator.generateUri();
    const existing = new Map([[property, ["test1"]]]);
    render(existing);

    const buttons = removeButtons();
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    expect(onChange).toHaveBeenCalledWith(new Map());
  });

  it("adds new property with value when inputs are filled in and add button is clicked", () => {
    render(new Map());
    const property = Generator.generateUri();
    const value = "test";
    selectProperty(property);
    fireEvent.change(valueInput(), { target: { value } });
    fireEvent.click(addButton());
    expect(onChange).toHaveBeenCalledWith(new Map([[property, [value]]]));
  });

  it("adds existing property value when inputs are filled in and add button is clicked", () => {
    const property = Generator.generateUri();
    const existing = new Map([[property, ["test"]]]);
    render(existing);
    const value = "test2";
    selectProperty(property);
    fireEvent.change(valueInput(), { target: { value } });
    fireEvent.click(addButton());
    expect(onChange).toHaveBeenCalledWith(
      new Map([[property, ["test", "test2"]]])
    );
  });

  it("clears state on add", () => {
    render(new Map());
    const property = Generator.generateUri();
    const value = "test";
    selectProperty(property);
    fireEvent.change(valueInput(), { target: { value } });
    fireEvent.click(addButton());
    expect(valueInput()).toHaveValue("");
  });

  it("keeps add button disabled when either input is empty", () => {
    render(new Map());
    expect(addButton()).toBeDisabled();
    selectProperty(Generator.generateUri());
    expect(addButton()).toBeDisabled();
    fireEvent.change(valueInput(), { target: { value: "b" } });
    expect(addButton()).not.toBeDisabled();
  });

  it("adds property value on Enter in the value field", () => {
    render(new Map());
    const property = Generator.generateUri();
    const value = "test";
    selectProperty(property);
    fireEvent.change(valueInput(), { target: { value } });
    fireEvent.keyPress(valueInput(), {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("loads known properties on mount", () => {
    vi.spyOn(AsyncActions, "getProperties");
    render(new Map());
    expect(AsyncActions.getProperties).toHaveBeenCalled();
  });

  it("renders existing property values sorted lexicographically", () => {
    const property = Generator.generateUri();
    const values = ["m", "a", "s", "t", "E", "r"];
    const sortedValues = [...values];
    sortedValues.sort(Utils.localeComparator);
    const existing = new Map([[property, values]]);
    render(existing);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(sortedValues.length);
    for (let i = 0; i < sortedValues.length; i++) {
      expect(items[i]).toHaveTextContent(sortedValues[i]);
    }
  });
});
