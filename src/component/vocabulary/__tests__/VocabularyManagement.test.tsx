import {
  flushPromises,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import { act } from "react-dom/test-utils";
import { VocabularyManagement } from "../VocabularyManagement";
import { MemoryRouter } from "react-router";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import * as redux from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import * as AsyncActions from "../../../action/AsyncActions";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock("../VocabularyList", () => () => <div>Vocabularies</div>);

describe("VocabularyList", () => {
  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    fakeDispatch = jest.fn().mockResolvedValue({});
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
  });

  it("loads vocabularies on mount", async () => {
    jest.spyOn(AsyncActions, "loadVocabularies");
    (redux.useSelector as jest.Mock).mockReturnValue(Generator.generateUser());
    mountWithIntl(
      <MemoryRouter>
        <VocabularyManagement />
      </MemoryRouter>
    );
    await act(async () => {
      await flushPromises();
    });
    expect(AsyncActions.loadVocabularies).toHaveBeenCalled();
  });

  it("does not display create vocabulary button when current user has restricted access", async () => {
    jest.spyOn(AsyncActions, "loadVocabularies");
    const user = Generator.generateUser();
    user.types.push(VocabularyUtils.USER_RESTRICTED);
    (redux.useSelector as jest.Mock).mockReturnValue(user);
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <VocabularyManagement />
      </MemoryRouter>
    );
    await act(async () => {
      await flushPromises();
    });
    expect(wrapper.exists("#vocabularies-create")).toBeFalsy();
  });
});
