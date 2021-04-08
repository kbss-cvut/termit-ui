import * as React from "react";
import {flushPromises, mountWithIntl} from "../../../__tests__/environment/Environment";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {act} from "react-dom/test-utils";
import {VocabularyManagement} from "../VocabularyManagement";
import {MemoryRouter} from "react-router";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import * as redux from "react-redux";

jest.mock("../VocabularyList");

describe("VocabularyList", () => {
    let loadVocabularies: () => void;

    beforeEach(() => {
        loadVocabularies = jest.fn();
    });

    it("loads vocabularies on mount", async () => {
        jest.spyOn(redux, "useSelector").mockReturnValue(Generator.generateUser());
        mountWithIntl(
            <MemoryRouter>
                <VocabularyManagement loadVocabularies={loadVocabularies} {...intlFunctions()} />
            </MemoryRouter>
        );
        await act(async () => {
            await flushPromises();
        });
        expect(loadVocabularies).toHaveBeenCalled();
    });

    it("does not display create vocabulary button when current user has restricted access", async () => {
        const user = Generator.generateUser();
        user.types.push(VocabularyUtils.USER_RESTRICTED);
        jest.spyOn(redux, "useSelector").mockReturnValue(user);
        const wrapper = mountWithIntl(
            <MemoryRouter>
                <VocabularyManagement loadVocabularies={loadVocabularies} {...intlFunctions()} />
            </MemoryRouter>
        );
        await act(async () => {
            await flushPromises();
        });
        expect(wrapper.exists("#vocabularies-create")).toBeFalsy();
    });
});
