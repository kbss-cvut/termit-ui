import SearchResult, {SearchResultData} from "../../../../model/SearchResult";
import Generator from "../../../../__tests__/environment/Generator";
import Vocabulary from "../../../../util/VocabularyUtils";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import {mountWithIntl} from "../../../../__tests__/environment/Environment";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import * as React from "react";
import {MAX_RENDERED_RESULTS, SearchResultsOverlay} from "../SearchResultsOverlay";
import {Simulate} from "react-dom/test-utils";
import {ReactWrapper} from "enzyme";
import {MemoryRouter} from "react-router";

jest.mock("popper.js");
jest.mock("../../../misc/AssetLabel");

function generateResults(type: string, count: number = 5): SearchResult[] {
    const results: SearchResult[] = [];
    for (let i = 0; i < count; i++) {
        const resData: SearchResultData = {
            iri: Generator.generateUri(),
            label: "Result " + i,
            score: Generator.randomInt(0, 1),
            types: [type],
            snippetText: "<em>Match</em>",
            snippetField: "label"
        };
        if (type === VocabularyUtils.TERM) {
            resData.vocabulary = {iri: "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/vocabulary-" + i};
        }
        results.push(new SearchResult(resData));
    }
    return results;
}

describe("SearchResultsOverlay", () => {
    let onClose: () => void;
    let onOpenSearch: () => void;

    let element: HTMLDivElement;
    let wrapper: ReactWrapper;

    beforeEach(() => {
        onClose = jest.fn();
        onOpenSearch = jest.fn();
        element = document.createElement("div");
        element.id = "root";
        document.body.appendChild(element);
        jest.useFakeTimers();
    });

    afterEach(() => {
        wrapper.unmount();
        jest.clearAllTimers();
        document.body.removeChild(element);
    });

    it("shows only first x search results, others can be viewed on dedicated search page", () => {
        const results = generateResults(Vocabulary.TERM, MAX_RENDERED_RESULTS + 5);
        wrapper = mountWithIntl(
            <MemoryRouter>
                <SearchResultsOverlay
                    targetId="root"
                    show={true}
                    searchResults={results}
                    onClose={onClose}
                    onOpenSearch={onOpenSearch}
                    {...intlFunctions()}
                />
            </MemoryRouter>,
            {attachTo: element}
        );
        const items = document.getElementsByClassName("search-result-link");
        expect(items.length).toEqual(MAX_RENDERED_RESULTS);
    });

    it("renders info message about no results when empty results are provided", () => {
        wrapper = mountWithIntl(
            <MemoryRouter>
                <SearchResultsOverlay
                    targetId="root"
                    show={true}
                    searchResults={[]}
                    onClose={onClose}
                    onOpenSearch={onOpenSearch}
                    {...intlFunctions()}
                />
            </MemoryRouter>,
            {attachTo: element}
        );
        const items = document.getElementsByClassName("search-result-link");
        expect(items.length).toEqual(0);
        expect(document.getElementsByClassName("search-result-no-results").length).toEqual(1);
    });

    it("renders count info when more results than displayable count are provided", () => {
        const results = generateResults(Vocabulary.TERM, MAX_RENDERED_RESULTS + 5);
        wrapper = mountWithIntl(
            <MemoryRouter>
                <SearchResultsOverlay
                    targetId="root"
                    show={true}
                    searchResults={results}
                    onClose={onClose}
                    onOpenSearch={onOpenSearch}
                    {...intlFunctions()}
                />
            </MemoryRouter>,
            {attachTo: element}
        );
        expect(document.getElementsByClassName("search-result-link").length).toEqual(MAX_RENDERED_RESULTS);
        expect(document.getElementsByClassName("search-result-info").length).toEqual(1);
    });

    it("renders results as links leading to result details", () => {
        const results = generateResults(Vocabulary.TERM, MAX_RENDERED_RESULTS);
        wrapper = mountWithIntl(
            <MemoryRouter>
                <SearchResultsOverlay
                    targetId="root"
                    show={true}
                    searchResults={results}
                    onClose={onClose}
                    onOpenSearch={onOpenSearch}
                    {...intlFunctions()}
                />
            </MemoryRouter>,
            {attachTo: element}
        );
        const links = document.getElementsByClassName("m-asset-link");
        expect(links.length).toEqual(MAX_RENDERED_RESULTS);
    });

    it("invokes search open when no results info link is clicked", () => {
        wrapper = mountWithIntl(
            <MemoryRouter>
                <SearchResultsOverlay
                    targetId="root"
                    show={true}
                    searchResults={[]}
                    onClose={onClose}
                    onOpenSearch={onOpenSearch}
                    {...intlFunctions()}
                />
            </MemoryRouter>,
            {attachTo: element}
        );
        const noResultsInfo = document.getElementsByClassName("search-result-no-results")[0];
        Simulate.click(noResultsInfo);
        expect(onOpenSearch).toHaveBeenCalled();
    });

    it("invokes search open when count info link is clicked", () => {
        const results = generateResults(Vocabulary.TERM, MAX_RENDERED_RESULTS + 5);
        wrapper = mountWithIntl(
            <MemoryRouter>
                <SearchResultsOverlay
                    targetId="root"
                    show={true}
                    searchResults={results}
                    onClose={onClose}
                    onOpenSearch={onOpenSearch}
                    {...intlFunctions()}
                />
            </MemoryRouter>,
            {attachTo: element}
        );
        const infoLink = document.getElementsByClassName("search-result-info")[0];
        Simulate.click(infoLink);
        expect(onOpenSearch).toHaveBeenCalled();
    });

    it("merges duplicate results to prevent rendering issues", () => {
        const iri = Generator.generateUri();
        const vocabularyIri = Generator.generateUri();
        const results = [
            new SearchResult({
                iri,
                label: "Result",
                snippetText: "<em>Match</em> multiple times. <em>Match</em> again",
                snippetField: "comment",
                vocabulary: {iri: vocabularyIri},
                types: [Vocabulary.TERM]
            }),
            new SearchResult({
                iri,
                label: "Result",
                snippetText: "<em>Match</em> multiple times. <em>Match</em> again",
                snippetField: "comment",
                vocabulary: {iri: vocabularyIri},
                types: [Vocabulary.TERM]
            })
        ];
        wrapper = mountWithIntl(
            <MemoryRouter>
                <SearchResultsOverlay
                    targetId="root"
                    show={true}
                    searchResults={results}
                    onClose={onClose}
                    onOpenSearch={onOpenSearch}
                    {...intlFunctions()}
                />
            </MemoryRouter>,
            {attachTo: element}
        );
        const items = document.getElementsByClassName("search-result-link");
        expect(items.length).toEqual(1);
    });

    it("reports correct result count after merging duplicates", () => {
        const results = generateResults(Vocabulary.TERM, MAX_RENDERED_RESULTS + 5);
        results.push(results[0].copy());
        wrapper = mountWithIntl(
            <MemoryRouter>
                <SearchResultsOverlay
                    targetId="root"
                    show={true}
                    searchResults={results}
                    onClose={onClose}
                    onOpenSearch={onOpenSearch}
                    {...intlFunctions()}
                />
            </MemoryRouter>,
            {attachTo: element}
        );
        const infoLink = document.getElementsByClassName("search-result-info")[0];
        const expCount = results.length - 1;
        expect(infoLink.textContent).toContain(expCount.toString());
    });

    it("sorts results correctly after merging duplicates", () => {
        const results = generateResults(VocabularyUtils.TERM);
        const newItem = new SearchResult({
            iri: results[results.length - 1].iri,
            score: 1,
            snippetText: "test <em>match</em> aaa",
            snippetField: "comment",
            label: results[0].label,
            vocabulary: {iri: results[0].vocabulary!.iri},
            types: [VocabularyUtils.TERM]
        });
        results.push(newItem);
        wrapper = mountWithIntl(
            <MemoryRouter>
                <SearchResultsOverlay
                    targetId="root"
                    show={true}
                    searchResults={results}
                    onClose={onClose}
                    onOpenSearch={onOpenSearch}
                    {...intlFunctions()}
                />
            </MemoryRouter>,
            {attachTo: element}
        );
        const items = document.getElementsByClassName("search-result-link");
        expect(items.length).toEqual(results.length - 1);
        expect(items[0].id).toContain(newItem.iri);
    });

    it("shows correct number of results when there are fewer than threshold and some are merged", () => {
        const results = generateResults(Vocabulary.TERM, 1);
        results.push(results[0].copy());
        wrapper = mountWithIntl(
            <MemoryRouter>
                <SearchResultsOverlay
                    targetId="root"
                    show={true}
                    searchResults={results}
                    onClose={onClose}
                    onOpenSearch={onOpenSearch}
                    {...intlFunctions()}
                />
            </MemoryRouter>,
            {attachTo: element}
        );
        const infoLink = document.getElementById("search-results-link");
        expect(infoLink).toBeNull();
        const items = document.getElementsByClassName("search-result-link");
        expect(items.length).toEqual(1);
    });
});
