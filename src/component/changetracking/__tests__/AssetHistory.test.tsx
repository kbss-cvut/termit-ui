import Generator from "../../../__tests__/environment/Generator";
import { AssetHistory } from "../AssetHistory";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import {
  flushPromises,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import { act } from "react-dom/test-utils";
import { Table } from "reactstrap";
import PersistRecord from "../../../model/changetracking/PersistRecord";
import VocabularyUtils from "../../../util/VocabularyUtils";
import * as Redux from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import * as AsyncActions from "../../../action/AsyncActions";
import type { Mock } from "vitest";

vi.mock("../../misc/AssetLabel", () => ({ default: () => <span>Asset</span> }));
vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useDispatch: vi.fn(),
  };
});

describe("AssetHistory", () => {
  let mockDispatch: ThunkDispatch;

  beforeEach(() => {
    mockDispatch = vi.fn();
    vi.spyOn(Redux, "useDispatch").mockReturnValue(mockDispatch);
    vi.spyOn(AsyncActions, "loadHistory");
    vi.useFakeTimers();
  });

  it("loads asset history on mount", async () => {
    const asset = Generator.generateTerm();
    (mockDispatch as Mock).mockResolvedValue([]);
    mountWithIntl(<AssetHistory asset={asset} {...intlFunctions()} />);
    await act(async () => {
      await flushPromises();
      vi.runAllTimers();
    });
    expect(AsyncActions.loadHistory).toHaveBeenCalledWith(
      asset,
      expect.anything()
    );
  });

  it("renders table with history records when they are available", async () => {
    const asset = Generator.generateTerm();
    (mockDispatch as Mock).mockResolvedValue([
      new PersistRecord({
        iri: Generator.generateUri(),
        timestamp: new Date().toISOString(),
        author: Generator.generateUser(),
        changedEntity: { iri: asset.iri },
        types: [VocabularyUtils.PERSIST_EVENT],
      }),
    ]);
    const wrapper = mountWithIntl(
      <AssetHistory asset={asset} {...intlFunctions()} />
    );
    await act(async () => {
      await flushPromises();
      vi.runAllTimers();
    });
    wrapper.update();
    expect(wrapper.exists(Table)).toBeTruthy();
  });
});
