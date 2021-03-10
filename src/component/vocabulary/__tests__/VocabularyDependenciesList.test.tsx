import * as React from "react";
import {VocabularyDependenciesList} from "../VocabularyDependenciesList";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyIriLink from "../VocabularyIriLink";
import Workspace from "../../../model/Workspace";
import * as redux from "react-redux";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {MemoryRouter} from "react-router";

jest.mock("../../misc/AssetLabel", () => () => <>Test</>);

describe("VocabularyDependenciesList", () => {

    it("renders links to provided vocabularies", () => {
        const vocabularies = [{
            iri: Generator.generateUri(),
        }, {
            iri: Generator.generateUri()
        }];
        const workspace = new Workspace({
            vocabularies,
            iri: Generator.generateUri(),
            label: "Test"
        });
        jest.spyOn(redux, "useSelector").mockReturnValue(workspace);
        const wrapper = mountWithIntl(<MemoryRouter><VocabularyDependenciesList
            vocabularies={vocabularies}/></MemoryRouter>);
        expect(wrapper.find(VocabularyIriLink).length).toEqual(2);
    });
});
