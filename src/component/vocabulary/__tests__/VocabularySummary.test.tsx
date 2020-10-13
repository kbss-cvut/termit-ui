import * as React from "react";
import VocabularyUtils, {IRI} from "../../../util/VocabularyUtils";
import Vocabulary, {EMPTY_VOCABULARY} from "../../../model/Vocabulary";
import {createMemoryHistory, Location} from "history";
import {match as Match} from "react-router";
import {shallow} from "enzyme";
import {VocabularySummary} from "../VocabularySummary";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {DropdownToggle} from "reactstrap";

jest.mock("../../changetracking/AssetHistory");
jest.mock("../../term/Terms");
jest.mock("../TermChangeFrequency");

describe("VocabularySummary", () => {

    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
    const normalizedName = "test-vocabulary";

    let location: Location;
    const history = createMemoryHistory();
    let match: Match<any>;

    let onLoad: (iri: IRI) => void;
    let exportToCsv: (iri: IRI) => void;
    let exportToExcel: (iri: IRI) => void;
    let exportToTurtle: (iri: IRI) => void;
    let exportFunctions: any;

    let vocabulary: Vocabulary;

    beforeEach(() => {
        onLoad = jest.fn();
        exportToCsv = jest.fn();
        exportToExcel = jest.fn();
        exportToTurtle = jest.fn();
        exportFunctions = {exportToCsv, exportToExcel, exportToTurtle};
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
        vocabulary = new Vocabulary({
            iri: namespace + normalizedName,
            label: "Test vocabulary"
        });
    });

    it("loads vocabulary on mount", () => {
        shallow(<VocabularySummary vocabulary={EMPTY_VOCABULARY} loadVocabulary={onLoad}
                                   history={history} location={location} {...exportFunctions}
                                   match={match} {...intlFunctions()}/>);
        expect(onLoad).toHaveBeenCalledWith({fragment: normalizedName, namespace});
    });

    it("passes namespace to vocabulary loading when specified", () => {
        location.search = "?namespace=" + namespace;
        shallow(<VocabularySummary vocabulary={EMPTY_VOCABULARY} loadVocabulary={onLoad}
                                   history={history} location={location} {...exportFunctions}
                                   match={match} {...intlFunctions()}/>);
        expect(onLoad).toHaveBeenCalledWith({fragment: normalizedName, namespace});
    });

    it("does not attempt to reload vocabulary when namespace is missing in location and fragment is identical", () => {
        const wrapper = shallow<VocabularySummary>(<VocabularySummary vocabulary={EMPTY_VOCABULARY}
                                                                      loadVocabulary={onLoad}
                                                                      history={history}
                                                                      location={location} {...exportFunctions}
                                                                      match={match} {...intlFunctions()}/>);
        wrapper.setProps({vocabulary});
        wrapper.update();
        expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it("invokes export to CSV when exportToCsv is triggered", () => {
        const div = document.createElement("div");
        document.body.appendChild(div);

        const wrapper = mountWithIntl(<VocabularySummary vocabulary={vocabulary}
                                                         loadVocabulary={onLoad} {...exportFunctions}
                                                         history={history} location={location}
                                                         match={match} {...intlFunctions()}/>, {attachTo: div});
        wrapper.find(DropdownToggle).simulate("click");
        wrapper.find("button[name=\"vocabulary-export-csv\"]").simulate("click");
        expect(exportToCsv).toHaveBeenCalledWith(VocabularyUtils.create(vocabulary.iri));
    });

    it("invokes export to Excel when exportToExcel is triggered", () => {
        const div = document.createElement("div");
        document.body.appendChild(div);

        const wrapper = mountWithIntl(<VocabularySummary vocabulary={vocabulary}
                                                         loadVocabulary={onLoad} {...exportFunctions}
                                                         history={history} location={location}
                                                         match={match} {...intlFunctions()}/>, {attachTo: div});
        wrapper.find(DropdownToggle).simulate("click");
        wrapper.find("button[name=\"vocabulary-export-excel\"]").simulate("click");
        expect(exportToExcel).toHaveBeenCalledWith(VocabularyUtils.create(vocabulary.iri));
    });

    it("invokes export to Turtle when exportToTurtle is triggered", () => {
        const div = document.createElement("div");
        document.body.appendChild(div);

        const wrapper = mountWithIntl(<VocabularySummary vocabulary={vocabulary}
                                                         loadVocabulary={onLoad} {...exportFunctions}
                                                         history={history} location={location}
                                                         match={match} {...intlFunctions()}/>, {attachTo: div});
        wrapper.find(DropdownToggle).simulate("click");
        wrapper.find("button[name=\"vocabulary-export-ttl\"]").simulate("click");
        expect(exportToTurtle).toHaveBeenCalledWith(VocabularyUtils.create(vocabulary.iri));
    });

    it("reloads Vocabulary when File was added into the Vocabulary's Document", () => {
        const wrapper = shallow<VocabularySummary>(<VocabularySummary vocabulary={EMPTY_VOCABULARY}
                                                                      loadVocabulary={onLoad} {...exportFunctions}
                                                                      history={history} location={location}
                                                                      match={match} {...intlFunctions()}/>);
        wrapper.instance().onFileAdded();
        expect(onLoad).toHaveBeenCalledWith(VocabularyUtils.create(vocabulary.iri));
    });
});
