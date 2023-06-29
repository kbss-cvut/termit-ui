import Term from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import TermTypesEdit from "../TermTypesEdit";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import Generator from "../../../__tests__/environment/Generator";
import { langString } from "../../../model/MultilingualString";
import * as Redux from "react-redux";
import { ThunkDispatch } from "../../../util/Types";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("../../misc/HelpIcon", () => () => <div>Help</div>);

describe("TermTypesEdit", () => {
  let onChange: (types: string[]) => void;
  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    onChange = jest.fn();
    fakeDispatch = jest.fn();
    jest.spyOn(Redux, "useDispatch").mockReturnValue(fakeDispatch);
  });

  it("does not render implicit term type in the selector when no other type is assigned to term", () => {
    const availableTypes = {};
    availableTypes[VocabularyUtils.TERM] = new Term({
      iri: VocabularyUtils.TERM,
      label: langString("Term"),
    });
    jest.spyOn(Redux, "useSelector").mockReturnValue(availableTypes);
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
    jest.spyOn(Redux, "useSelector").mockReturnValue(availableTypes);
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
    jest.spyOn(Redux, "useSelector").mockReturnValue({});
    const wrapper = mountWithIntl(
      <TermTypesEdit termTypes={[VocabularyUtils.TERM]} onChange={onChange} />
    );
    (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)(selected);
    expect(onChange).toHaveBeenCalled();
    const newTypes = (onChange as jest.Mock).mock.calls[0][0];
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
    jest.spyOn(Redux, "useSelector").mockReturnValue(availableTypes);
    const types = [VocabularyUtils.TERM, iri];
    const wrapper = mountWithIntl(
      <TermTypesEdit termTypes={types} onChange={onChange} />
    );
    (wrapper.find(IntelligentTreeSelect).prop("onChange") as any)(null);
    expect(onChange).toHaveBeenCalledWith([VocabularyUtils.TERM]);
  });
});
