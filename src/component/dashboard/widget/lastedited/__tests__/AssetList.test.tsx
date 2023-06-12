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
import * as Redux from "react-redux";
import TermLink from "../../../../term/TermLink";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("AssetList", () => {
  let user: User;

  beforeEach(() => {
    user = Generator.generateUser();
  });

  it("does not render info message during loading", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <AssetList assets={null} {...intlFunctions()} />
      </MemoryRouter>
    );
    const info = wrapper.find(".italics");
    expect(info.exists()).toBeFalsy();
  });

  it("renders info message when no assets were found", () => {
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <AssetList assets={[]} {...intlFunctions()} />
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
        modified: new Date().toISOString(),
      }),
      new RecentlyModifiedAsset({
        iri: Generator.generateUri(),
        label: "Vocabulary",
        types: [VocabularyUtils.VOCABULARY],
        editor: Generator.generateUser(),
        modified: new Date().toISOString(),
      }),
    ];
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <AssetList assets={assets} {...intlFunctions()} />
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
        modified: new Date().toISOString(),
      }),
    ];
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <AssetList assets={assets} />
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

  it("renders masked label without link when asset view is forbidden", () => {
    const assets = [
      new RecentlyModifiedAsset({
        iri: Generator.generateUri(),
        label: "Term",
        types: [VocabularyUtils.TERM],
        vocabulary: { iri: Generator.generateUri() },
        editor: user,
        modified: new Date().toISOString(),
      }),
      new RecentlyModifiedAsset({
        iri: Generator.generateUri(),
        label: "*****",
        types: [VocabularyUtils.TERM, VocabularyUtils.IS_FORBIDDEN],
        vocabulary: { iri: Generator.generateUri() },
        editor: user,
        modified: new Date().toISOString(),
      }),
    ];
    jest.spyOn(Redux, "useSelector").mockReturnValue(user);
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <AssetList assets={assets} />
      </MemoryRouter>
    );
    expect(wrapper.find(TermLink).length).toEqual(1);
  });
});
