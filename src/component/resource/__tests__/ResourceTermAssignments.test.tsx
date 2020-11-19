import * as React from "react";
import Resource from "../../../model/Resource";
import Generator from "../../../__tests__/environment/Generator";
import {shallow} from "enzyme";
import {ResourceTermAssignments} from "../ResourceTermAssignments";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import VocabularyUtils from "../../../util/VocabularyUtils";
import TermLink from "../../term/TermLink";
import {ResourceTermAssignments as TermAssignmentInfo} from "../../../model/ResourceTermAssignments";
import {MemoryRouter} from "react-router";
import AppNotification from "../../../model/AppNotification";
import NotificationType from "../../../model/NotificationType";
import File from "../../../model/File";

describe("ResourceTermAssignments", () => {
    const file: File = new File({
        iri: Generator.generateUri(),
        label: "test-file.html",
        types: [VocabularyUtils.FILE]
    });
    let onLoadAssignments: (resource: Resource) => Promise<TermAssignmentInfo[]>;
    let consumeNotification: (notification: AppNotification) => void;

    beforeEach(() => {
        onLoadAssignments = jest.fn().mockImplementation(() => Promise.resolve([]));
        consumeNotification = jest.fn();
    });

    it("loads term assignments on mount", () => {
        shallow(<ResourceTermAssignments resource={file} notifications={[]}
                                         consumeNotification={consumeNotification}
                                         loadTermAssignments={onLoadAssignments} {...intlFunctions()}/>);
        expect(onLoadAssignments).toHaveBeenCalledWith(file);
    });

    it("reloads term assignments when different resource is passed in props", () => {
        const differentResource: Resource = new Resource({
            iri: Generator.generateUri(),
            label: "Different resource"
        });
        const wrapper = shallow(<ResourceTermAssignments resource={file} notifications={[]}
                                                         consumeNotification={consumeNotification}
                                                         loadTermAssignments={onLoadAssignments} {...intlFunctions()}/>);
        wrapper.setProps({resource: differentResource});
        wrapper.update();
        expect(onLoadAssignments).toHaveBeenCalledWith(differentResource);
        expect(onLoadAssignments).toHaveBeenCalledTimes(2);
    });

    it("does nothing on update when resource is the same", () => {
        const wrapper = shallow(<ResourceTermAssignments resource={file} notifications={[]}
                                                         consumeNotification={consumeNotification}
                                                         loadTermAssignments={onLoadAssignments} {...intlFunctions()}/>);
        wrapper.setProps({resource: file});
        wrapper.update();
        expect(onLoadAssignments).toHaveBeenCalledWith(file);
        expect(onLoadAssignments).toHaveBeenCalledTimes(1);
    });

    it("renders assigned terms", () => {
        const assignments: TermAssignmentInfo[] = [{
            term: {
                iri: Generator.generateUri(),
                label: {"cs" : "Test term"}
            },
            label: "Test term",
            resource: file,
            vocabulary: {
                iri: Generator.generateUri()
            },
            types: [VocabularyUtils.TERM_ASSIGNMENT]
        }];
        onLoadAssignments = jest.fn().mockImplementation(() => Promise.resolve(assignments));
        const wrapper = mountWithIntl(<MemoryRouter><ResourceTermAssignments resource={file} notifications={[]}
                                                                             consumeNotification={consumeNotification}
                                                                             loadTermAssignments={onLoadAssignments} {...intlFunctions()}/></MemoryRouter>);
        return Promise.resolve().then(() => {
            wrapper.update();
            expect(wrapper.find(TermLink).length).toEqual(1);
            expect(wrapper.find(".m-term-assignment").length).toEqual(1);
        });
    });

    it("reloads assignments when text analysis finished notification is received", () => {
        const wrapper = shallow<ResourceTermAssignments>(<ResourceTermAssignments resource={file} notifications={[]}
                                                                                  consumeNotification={consumeNotification}
                                                                                  loadTermAssignments={onLoadAssignments} {...intlFunctions()}/>);
        const notification: AppNotification = {source: {type: NotificationType.TEXT_ANALYSIS_FINISHED}};
        wrapper.setProps({notifications: [notification]});
        wrapper.update();
        // First call on mount, second after the notification
        expect(onLoadAssignments).toHaveBeenCalledTimes(2);
        // cleanup
        wrapper.setProps({notifications: []});
    });

    it("consumes the published text analysis finished notification", () => {
        const wrapper = shallow<ResourceTermAssignments>(<ResourceTermAssignments resource={file} notifications={[]}
                                                                                  consumeNotification={consumeNotification}
                                                                                  loadTermAssignments={onLoadAssignments} {...intlFunctions()}/>);
        const notification: AppNotification = {source: {type: NotificationType.TEXT_ANALYSIS_FINISHED}};
        wrapper.setProps({notifications: [notification]});
        wrapper.update();
        expect(consumeNotification).toHaveBeenCalledWith(notification);
        // cleanup
        wrapper.setProps({notifications: []});
    });

    // Occurrences are not expected for Resources of other types than File
    it("does not render term occurrences attributes for non-File resources", () => {
        const resource = new Resource({
            iri: Generator.generateUri(),
            label: "Test resource"
        });
        const term = {iri: Generator.generateUri(), label: "Test term"};
        const assignments = [{
            term: {
                iri: term.iri
            },
            label: term.label,
            resource: file,
            vocabulary: {
                iri: Generator.generateUri()
            },
            count: 2,
            types: [VocabularyUtils.TERM_ASSIGNMENT]
        }];
        onLoadAssignments = jest.fn().mockImplementation(() => Promise.resolve(assignments));
        const wrapper = mountWithIntl(<MemoryRouter><ResourceTermAssignments resource={resource} notifications={[]}
                                                                             consumeNotification={consumeNotification}
                                                                             loadTermAssignments={onLoadAssignments} {...intlFunctions()}/></MemoryRouter>);
        return Promise.resolve().then(() => {
            expect(wrapper.exists(".m-resource-term-occurrences-container")).toBeFalsy();
        });
    });

    it("resets rendered assignments to empty when resource changes and new assignments are being loaded", () => {
        const differentResource: Resource = new Resource({
            iri: Generator.generateUri(),
            label: "Different resource"
        });
        const wrapper = shallow<ResourceTermAssignments>(<ResourceTermAssignments resource={file} notifications={[]}
                                                                                  consumeNotification={consumeNotification}
                                                                                  loadTermAssignments={onLoadAssignments} {...intlFunctions()}/>);
        const existingAssignments: TermAssignmentInfo[] = [{
            term: {
                iri: Generator.generateUri(),
                label: { "cs" : "Test term" }
            },
            label: "Test term",
            resource: file,
            vocabulary: {
                iri: Generator.generateUri()
            },
            types: [VocabularyUtils.TERM_ASSIGNMENT]
        }];
        wrapper.setState({assignments: existingAssignments});
        wrapper.setProps({resource: differentResource});
        wrapper.update();
        expect(wrapper.state().assignments.length).toEqual(0);
    });
});
