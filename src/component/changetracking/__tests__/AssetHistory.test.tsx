import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import Asset from "../../../model/Asset";
import ChangeRecord from "../../../model/changetracking/ChangeRecord";
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

jest.mock("../../misc/AssetLabel", () => () => <label>Asset</label>);

describe("AssetHistory", () => {
  let loadHistory: (asset: Asset) => Promise<ChangeRecord[]>;

  beforeEach(() => {
    loadHistory = jest.fn().mockResolvedValue([]);
  });

  it("loads asset history on mount", async () => {
    const asset = Generator.generateTerm();
    mountWithIntl(
      <AssetHistory
        asset={asset}
        loadHistory={loadHistory}
        {...intlFunctions()}
      />
    );
    await act(async () => {
      await flushPromises();
    });
    expect(loadHistory).toHaveBeenCalledWith(asset);
  });

  it("renders table with history records when they are available", async () => {
    const asset = Generator.generateTerm();
    loadHistory = jest.fn().mockResolvedValue([
      new PersistRecord({
        iri: Generator.generateUri(),
        timestamp: Date.now(),
        author: Generator.generateUser(),
        changedEntity: { iri: asset.iri },
        types: [VocabularyUtils.PERSIST_EVENT],
      }),
    ]);
    const wrapper = mountWithIntl(
      <AssetHistory
        asset={asset}
        loadHistory={loadHistory}
        {...intlFunctions()}
      />
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(wrapper.exists(Table)).toBeTruthy();
  });

  it("shows notice about empty history when no records are found", async () => {
    const asset = Generator.generateTerm();
    const wrapper = mountWithIntl(
      <AssetHistory
        asset={asset}
        loadHistory={loadHistory}
        {...intlFunctions()}
      />
    );
    await act(async () => {
      await flushPromises();
    });
    wrapper.update();
    expect(wrapper.exists("#history-empty-notice")).toBeTruthy();
  });
});
