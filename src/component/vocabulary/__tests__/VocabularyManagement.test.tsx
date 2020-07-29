import * as React from "react";
import {flushPromises, mountWithIntl} from "../../../__tests__/environment/Environment";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {act} from "react-dom/test-utils";
import {VocabularyManagement} from "../VocabularyManagement";
import {MemoryRouter} from "react-router";

jest.mock("../VocabularyList");

describe("VocabularyList", () => {
    let loadVocabularies: () => void;

    beforeEach(() => {
        loadVocabularies = jest.fn();
    });

    it("loads vocabularies on mount", async () => {
        mountWithIntl(<MemoryRouter><VocabularyManagement
            loadVocabularies={loadVocabularies} {...intlFunctions()}/></MemoryRouter>);
        await act(async () => {
            await flushPromises();
        });
        expect(loadVocabularies).toHaveBeenCalled();
    });
});
