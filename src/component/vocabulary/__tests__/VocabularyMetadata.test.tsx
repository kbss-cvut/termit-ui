import * as React from "react";
import Vocabulary from "../../../model/Vocabulary";
import Document from "../../../model/Document";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {VocabularyMetadata} from "../VocabularyMetadata";
import {shallow} from "enzyme";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {Location} from "history";
import {match as Match} from "react-router";

describe("VocabularyMetadata", () => {
    const normalizedVocabularyName = "test-vocabulary";

    let onFileAdded: () => void;
    let resetSelectedTerm: () => void;

    let vocabulary: Vocabulary;

    let location: Location;
    let match: Match<any>;

    beforeEach(() => {
        onFileAdded = jest.fn();
        resetSelectedTerm = jest.fn();
        vocabulary = vocabulary = new Vocabulary({
            iri: Generator.generateUri(),
            label: "Test vocabulary",
            types: [VocabularyUtils.VOCABULARY]
        });

        location = {
            pathname: "/vocabularies/" + normalizedVocabularyName,
            search: "?namespace=" + normalizedVocabularyName,
            hash: "",
            state: {}
        };
        match = {
            params: {
                name: normalizedVocabularyName
            },
            path: location.pathname,
            isExact: true,
            url: "http://localhost:3000/" + location.pathname
        };
    });

    it("sets selected tab to terms tab on mount", () => {
        vocabulary.document = new Document({
            iri: Generator.generateUri(),
            label: "Test document",
            files: [],
            types: [VocabularyUtils.RESOURCE, VocabularyUtils.DOCUMENT]
        });
        const wrapper = shallow<VocabularyMetadata>(
            <VocabularyMetadata
                resetSelectedTerm={resetSelectedTerm}
                vocabulary={vocabulary}
                location={location}
                match={match}
                onFileAdded={onFileAdded}
                {...intlFunctions()}
            />
        );
        expect(wrapper.state().activeTab).toEqual("glossary.title");
    });

    it("resets selected term on mount", () => {
        vocabulary.document = new Document({
            iri: Generator.generateUri(),
            label: "Test document",
            files: [],
            types: [VocabularyUtils.RESOURCE, VocabularyUtils.DOCUMENT]
        });
        shallow<VocabularyMetadata>(
            <VocabularyMetadata
                resetSelectedTerm={resetSelectedTerm}
                vocabulary={vocabulary}
                location={location}
                match={match}
                onFileAdded={onFileAdded}
                {...intlFunctions()}
            />
        );
        expect(resetSelectedTerm).toHaveBeenCalled();
    });
});
