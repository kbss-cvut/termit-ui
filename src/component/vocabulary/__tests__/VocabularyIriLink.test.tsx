import * as React from "react";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {Link, MemoryRouter} from "react-router-dom";
import Generator from "../../../__tests__/environment/Generator";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {EMPTY_USER} from "../../../model/User";
import {VocabularyIriLink} from "../VocabularyIriLink";

jest.mock("../../misc/AssetLabel");

describe("Vocabulary IRI Link links to correct internal asset", () => {
    const fragment = "localVocabularyFragment";
    const namespace = "http://example.com/";
    const iri = namespace + fragment;

    it("link to an asset", () => {
        const link = mountWithIntl(
            <MemoryRouter>
                <VocabularyIriLink iri={iri} user={Generator.generateUser()} {...intlFunctions()} />
            </MemoryRouter>
        ).find(Link);
        expect((link.props() as any).to).toEqual("/vocabularies/" + fragment + "?namespace=" + namespace);
    });

    it("links to public vocabulary view when current user is empty", () => {
        const link = mountWithIntl(
            <MemoryRouter>
                <VocabularyIriLink iri={iri} user={EMPTY_USER} {...intlFunctions()} />
            </MemoryRouter>
        ).find(Link);
        expect((link.props() as any).to).toEqual("/public/vocabularies/" + fragment + "?namespace=" + namespace);
    });
});
