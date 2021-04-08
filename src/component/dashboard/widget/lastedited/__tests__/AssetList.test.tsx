import * as React from "react";
import { mountWithIntl } from "../../../../../__tests__/environment/Environment";
import en from "../../../../../i18n/en";
import Generator from "../../../../../__tests__/environment/Generator";
import { Link, MemoryRouter } from "react-router-dom";
import VocabularyUtils from "../../../../../util/VocabularyUtils";
import { AssetList } from "../AssetList";
import User from "../../../../../model/User";
import { intlFunctions } from "../../../../../__tests__/environment/IntlUtil";
import { Label } from "reactstrap";
import RecentlyModifiedAsset from "../../../../../model/RecentlyModifiedAsset";

describe("AssetList", () => {
  let user: User;

  beforeEach(() => {
    user = Generator.generateUser();
  });

  it("does not render info message during loading", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <AssetList
          user={user}
          assets={[]}
          loading={true}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    const info = wrapper.find(".italics");
    expect(info.exists()).toBeFalsy();
  });

  it("renders info message when no assets were found", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <AssetList
          user={user}
          assets={[]}
          loading={false}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    const info = wrapper.find(".italics");
    expect(info.exists()).toBeTruthy();
    expect(info.text()).toEqual(
      en.messages["dashboard.widget.assetList.empty"]
    );
  });

  it("renders downloaded assets", () => {
    const assets = [
      new RecentlyModifiedAsset({
        iri: Generator.generateUri(),
        label: "Term",
        types: [VocabularyUtils.TERM],
        vocabulary: { iri: Generator.generateUri() },
        editor: Generator.generateUser(),
        modified: Date.now(),
      }),
      new RecentlyModifiedAsset({
        iri: Generator.generateUri(),
        label: "Vocabulary",
        types: [VocabularyUtils.VOCABULARY],
        editor: Generator.generateUser(),
        modified: Date.now(),
      }),
    ];
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <AssetList
          user={user}
          assets={assets}
          loading={false}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    return Promise.resolve().then(() => {
      wrapper.update();
      const links = wrapper.find(Link);
      expect(links.length).toEqual(2);
      expect(links.at(0).text()).toEqual(assets[0].label);
      expect(links.at(1).text()).toEqual(assets[1].label);
    });
  });

  const renderTermInList = (author: User, containedString: string) => {
    const assets = [
      new RecentlyModifiedAsset({
        iri: Generator.generateUri(),
        label: "Term",
        types: [VocabularyUtils.TERM],
        vocabulary: { iri: Generator.generateUri() },
        editor: author,
        modified: Date.now(),
      }),
    ];
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <AssetList
          user={user}
          assets={assets}
          loading={false}
          {...intlFunctions()}
        />
      </MemoryRouter>
    );
    return Promise.resolve().then(() => {
      wrapper.update();
      const labels = wrapper.find(Label);
      expect(labels.length).toEqual(1);
      const label = labels.at(0).text();
      expect(label).toContain(containedString);
    });
  };

  it("renders an asset with 'You' if the author is the currently logged user", () => {
    renderTermInList(user, "You");
  });

  it("renders an asset with user name if the author is not the currently logged user", () => {
    const author = Generator.generateUser();
    renderTermInList(author, author.fullName);
  });
});
