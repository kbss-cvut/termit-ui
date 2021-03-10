import * as React from "react";
import VocabularyUtils, {IRI} from "../../../../util/VocabularyUtils";
import {flushPromises} from "../../../../__tests__/environment/Environment";
import {VocabularySummary} from "../VocabularySummary";
import {EMPTY_VOCABULARY} from "../../../../model/Vocabulary";
import {act} from "react-dom/test-utils";
import {match as Match, RouteComponentProps} from "react-router";
import {createMemoryHistory, Location} from "history";
import {mountWithIntlAttached} from "../../../annotator/__tests__/AnnotationUtil";

jest.mock("../../../vocabulary/ImportedVocabulariesList", () => () => <div>Imported vocabularies</div>);
jest.mock("../../term/Terms", () => () => <div>Terms</div>);

describe("Public VocabularySummary", () => {

    const normalizedName = "test-vocabulary";
    const namespace = VocabularyUtils.NS_TERMIT;

    let loadVocabulary: (iri: IRI) => void;
    let resetSelectedTerm: () => void;

    let location: Location;
    const history = createMemoryHistory();
    let match: Match<any>;
    let routerProps: RouteComponentProps<any>;

    beforeEach(() => {
        loadVocabulary = jest.fn();
        resetSelectedTerm = jest.fn();

        location = {
            pathname: "/vocabulary/" + normalizedName,
            search: `namespace=${namespace}`,
            hash: "",
            state: {}
        };
        match = {
            params: {
                name: normalizedName
            },
            path: location.pathname,
            isExact: true,
            url: "http://localhost:3000/" + location.pathname
        };
        routerProps = {history, match, location};
    });

    it("resets selected term on mount", async () => {
        mountWithIntlAttached(<VocabularySummary vocabulary={EMPTY_VOCABULARY} loadVocabulary={loadVocabulary}
                                                 resetSelectedTerm={resetSelectedTerm} {...routerProps}/>);
        await act(async () => {
            await flushPromises();
        });
        expect(resetSelectedTerm).toHaveBeenCalled();
    });
});
