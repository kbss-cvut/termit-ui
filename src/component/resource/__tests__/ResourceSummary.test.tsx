import * as React from "react";
import VocabularyUtils, {IRI} from "../../../util/VocabularyUtils";
import {shallow} from "enzyme";
import {ResourceSummary} from "../ResourceSummary";
import Resource from "../../../model/Resource";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";

describe("ResourceSummary", () => {

    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/resources/";
    const resourceName = "test-resource";

    let loadResource: (iri: IRI) => Promise<any>;
    let saveResource: (resource: Resource) => Promise<any>;
    let removeResource: (resource: Resource) => Promise<any>;

    let resourceHandlers: any;

    beforeEach(() => {
        loadResource = jest.fn().mockImplementation(() => Promise.resolve());
        saveResource = jest.fn().mockImplementation(() => Promise.resolve());
        removeResource = jest.fn().mockImplementation(() => Promise.resolve());
        resourceHandlers = {
            loadResource,
            saveResource,
            removeResource
        };
    });

    it("invokes remove action and closes remove confirmation dialog on remove", () => {
        const resource = new Resource({
            iri: namespace + resourceName,
            label: resourceName
        });
        const wrapper = shallow<ResourceSummary>(<ResourceSummary
            resource={resource} {...resourceHandlers} {...intlFunctions()}/>);
        wrapper.instance().onRemove();
        expect(removeResource).toHaveBeenCalledWith(resource);
        expect(wrapper.state("showRemoveDialog")).toBeFalsy();
    });

    it("reloads resource after successful save", () => {
        const resource = new Resource({
            iri: namespace + resourceName,
            label: resourceName
        });
        const wrapper = shallow<ResourceSummary>(<ResourceSummary
            resource={resource} {...resourceHandlers} {...intlFunctions()}/>);
        wrapper.instance().onSave(resource);
        return Promise.resolve().then(() => {
            expect(loadResource).toHaveBeenCalledWith(VocabularyUtils.create(resource.iri));
        });
    });
});
