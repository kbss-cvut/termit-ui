import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import {mount, shallow} from "enzyme";
import {AssetLabel} from "../AssetLabel";
import {SKOS} from "../../../util/Namespaces";

describe("AssetLabel", () => {
    let getLabel: (iri: string) => Promise<string>;

    it("loads label using specified IRI on mount", () => {
        const iri = Generator.generateUri();
        const label = "Test";
        getLabel = jest.fn().mockImplementation(() => Promise.resolve(label));
        shallow(<AssetLabel iri={iri} getLabel={getLabel}/>);
        expect(getLabel).toHaveBeenCalledWith(iri);
    });

    it("renders loaded label on successful retrieval", () => {
        const iri = Generator.generateUri();
        const label = "Test";
        getLabel = jest.fn().mockImplementation(() => Promise.resolve(label));
        const wrapper = mount(<AssetLabel iri={iri} getLabel={getLabel}/>);
        return Promise.resolve().then(() => {
            wrapper.update();
            expect(wrapper.text()).toEqual(label);
        });
    });

    it("renders IRI passed as props when label cannot be loaded", () => {
        const iri = Generator.generateUri();
        getLabel = jest.fn().mockImplementation(() => Promise.resolve(undefined));
        const wrapper = mount(<AssetLabel iri={iri} getLabel={getLabel}/>);
        return Promise.resolve().then(() => {
            expect(wrapper.text()).toEqual(iri);
        });
    });

    it("renders prefixed IRI if label cannot be loaded", () => {
        const iri = "http://www.w3.org/2004/02/skos/core#narrower";
        getLabel = jest.fn().mockImplementation(() => Promise.resolve(undefined));
        const wrapper = mount(<AssetLabel iri={iri} getLabel={getLabel}/>);
        return Promise.resolve().then(() => {
            expect(wrapper.text()).toEqual(SKOS.prefix + ":narrower");
        });
    });

    it("renders shrunk IRI when label cannot be loaded and shrinkFullIri is specified", () => {
        const iri = "http://onto.fel.cvut.cz/ontologies/termit/test-vocabulary";
        getLabel = jest.fn().mockImplementation(() => Promise.resolve(undefined));
        const wrapper = mount(<AssetLabel iri={iri} getLabel={getLabel} shrinkFullIri={true}/>);
        return Promise.resolve().then(() => {
            expect(wrapper.text()).toEqual(".../test-vocabulary");
        });
    });

    it("renders shrunk IRI with hash when label cannot be loaded and shrinkFullIri is specified", () => {
        const iri = "http://onto.fel.cvut.cz/ontologies/termit#test-vocabulary";
        getLabel = jest.fn().mockImplementation(() => Promise.resolve(undefined));
        const wrapper = mount(<AssetLabel iri={iri} getLabel={getLabel} shrinkFullIri={true}/>);
        return Promise.resolve().then(() => {
            expect(wrapper.text()).toEqual("...#test-vocabulary");
        });
    });

    it("reloads label when new IRI is passed in props", () => {
        const iriOne = Generator.generateUri();
        const iriTwo = Generator.generateUri();
        getLabel = jest.fn().mockImplementation(() => Promise.resolve("Test"));
        const wrapper = shallow<AssetLabel>(<AssetLabel iri={iriOne} getLabel={getLabel}/>);
        expect(getLabel).toHaveBeenCalledWith(iriOne);
        return Promise.resolve().then(() => {
            wrapper.setProps({iri: iriTwo});
            wrapper.update();
            expect(getLabel).toHaveBeenCalledTimes(2);
            expect(getLabel).toHaveBeenLastCalledWith(iriTwo);
        });
    });
});
