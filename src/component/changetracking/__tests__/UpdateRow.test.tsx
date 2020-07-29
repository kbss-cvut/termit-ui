import * as React from "react";
import {UpdateRecord} from "../../../model/changetracking/UpdateRecord";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {shallow} from "enzyme";
import {UpdateRow} from "../UpdateRow";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import OutgoingLink from "../../misc/OutgoingLink";
import {Label} from "reactstrap";

describe("UpdateRow", () => {

    it("renders id value as an outgoing link", () => {
        const newValue = Generator.generateUri();
        const record = new UpdateRecord({
            iri: Generator.generateUri(),
            timestamp: Date.now(),
            author: Generator.generateUser(),
            changedEntity: {iri: Generator.generateUri()},
            changedAttribute: {iri: "http://purl.org/dc/terms/source"},
            newValue: {iri: newValue},
            types: [VocabularyUtils.UPDATE_EVENT]
        });
        const wrapper = shallow(<UpdateRow record={record} {...intlFunctions()}/>);
        const link = wrapper.find(OutgoingLink);
        expect(link.exists()).toBeTruthy();
        expect(link.prop("iri")).toEqual(newValue);
    });

    it("renders id value as outgoing link and literal as literal in combined value", () => {
        const idValue = Generator.generateUri();
        const literalValue = "117";
        const record = new UpdateRecord({
            iri: Generator.generateUri(),
            timestamp: Date.now(),
            author: Generator.generateUser(),
            changedEntity: {iri: Generator.generateUri()},
            changedAttribute: {iri: "http://purl.org/dc/terms/source"},
            originalValue: [{iri: idValue}, literalValue],
            types: [VocabularyUtils.UPDATE_EVENT]
        });
        const wrapper = shallow(<UpdateRow record={record} {...intlFunctions()}/>);
        const link = wrapper.find(OutgoingLink);
        expect(link.exists()).toBeTruthy();
        expect(link.prop("iri")).toEqual(idValue);
        const label = wrapper.find(Label);
        expect(label.exists()).toBeTruthy();
        expect(label.children().text()).toEqual(literalValue);
    });
});
