import * as React from "react";
import {createMemoryHistory, Location} from "history";
import {match as Match} from "react-router";
import {shallow} from "enzyme";
import Resource, {EMPTY_RESOURCE} from "../../../model/Resource";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import VocabularyUtils, {IRI} from "../../../util/VocabularyUtils";
import {ResourceSummaryRoute} from "../ResourceSummaryRoute";
import File from "../../../model/File";
import FileSummary from "../file/FileSummary";
import ResourceSummary from "../ResourceSummary";
import Document from "../../../model/Document";
import DocumentSummary from "../document/DocumentSummary";
import Routes from "../../../util/Routes";

describe("ResourceSummaryRoute", () => {

    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/resources/";
    const resourceName = "test-resource";

    let loadResource: (iri: IRI) => Promise<any>;
    let clearResource: () => void;

    let resourceHandlers: any;

    let location: Location;
    const history = createMemoryHistory();
    let match: Match<any>;

    beforeEach(() => {
        loadResource = jest.fn().mockImplementation(() => Promise.resolve());
        clearResource = jest.fn();
        resourceHandlers = {loadResource, clearResource};
        location = {
            pathname: "/resource/" + resourceName,
            search: "?namespace=" + namespace,
            hash: "",
            state: {}
        };
        match = {
            params: {
                name: resourceName,
            },
            path: location.pathname,
            isExact: true,
            url: "http://localhost:3000/" + location.pathname
        };
    });

    it("loads resource on mount", () => {
        shallow(<ResourceSummaryRoute
            resource={EMPTY_RESOURCE} {...resourceHandlers} {...intlFunctions()}
            history={history}
            location={location}
            match={match}/>);
        expect(loadResource).toHaveBeenCalledWith({fragment: resourceName, namespace});
    });

    it("does not attempt to reload resource on update when it is empty resource", () => {
        const wrapper = shallow(<ResourceSummaryRoute
            resource={EMPTY_RESOURCE} {...resourceHandlers} {...intlFunctions()}
            history={history} location={location} match={match}/>);
        wrapper.setProps({resource: EMPTY_RESOURCE});
        wrapper.update();
        expect(loadResource).toHaveBeenCalledTimes(1);
    });

    it("reloads resource when new resource identifier is passed in location props", () => {
        const oldResource = new Resource({iri: namespace + resourceName, label: resourceName, terms: []});
        const wrapper = shallow(<ResourceSummaryRoute
            resource={oldResource} {...resourceHandlers} {...intlFunctions()}
            history={history} location={location} match={match}/>);
        const newFragment = "another-resource";
        const newMatch = Object.assign({}, match);
        newMatch.params.name = newFragment;
        wrapper.setProps({match: newMatch});
        expect(loadResource).toHaveBeenCalledWith({fragment: newFragment, namespace});
        wrapper.setProps({resource: new Resource({iri: namespace + newFragment, label: newFragment, terms: []})});
    });

    it("does not attempt to reload resource when namespace is missing in location and fragment is identical", () => {
        const resource = new Resource({
            iri: "http://onto.fel.cvut.cz/ontologies/termit/resources/" + resourceName,
            label: resourceName
        });
        const wrapper = shallow(<ResourceSummaryRoute
            resource={EMPTY_RESOURCE} {...resourceHandlers} {...intlFunctions()}
            history={history} location={location} match={match}/>);
        wrapper.setProps({resource});
        wrapper.update();
        expect(loadResource).toHaveBeenCalledTimes(1);
    });

    it("clears resource on unmnount", () => {
        const resource = new Resource({
            iri: namespace + resourceName,
            label: resourceName
        });
        const wrapper = shallow(<ResourceSummaryRoute
            resource={resource} {...resourceHandlers} {...intlFunctions()}
            history={history} location={location} match={match}/>);
        return Promise.resolve().then(() => {
            wrapper.unmount();
            expect(clearResource).toHaveBeenCalled();
        });
    });

    it("does not clear resource on unmount when transitioning to annotation of the current resource", () => {
        const resource = new Resource({
            iri: namespace + resourceName,
            label: resourceName
        });
        const wrapper = shallow(<ResourceSummaryRoute
            resource={resource} {...resourceHandlers} {...intlFunctions()}
            history={history} location={location} match={match}/>);
        const newLocation = Routes.annotateFile.path.replace(":name", resourceName);
        history.push(newLocation);
        wrapper.update();
        return Promise.resolve().then(() => {
            wrapper.unmount();
            expect(clearResource).not.toHaveBeenCalled();
        });
    });

    it("renders FileSummary component for File resource", () => {
        const file = new File({
            iri: namespace + resourceName,
            label: resourceName,
            types: [VocabularyUtils.FILE, VocabularyUtils.RESOURCE]
        });
        const wrapper = shallow(<ResourceSummaryRoute
            resource={file} {...resourceHandlers} {...intlFunctions()}
            history={history} location={location} match={match}/>);
        expect(wrapper.exists(FileSummary)).toBeTruthy();
        expect(wrapper.exists(ResourceSummary)).toBeFalsy();
    });

    it("renders ResourceSummary component for plain Resource", () => {
        const resource = new Resource({
            iri: namespace + resourceName,
            label: resourceName,
            types: [VocabularyUtils.RESOURCE]
        });
        const wrapper = shallow(<ResourceSummaryRoute
            resource={resource} {...resourceHandlers} {...intlFunctions()}
            history={history} location={location} match={match}/>);
        expect(wrapper.exists(ResourceSummary)).toBeTruthy();
        expect(wrapper.exists(FileSummary)).toBeFalsy();
    });

    it("renders DocumentSummary component for Document resource", () => {
        const doc = new Document({
            iri: namespace + resourceName,
            label: resourceName,
            files: [],
            types: [VocabularyUtils.DOCUMENT, VocabularyUtils.RESOURCE]
        });
        const wrapper = shallow(<ResourceSummaryRoute
            resource={doc} {...resourceHandlers} {...intlFunctions()}
            history={history} location={location} match={match}/>);
        expect(wrapper.exists(DocumentSummary)).toBeTruthy();
        expect(wrapper.exists(ResourceSummary)).toBeFalsy();
    });
});
