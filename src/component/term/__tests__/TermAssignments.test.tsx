import * as React from "react";
import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {TermAssignments} from "../TermAssignments";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {ReactWrapper, shallow} from "enzyme";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {Badge} from "reactstrap";
import {MemoryRouter} from "react-router";
import {ResourceLink} from "../../resource/ResourceLink";
import {GoCheck} from "react-icons/go";
import {TermAssignments as AssignmentInfo, TermOccurrences} from "../../../model/TermAssignments";

describe("TermAssignments", () => {

    let loadTermAssignments: (term: Term) => Promise<any>;
    const onAssignmentsLoad: (assignmentsCount: number) => void = jest.fn();
    let term: Term;

    let element: HTMLDivElement;
    let mounted: ReactWrapper;

    beforeEach(() => {
        loadTermAssignments = jest.fn().mockImplementation(() => Promise.resolve([]));
        term = new Term({
            iri: Generator.generateUri(),
            label:  {"en":"Test term"},
            vocabulary: {
                iri: Generator.generateUri()
            }
        });
        element = document.createElement("div");
        element.id = "root";
        document.body.appendChild(element);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        document.body.removeChild(element);
    });

    it("does not render anything when no assignments are available", () => {
        mounted = mountWithIntl(<TermAssignments term={term} onLoad={onAssignmentsLoad}
                                                 loadTermAssignments={loadTermAssignments} {...intlFunctions()}/>);
        expect(mounted.find(".additional-metadata").exists()).toBeFalsy();
    });

    it("loads assignments on mount", () => {
        shallow(<TermAssignments term={term} loadTermAssignments={loadTermAssignments}
                                 onLoad={onAssignmentsLoad}
                                 {...intlFunctions()}/>);
        expect(loadTermAssignments).toHaveBeenCalledWith(term);
    });

    it("renders assignments when they are loaded", () => {
        const assignments: AssignmentInfo[] = [{
            term: {iri: term.iri},
            resource: {iri: Generator.generateUri()},
            label: "Test resource",
            types: [VocabularyUtils.TERM_ASSIGNMENT]
        }];
        loadTermAssignments = jest.fn().mockImplementation(() => Promise.resolve(assignments));
        mounted = mountWithIntl(<MemoryRouter><TermAssignments term={term} onLoad={onAssignmentsLoad}
                                                               loadTermAssignments={loadTermAssignments} {...intlFunctions()}/>
        </MemoryRouter>, {attachTo: element});
        return Promise.resolve().then(() => {
            mounted.update();
            expect(mounted.find(".additional-metadata-container").exists()).toBeTruthy();
        });
    });

    it("reloads assignments on update", () => {
        const wrapper = shallow(<TermAssignments term={term} loadTermAssignments={loadTermAssignments}
                                                 onLoad={onAssignmentsLoad}
                                                 {...intlFunctions()}/>);
        expect(loadTermAssignments).toHaveBeenCalledWith(term);
        const differentTerm = new Term({
            iri: Generator.generateUri(),
            label: {"en":"Different term"},
            vocabulary: {
                iri: Generator.generateUri()
            }
        });
        wrapper.setProps({term: differentTerm});
        wrapper.update();
        expect(loadTermAssignments).toHaveBeenCalledWith(differentTerm);
        expect(loadTermAssignments).toHaveBeenCalledTimes(2);
    });

    it("does not reload assignments if the term is still the same", () => {
        const wrapper = shallow(<TermAssignments term={term} loadTermAssignments={loadTermAssignments}
                                                 onLoad={onAssignmentsLoad}
                                                 {...intlFunctions()}/>);
        wrapper.update();
        expect(loadTermAssignments).toHaveBeenCalledTimes(1);
    });

    it("renders assignment target resource name as link", () => {
        const assignments: AssignmentInfo[] = [{
            term: {iri: term.iri},
            resource: {iri: Generator.generateUri()},
            label: "Test resource",
            types: [VocabularyUtils.TERM_ASSIGNMENT]
        }];
        loadTermAssignments = jest.fn().mockImplementation(() => Promise.resolve(assignments));
        mounted = mountWithIntl(<MemoryRouter><TermAssignments term={term} onLoad={onAssignmentsLoad}
                                                               loadTermAssignments={loadTermAssignments} {...intlFunctions()}/>
        </MemoryRouter>, {attachTo: element});
        return Promise.resolve().then(() => {
            mounted.update();
            const link = mounted.find(ResourceLink);
            expect(link.exists()).toBeTruthy();
            expect(link.text()).toContain(assignments[0].label);
        });
    });

    it("renders resource with badge showing number of suggested occurrences of term in file", () => {
        const fileIri = Generator.generateUri();
        const fileName = "Test file";
        const occurrences: TermOccurrences[] = [{
            term: {iri: term.iri},
            resource: {iri: fileIri},
            label: fileName,
            types: [VocabularyUtils.TERM_ASSIGNMENT, VocabularyUtils.TERM_OCCURRENCE, VocabularyUtils.SUGGESTED_TERM_OCCURRENCE],
            count: 2
        }];
        loadTermAssignments = jest.fn().mockImplementation(() => Promise.resolve(occurrences));
        mounted = mountWithIntl(<MemoryRouter><TermAssignments term={term} onLoad={onAssignmentsLoad}
                                                               loadTermAssignments={loadTermAssignments} {...intlFunctions()}/></MemoryRouter>, {attachTo: element});
        return Promise.resolve().then(() => {
            mounted.update();
            const badge = mounted.find(Badge);
            expect(badge.exists()).toBeTruthy();
            expect(badge.text()).toEqual("2");
        });
    });

    it("renders term assignments, term occurrences and suggested term occurrences for the same resource correctly", () => {
        const fileIri = Generator.generateUri();
        const fileName = "Test file";
        const occurrences = [{
            term: {iri: term.iri},
            resource: {iri: fileIri},
            label: fileName,
            count: 2,
            types: [VocabularyUtils.TERM_ASSIGNMENT, VocabularyUtils.TERM_OCCURRENCE]
        }, {
            term: {iri: term.iri},
            resource: {iri: fileIri},
            label: fileName,
            types: [VocabularyUtils.TERM_ASSIGNMENT]
        }, {
            term: {iri: term.iri},
            resource: {iri: fileIri},
            label: fileName,
            count: 3,
            types: [VocabularyUtils.TERM_ASSIGNMENT, VocabularyUtils.TERM_OCCURRENCE, VocabularyUtils.SUGGESTED_TERM_OCCURRENCE]
        }];
        loadTermAssignments = jest.fn().mockImplementation(() => Promise.resolve(occurrences));
        mounted = mountWithIntl(<MemoryRouter><TermAssignments term={term} onLoad={onAssignmentsLoad}
                                                               loadTermAssignments={loadTermAssignments} {...intlFunctions()}/></MemoryRouter>, {attachTo: element});
        return Promise.resolve().then(() => {
            mounted.update();
            const checks = mounted.find(GoCheck);
            expect(checks.length).toEqual(2);
            const badges = mounted.find(Badge);
            expect(badges.length).toEqual(1);
        });
    });

    it("passes correct number of unique resources to which term is assigned on load", () => {
        const fileIri = Generator.generateUri();
        const occurrences = [{
            term: {iri: term.iri},
            resource: {iri: Generator.generateUri()},
            label: "a",
            count: 2,
            types: [VocabularyUtils.TERM_ASSIGNMENT, VocabularyUtils.TERM_OCCURRENCE]
        }, {
            term: {iri: term.iri},
            resource: {iri: fileIri},
            label: "b",
            types: [VocabularyUtils.TERM_ASSIGNMENT]
        }, {
            term: {iri: term.iri},
            resource: {iri: fileIri},
            label: "b",
            count: 3,
            types: [VocabularyUtils.TERM_ASSIGNMENT, VocabularyUtils.TERM_OCCURRENCE, VocabularyUtils.SUGGESTED_TERM_OCCURRENCE]
        }];
        loadTermAssignments = jest.fn().mockImplementation(() => Promise.resolve(occurrences));
        shallow(<TermAssignments term={term} loadTermAssignments={loadTermAssignments}
                                 onLoad={onAssignmentsLoad} {...intlFunctions()}/>);
        return Promise.resolve().then(() => {
            expect(onAssignmentsLoad).toHaveBeenCalledWith(2);
        });
    });
});
