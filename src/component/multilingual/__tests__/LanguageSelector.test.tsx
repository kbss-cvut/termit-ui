import * as React from "react";
import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import LanguageSelector from "../LanguageSelector";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Constants from "../../../util/Constants";
import {DropdownItem} from "reactstrap";
import ISO6391 from "iso-639-1";

describe("LanguageSelector", () => {

    let onSelect: (lang: string) => void;

    beforeEach(() => {
        onSelect = jest.fn();
    });

    it("renders list of languages extracted from multilingual attributes of specified term", () => {
        const term = new Term({
            iri: Generator.generateUri(),
            label: {
                "en": "Building",
                "cs": "Budova",
                "de": "Bauwerk, das"
            },
            types: [VocabularyUtils.TERM]
        });
        const result = mountWithIntl(<LanguageSelector term={term} onSelect={onSelect}
                                                       language={Constants.DEFAULT_LANGUAGE} {...intlFunctions()}/>);
        const items = result.find(DropdownItem);
        expect(items.length).toEqual(Object.getOwnPropertyNames(term.label).length);
    });

    it("renders value in selected language as selector toggle label", () => {
        const label = {"cs": "Budova"};
        label[Constants.DEFAULT_LANGUAGE] = "Building";
        const term = new Term({
            iri: Generator.generateUri(),
            label,
            types: [VocabularyUtils.TERM]
        });
        const result = mountWithIntl(<LanguageSelector term={term} onSelect={onSelect}
                                                       language={Constants.DEFAULT_LANGUAGE} {...intlFunctions()}/>);
        const toggle = result.find("button#term-language-selector-toggle");
        expect(toggle.text()).toContain(ISO6391.getNativeName(Constants.DEFAULT_LANGUAGE));
    });

    it("renders nothing when there are no alternative translations", () => {
        const term = new Term({
            iri: Generator.generateUri(),
            label: {
                "en": "Building",
            },
            types: [VocabularyUtils.TERM]
        });
        const result = mountWithIntl(<LanguageSelector term={term} onSelect={onSelect}
                                                       language={Constants.DEFAULT_LANGUAGE} {...intlFunctions()}/>);
        expect(result.exists("#term-language-selector")).toBeFalsy();
    });

    it("renders nothing when passed plain null", () => {
        const result = mountWithIntl(<LanguageSelector term={null} onSelect={onSelect}
                                                       language={Constants.DEFAULT_LANGUAGE} {...intlFunctions()}/>);
        expect(result.exists("#term-language-selector")).toBeFalsy();
    });

    it("handles plural multilingual attributes when determining languages to show", () => {
        const term = new Term({
            iri: Generator.generateUri(),
            label: {
                "en": "Building",
            },
            definition: {"en": "Building is a bunch of concrete with windows and doors."},
            altLabels: [{"en": "Construction", "cs": "Stavba"}],
            types: [VocabularyUtils.TERM]
        });
        const result = mountWithIntl(<LanguageSelector term={term} onSelect={onSelect}
                                                       language={Constants.DEFAULT_LANGUAGE} {...intlFunctions()}/>);
        const items = result.find(DropdownItem);
        expect(items.length).toEqual(2);
        const texts = items.map(i => i.text());
        ["cs", "en"].forEach(lang => expect(texts.find(t => ISO6391.getNativeName(lang))).toBeDefined());
    });
});
