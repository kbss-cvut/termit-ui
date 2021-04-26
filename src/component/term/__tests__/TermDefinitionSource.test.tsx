import * as React from "react";
import Term, {TermData} from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import {langString} from "../../../model/MultilingualString";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {TermOccurrenceData} from "../../../model/TermOccurrence";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import TermDefinitionSource from "../TermDefinitionSource";
import Constants from "../../../util/Constants";
import TermDefinitionSourceLink from "../TermDefinitionSourceLink";

jest.mock("../TermDefinitionSourceLink", () => () => <span>Go to source</span>);

describe("TermDefinitionSource", () => {

    const termData: TermData = {
        iri: Generator.generateUri(),
        label: langString("Test"),
        definition: langString("Definition of a term test")
    };

    // Bug #1562
    it("renders definition source link even when term has no source", () => {
        const definitionSource = generateDefinitionSource();
        const term = new Term(Object.assign({}, termData, {definitionSource}));

        const wrapper = mountWithIntl(<TermDefinitionSource term={term} language={Constants.DEFAULT_LANGUAGE} withDefinitionSource={true}/>);
        expect(wrapper.exists(TermDefinitionSourceLink)).toBeTruthy();
    });
    function generateDefinitionSource(): TermOccurrenceData {
        return {
            iri: Generator.generateUri(),
            target: {
                source: {iri: Generator.generateUri()},
                selectors: [{
                    iri: Generator.generateUri(),
                    exactMatch: "Test",
                    types: [VocabularyUtils.TEXT_QUOTE_SELECTOR]
                }],
                types: [VocabularyUtils.FILE_OCCURRENCE_TARGET]
            },
            term: termData,
            types: [VocabularyUtils.TERM_DEFINITION_SOURCE]
        };
    }

    it("does not attempt to render definition source link when term has no definition source", () => {
        const term = new Term(termData);

        const wrapper = mountWithIntl(<TermDefinitionSource term={term} language={Constants.DEFAULT_LANGUAGE} withDefinitionSource={true}/>);
        expect(wrapper.exists(TermDefinitionSourceLink)).toBeFalsy();
    });

    it("renders definition source link even when term has no definition text", () => {
        let data = Object.assign({}, termData);
        delete data.definition;
        const definitionSource: TermOccurrenceData = generateDefinitionSource();
        const term = new Term(Object.assign({}, termData, {definitionSource}));

        const wrapper = mountWithIntl(<TermDefinitionSource term={term} language={Constants.DEFAULT_LANGUAGE} withDefinitionSource={true}/>);
        expect(wrapper.exists(TermDefinitionSourceLink)).toBeTruthy();
    });

    it("does not render definition source link when configured not to", () => {
        const definitionSource = generateDefinitionSource();
        const term = new Term(Object.assign({sources: ["http://example.org"]}, termData, {definitionSource}));

        const wrapper = mountWithIntl(<TermDefinitionSource term={term} language={Constants.DEFAULT_LANGUAGE} withDefinitionSource={false}/>);
        expect(wrapper.exists(TermDefinitionSourceLink)).toBeFalsy();
    });
});