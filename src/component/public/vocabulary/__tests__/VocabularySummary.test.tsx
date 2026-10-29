import VocabularyUtils from "../../../../util/VocabularyUtils";
import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import { waitFor } from "@testing-library/react";
import { VocabularySummary } from "../VocabularySummary";
import { EMPTY_VOCABULARY } from "../../../../model/Vocabulary";
import { Location } from "history";
import { DEFAULT_CONFIGURATION } from "../../../../model/Configuration";
import * as Redux from "react-redux";
import * as router from "react-router-dom";
import { match as Match } from "react-router";
import * as SyncActions from "../../../../action/SyncActions";
import * as AsyncActions from "../../../../action/AsyncActions";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useLocation: vi.fn(),
    useRouteMatch: vi.fn(),
  };
});
vi.mock("../../../vocabulary/ImportedVocabulariesList", () => ({
  default: () => <div>Imported vocabularies</div>,
}));
vi.mock("../../term/Terms", () => ({ default: () => <div>Terms</div> }));

describe("Public VocabularySummary", () => {
  const normalizedName = "test-vocabulary";
  const namespace = VocabularyUtils.NS_TERMIT;

  let location: Location;
  let match: Match<any>;

  beforeEach(() => {
    location = {
      pathname: "/vocabulary/" + normalizedName,
      search: `namespace=${namespace}`,
      hash: "",
      state: {},
    };
    match = {
      params: {
        name: normalizedName,
      },
      path: location.pathname,
      isExact: true,
      url: "http://localhost:3000/" + location.pathname,
    };
  });

  it("resets selected term on mount", async () => {
    vi.spyOn(Redux, "useSelector").mockImplementation((selector) =>
      selector({
        vocabulary: EMPTY_VOCABULARY,
        configuration: DEFAULT_CONFIGURATION,
      } as any)
    );
    vi.spyOn(Redux, "useDispatch").mockReturnValue(
      vi.fn().mockResolvedValue({})
    );
    vi.spyOn(router, "useLocation").mockReturnValue(location);
    vi.spyOn(router, "useRouteMatch").mockReturnValue(match);
    vi.spyOn(SyncActions, "selectVocabularyTerm");
    vi.spyOn(AsyncActions, "loadVocabulary");
    renderWithIntl(<VocabularySummary />);
    await waitFor(() => {
      expect(SyncActions.selectVocabularyTerm).toHaveBeenCalledWith(null);
    });
  });
});
