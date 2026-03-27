import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import TermTypesEdit from "../TermTypesEdit";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import Generator from "../../../__tests__/environment/Generator";
import { langString } from "../../../model/MultilingualString";
import * as Redux from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import type { Mock } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

vi.mock("../../misc/HelpIcon", () => ({ default: () => <div>Help</div> }));

describe("TermTypesEdit", () => {
  let onChange: (types: string[]) => void;
  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    onChange = vi.fn();
    fakeDispatch = vi.fn();
    vi.spyOn(Redux, "useDispatch").mockReturnValue(fakeDispatch);
  });

  it("does not render implicit term type in the selector when no other type is assigned to term", () => {
    const availableTypes = {};
    availableTypes[VocabularyUtils.TERM] = new Term({
      iri: VocabularyUtils.TERM,
      label: langString("Term"),
    });
    vi.spyOn(Redux, "useSelector").mockReturnValue(availableTypes);
    const types = [VocabularyUtils.TERM];
    const wrapper = mountWithIntl(
      <TermTypesEdit termTypes={types} onChange={onChange} />
    );
    const selector = wrapper.find(IntelligentTreeSelect);
    expect(selector.prop("value")).not.toBeDefined();
  });

  it("does not render implicit term type in the selector when other another type is present as well", () => {
    const iri = Generator.generateUri();
    const availableTypes = {};
    availableTypes[VocabularyUtils.TERM] = new Term({
      iri: VocabularyUtils.TERM,
      label: langString("Term"),
    });
    availableTypes[iri] = new Term({ iri, label: langString("Other type") });
    vi.spyOn(Redux, "useSelector").mockReturnValue(availableTypes);
    const types = [VocabularyUtils.TERM, iri];
    const wrapper = mountWithIntl(
      <TermTypesEdit termTypes={types} onChange={onChange} />
    );
    const selector = wrapper.find(IntelligentTreeSelect);
    expect(selector.prop("value")).toEqual(availableTypes[iri].iri);
  });

  it("invokes onChange handler with selected type and the implicit Term type", () => {
    const selected = new Term({
      iri: Generator.generateUri(),
      label: langString("Selected term"),
    });
    vi.spyOn(Redux, "useSelector").mockReturnValue({});
    const wrapper = mountWithIntl(
      <TermTypesEdit termTypes={[VocabularyUtils.TERM]} onChange={onChange} />
    );
    (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)(selected);
    expect(onChange).toHaveBeenCalled();
    const newTypes = (onChange as Mock).mock.calls[0][0];
    expect(newTypes.length).toEqual(2);
    expect(newTypes.indexOf(selected.iri)).not.toEqual(-1);
    expect(newTypes.indexOf(VocabularyUtils.TERM)).not.toEqual(-1);
  });

  it("invokes onChange handler with implicit Term type only when reset button is clicked", () => {
    const iri = Generator.generateUri();
    const availableTypes = {};
    availableTypes[VocabularyUtils.TERM] = new Term({
      iri: VocabularyUtils.TERM,
      label: langString("Term"),
    });
    availableTypes[iri] = new Term({ iri, label: langString("Other type") });
    vi.spyOn(Redux, "useSelector").mockReturnValue(availableTypes);
    const types = [VocabularyUtils.TERM, iri];
    const wrapper = mountWithIntl(
      <TermTypesEdit termTypes={types} onChange={onChange} />
    );
    (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)(null);
    expect(onChange).toHaveBeenCalledWith([VocabularyUtils.TERM]);
  });
});
