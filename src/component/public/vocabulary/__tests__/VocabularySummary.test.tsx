import VocabularyUtils from "../../../../util/VocabularyUtils";
import { flushPromises } from "../../../../__tests__/environment/Environment";
import { VocabularySummary } from "../VocabularySummary";
import { EMPTY_VOCABULARY } from "../../../../model/Vocabulary";
import { act } from "react-dom/test-utils";
import { match as Match } from "react-router";
import { Location } from "history";
import { mountWithIntlAttached } from "../../../annotator/__tests__/AnnotationUtil";
import { DEFAULT_CONFIGURATION } from "../../../../model/Configuration";
import * as redux from "react-redux";
import * as Redux from "react-redux";
import * as router from "react-router-dom";
import * as SyncActions from "../../../../action/SyncActions";
import * as AsyncActions from "../../../../action/AsyncActions";

jest.mock("react-redux", () => ({
  ...(jest.requireActual("react-redux") as {}),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as {}),
  useLocation: jest.fn(),
  useRouteMatch: jest.fn(),
}));
jest.mock("../../../vocabulary/ImportedVocabulariesList", () => () => (
  <div>Imported vocabularies</div>
));
jest.mock("../../term/Terms", () => () => <div>Terms</div>);

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
    jest
      .spyOn(redux, "useSelector")
      .mockReturnValueOnce(EMPTY_VOCABULARY)
      .mockReturnValueOnce(DEFAULT_CONFIGURATION);
    jest
      .spyOn(Redux, "useDispatch")
      .mockReturnValue(jest.fn().mockResolvedValue({}));
    jest.spyOn(router, "useLocation").mockReturnValue(location);
    jest.spyOn(router, "useRouteMatch").mockReturnValue(match);
    jest.spyOn(SyncActions, "selectVocabularyTerm");
    jest.spyOn(AsyncActions, "loadVocabulary");
    mountWithIntlAttached(<VocabularySummary />);
    await act(async () => {
      await flushPromises();
    });
    expect(SyncActions.selectVocabularyTerm).toHaveBeenCalledWith(null);
  });
});
