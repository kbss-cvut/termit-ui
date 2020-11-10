import * as React from "react";
import {Link, MemoryRouter} from "react-router-dom";
import Term from "../../../model/Term";
import {TermLink} from "../TermLink";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import Vocabulary from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import {EMPTY_USER} from "../../../model/User";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import MultilingualString, {langString} from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";

describe("TermLink", () => {

    const vocFragment = "localVocabularyFragment";
    const vocNamespace = "http://test.org/";
    let testVocabulary: Vocabulary;

    beforeEach(() => {
        testVocabulary = new Vocabulary({
            label: "Test vocabulary",
            iri: vocNamespace + vocFragment
        });
    })

    it("links to correct internal asset", () => {
        const termFragment = "localTermFragment";
        const term = new Term({
            label: langString("Test term"),
            iri: `${testVocabulary.iri}/pojem/${termFragment}`,
            vocabulary: testVocabulary
        });

        const link = mountWithIntl(<MemoryRouter><TermLink term={term}
                                                           user={Generator.generateUser()} {...intlFunctions()}/></MemoryRouter>).find(Link);
        expect((link.props() as any).to).toEqual(`/vocabularies/${vocFragment}/terms/${termFragment}?namespace=${vocNamespace}`);
    });

    it("render outgoing link when term is missing vocabulary", () => {
        const term = new Term({
            iri: Generator.generateUri(),
            label: langString("Term without vocabulary")
        });
        const wrapper = mountWithIntl(<MemoryRouter><TermLink term={term}
                                                              user={Generator.generateUser()} {...intlFunctions()}/></MemoryRouter>);
        expect(wrapper.find(Link).exists()).toBeFalsy();
        expect(wrapper.find("a").contains(<small>
            <i className="fas fa-external-link-alt text-primary"/>
        </small>)).toBeTruthy();
    });

    it("links to public term view when user is not logged in", () => {
        const termFragment = "localTermFragment";
        const term = new Term({
            label: langString("Test term"),
            iri: `${testVocabulary.iri}/pojem/${termFragment}`,
            vocabulary: testVocabulary
        });

        const link = mountWithIntl(<MemoryRouter><TermLink term={term}
                                                           user={EMPTY_USER} {...intlFunctions()}/></MemoryRouter>).find(Link);
        expect((link.props() as any).to).toEqual(`/public/vocabularies/${vocFragment}/terms/${termFragment}?namespace=${vocNamespace}`);
    });

    it("does not change term in props when dealing with multilingual labels", () => {
        const originalLabel: MultilingualString = {
            "en": "Test term",
            "cs": "Testovaci pojem"
        };
        const term = new Term({
            label: originalLabel,
            iri: `${testVocabulary.iri}/pojem/localTestFragment`,
            vocabulary: testVocabulary
        });

        mountWithIntl(<MemoryRouter><TermLink term={term}
                                              user={EMPTY_USER} {...intlFunctions()}/></MemoryRouter>).find(Link);
        expect(term.label).toEqual(originalLabel);
    });

    it("renders link with label in language corresponding to current locale", () => {
        const term = new Term({
            label: {
                "en": "Test term",
                "cs": "Testovaci pojem"
            },
            iri: `${testVocabulary.iri}/pojem/localTestFragment`,
            vocabulary: testVocabulary
        });

        const intlData = intlFunctions();
        intlData.locale = Constants.LANG.CS.locale;
        const link = mountWithIntl(<MemoryRouter><TermLink term={term}
                                                           user={EMPTY_USER} {...intlData}/></MemoryRouter>).find(Link);
        expect(link.text()).toEqual(term.label.cs);
    });
});
