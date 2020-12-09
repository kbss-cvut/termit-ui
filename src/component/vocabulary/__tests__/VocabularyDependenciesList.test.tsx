import * as React from "react";
import {shallow} from "enzyme";
import {VocabularyDependenciesList} from "../VocabularyDependenciesList";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyIriLink from "../VocabularyIriLink";

describe("VocabularyDependenciesList", () => {

    it("renders nothing when no dependencies are provided", () => {
        const wrapper = shallow(<VocabularyDependenciesList {...intlFunctions()}/>);
        expect(wrapper.isEmptyRender()).toBeTruthy();
    });

    it("renders links to provided vocabularies", () => {
        const vocabularies = [{
            iri: Generator.generateUri(),
        }, {
            iri: Generator.generateUri()
        }];
        const wrapper = shallow(<VocabularyDependenciesList vocabularies={vocabularies} {...intlFunctions()}/>);
        expect(wrapper.find(VocabularyIriLink).length).toEqual(2);
    });
});
