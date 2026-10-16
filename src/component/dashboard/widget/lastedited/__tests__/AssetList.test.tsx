import { renderWithIntl } from "../../../../../__tests__/environment/Environment";
import en from "../../../../../i18n/en";
import Generator from "../../../../../__tests__/environment/Generator";
import { MemoryRouter } from "react-router-dom";
import VocabularyUtils from "../../../../../util/VocabularyUtils";
import { AssetList } from "../AssetList";
import User from "../../../../../model/User";
import RecentlyModifiedAsset from "../../../../../model/RecentlyModifiedAsset";
import * as Redux from "react-redux";
import { screen } from "@testing-library/react";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

describe("AssetList", () => {
  let user: User;

  beforeEach(() => {
    user = Generator.generateUser();
  });

  it("does not render info message during loading", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(user);
    renderWithIntl(
      <MemoryRouter>
        <AssetList assets={null} />
      </MemoryRouter>
    );
    expect(
      screen.queryByText(en.messages["dashboard.widget.assetList.empty"])
    ).not.toBeInTheDocument();
  });

  it("renders info message when no assets were found", () => {
    vi.spyOn(Redux, "useSelector").mockReturnValue(user);
    renderWithIntl(
      <MemoryRouter>
        <AssetList assets={[]} />
      </MemoryRouter>
    );
    expect(
      screen.getByText(en.messages["dashboard.widget.assetList.empty"])
    ).toBeInTheDocument();
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
    vi.spyOn(Redux, "useSelector").mockReturnValue(user);
    renderWithIntl(
      <MemoryRouter>
        <AssetList assets={assets} />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("link", { name: assets[0].label })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: assets[1].label })
    ).toBeInTheDocument();
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
    vi.spyOn(Redux, "useSelector").mockReturnValue(user);
    renderWithIntl(
      <MemoryRouter>
        <AssetList assets={assets} />
      </MemoryRouter>
    );
    expect(
      screen.getByText((_, element) =>
        Boolean(
          element?.classList.contains("asset-list-title-message") &&
            element.textContent?.includes(containedString)
        )
      )
    ).toBeInTheDocument();
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
    vi.spyOn(Redux, "useSelector").mockReturnValue(user);
    renderWithIntl(
      <MemoryRouter>
        <AssetList assets={assets} />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: "Term" })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "*****" })
    ).not.toBeInTheDocument();
  });
});
