import * as React from "react";
import {TextQuoteSelector} from "../../../model/TermOccurrence";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Term from "../../../model/Term";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Routes, {Route} from "../../../util/Routes";
import {VocabularyData} from "../../../model/Vocabulary";
import {TermDefinitionSourceLink} from "../TermDefinitionSourceLink";
import {flushPromises, mountWithIntl} from "../../../__tests__/environment/Environment";
import {act} from "react-dom/test-utils";
import {MemoryRouter} from "react-router";

describe("TermDefinitionSourceLink", () => {

    let pushRoutingPayload: (route: Route, payload: any) => void;

    beforeEach(() => {
        pushRoutingPayload = jest.fn();
    });

    it("pushes definition source selector to transition payload store when transition to definition source is triggered", async () => {
        const vocabulary: VocabularyData = {
            iri: Generator.generateUri(),
            label: "Test vocabulary"
        }
        const selector: TextQuoteSelector = {
            iri: Generator.generateUri(),
            exactMatch: "test",
            types: [VocabularyUtils.TEXT_QUOTE_SELECTOR]
        };
        const term = new Term({
            iri: Generator.generateUri(),
            label: "Test",
            comment: "test",
            vocabulary,
            definitionSource: {
                term: {iri: "test", label: "test"},
                target: {
                    source: {iri: Generator.generateUri()},
                    selectors: [selector],
                    types: [VocabularyUtils.FILE_OCCURRENCE_TARGET]
                },
                types: [VocabularyUtils.TERM_DEFINITION_SOURCE]
            }
        });
        term.definitionSource!.term = term;
        const wrapper = mountWithIntl(<MemoryRouter><TermDefinitionSourceLink term={term}
                                                                              pushRoutingPayload={pushRoutingPayload} {...intlFunctions()}/></MemoryRouter>);
        await act(async () => {
            await flushPromises();
        });
        wrapper.find("button#term-metadata-definitionSource-goto").simulate("click");
        expect(pushRoutingPayload).toHaveBeenCalledWith(Routes.annotateFile, {selector});
    });
});
