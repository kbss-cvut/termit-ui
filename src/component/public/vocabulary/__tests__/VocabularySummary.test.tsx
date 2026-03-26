import VocabularyUtils from "../../../../util/VocabularyUtils";
import {flushPromises} from "../../../../__tests__/environment/Environment";
import {VocabularySummary} from "../VocabularySummary";
import {EMPTY_VOCABULARY} from "../../../../model/Vocabulary";
import {act} from "react-dom/test-utils";
import {match as Match} from "react-router";
import {Location} from "history";
import {mountWithIntlAttached} from "../../../annotator/__tests__/AnnotationUtil";
import {DEFAULT_CONFIGURATION} from "../../../../model/Configuration";
import * as redux from "react-redux";
import * as Redux from "react-redux";
import * as router from "react-router-dom";
import * as SyncActions from "../../../../action/SyncActions";
import * as AsyncActions from "../../../../action/AsyncActions";

vi.mock("react-redux", async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        useSelector: vi.fn(),
        useDispatch: vi.fn(),
    };
});
vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        useLocation: vi.fn(),
        useRouteMatch: vi.fn(),
    };
});
vi.mock("../../../vocabulary/ImportedVocabulariesList", () => ({
    default: () => (
        <div>Imported vocabularies</div>
    )
}));
vi.mock("../../term/Terms", () => ({default: () => <div>Terms</div>}));

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
        vi
            .spyOn(redux, "useSelector")
            .mockReturnValueOnce(EMPTY_VOCABULARY)
            .mockReturnValueOnce(DEFAULT_CONFIGURATION);
        vi
            .spyOn(Redux, "useDispatch")
            .mockReturnValue(vi.fn().mockResolvedValue({}));
        vi.spyOn(router, "useLocation").mockReturnValue(location);
        vi.spyOn(router, "useRouteMatch").mockReturnValue(match);
        vi.spyOn(SyncActions, "selectVocabularyTerm");
        vi.spyOn(AsyncActions, "loadVocabulary");
        mountWithIntlAttached(<VocabularySummary/>);
        await act(async () => {
            await flushPromises();
        });
        expect(SyncActions.selectVocabularyTerm).toHaveBeenCalledWith(null);
    });
});
