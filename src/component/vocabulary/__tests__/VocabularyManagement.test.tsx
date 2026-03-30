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
import type { Mock } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});
vi.mock("../VocabularyList", () => ({
  default: () => <div>Vocabularies</div>,
}));

describe("VocabularyList", () => {
  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    fakeDispatch = vi.fn().mockResolvedValue({});
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
  });

  it("loads vocabularies on mount", async () => {
    vi.spyOn(AsyncActions, "loadVocabularies");
    (redux.useSelector as Mock).mockReturnValue(Generator.generateUser());
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
    vi.spyOn(AsyncActions, "loadVocabularies");
    const user = Generator.generateUser();
    user.types.push(VocabularyUtils.USER_RESTRICTED);
    (redux.useSelector as Mock).mockReturnValue(user);
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
