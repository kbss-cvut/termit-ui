import Generator from "../../../__tests__/environment/Generator";
import * as redux from "react-redux";
import { mountWithIntl } from "../../../__tests__/environment/Environment";
import AccessLevel from "../../../model/acl/AccessLevel";
import BadgeButton from "../../misc/BadgeButton";
import JsonLdUtils from "../../../util/JsonLdUtils";
import RdfsResource, { CONTEXT } from "../../../model/RdfsResource";
import Utils from "../../../util/Utils";
import TermState, { TermStateDisplay } from "../TermState";
import { getLocalized } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe("TermStatus", () => {
  it("does not render edit button when user has no editing authority", async () => {
    const states =
      await JsonLdUtils.compactAndResolveReferencesAsArray<RdfsResource>(
        require("../../../rest-mock/states"),
        CONTEXT
      );
    const storeState = Utils.mapArray(states);
    (redux.useSelector as jest.Mock).mockReturnValue(storeState);
    const vocabulary = Generator.generateVocabulary();
    vocabulary.accessLevel = AccessLevel.READ;
    const fakeDispatch = jest.fn().mockResolvedValue({});
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
    const term = Generator.generateTerm(vocabulary.iri);
    term.state = { iri: states[0].iri };
    const wrapper = mountWithIntl(
      <TermState term={term} vocabulary={vocabulary} />
    );
    expect(wrapper.exists(BadgeButton)).toBeFalsy();
  });

  it("maps state IRI to label based on state options stored in Redux store", async () => {
    const states =
      await JsonLdUtils.compactAndResolveReferencesAsArray<RdfsResource>(
        require("../../../rest-mock/states"),
        CONTEXT
      );
    const storeState = Utils.mapArray(states);
    (redux.useSelector as jest.Mock).mockReturnValue(storeState);
    const vocabulary = Generator.generateVocabulary();
    vocabulary.accessLevel = AccessLevel.WRITE;
    const fakeDispatch = jest.fn().mockResolvedValue({});
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
    const term = Generator.generateTerm(vocabulary.iri);
    term.state = { iri: states[1].iri };
    const wrapper = await mountWithIntl(
      <TermState term={term} vocabulary={vocabulary} />
    );
    return Promise.resolve().then(() => {
      const display = wrapper.find(TermStateDisplay);
      expect(display.text()).toContain(
        getLocalized(states[1].label, Constants.DEFAULT_LANGUAGE)
      );
    });
  });
});
