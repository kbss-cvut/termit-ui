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

jest.mock("../../misc/AssetLabel", () => () => <label>Asset</label>);
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

describe("AssetHistory", () => {
  let mockDispatch: ThunkDispatch;

  beforeEach(() => {
    mockDispatch = jest.fn();
    jest.spyOn(Redux, "useDispatch").mockReturnValue(mockDispatch);
    jest.spyOn(AsyncActions, "loadHistory");
  });

  it("loads asset history on mount", async () => {
    const asset = Generator.generateTerm();
    (mockDispatch as jest.Mock).mockResolvedValue([]);
    mountWithIntl(<AssetHistory asset={asset} {...intlFunctions()} />);
    await act(async () => {
      await flushPromises();
    });
    expect(AsyncActions.loadHistory).toHaveBeenCalledWith(asset);
  });

  it("renders table with history records when they are available", async () => {
    const asset = Generator.generateTerm();
    (mockDispatch as jest.Mock).mockResolvedValue([
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
    });
    wrapper.update();
    expect(wrapper.exists(Table)).toBeTruthy();
  });

  it("shows notice about empty history when no records are found", async () => {
    (mockDispatch as jest.Mock).mockResolvedValue([]);
    const asset = Generator.generateTerm();
    const wrapper = mountWithIntl(
      <AssetHistory asset={asset} {...intlFunctions()} />
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(wrapper.exists("#history-empty-notice")).toBeTruthy();
  });
});
