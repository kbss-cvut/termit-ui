import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import Workspace from "../../../model/Workspace";
import * as redux from "react-redux";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {MemoryRouter} from "react-router";
import ParentTermsList from "../ParentTermsList";
import Constants from "../../../util/Constants";
import TermLink from "../TermLink";
import {OutgoingLink} from "../../misc/OutgoingLink";

describe("ParentTermsList", () => {

    const vocabularyIri = Generator.generateUri();
    const workspace = new Workspace({
        iri: Generator.generateUri(),
        label: "test",
        vocabularies: [{iri: vocabularyIri}]
    });

    it("renders parent terms in current workspace as links", () => {
        jest.spyOn(redux, "useSelector").mockReturnValue(workspace);
        const parentTerms = [Generator.generateTerm(vocabularyIri), Generator.generateTerm(vocabularyIri)];
        const wrapper = mountWithIntl(<MemoryRouter><ParentTermsList language={Constants.DEFAULT_LANGUAGE}
                                                                     parentTerms={parentTerms}/></MemoryRouter>);
        expect(wrapper.find(TermLink).length).toEqual(parentTerms.length);
    });

    it("renders parent terms outside current workspace as outgoing links", () => {
        jest.spyOn(redux, "useSelector").mockReturnValue(workspace);
        const parentTerms = [Generator.generateTerm(vocabularyIri), Generator.generateTerm(Generator.generateUri())];
        const wrapper = mountWithIntl(<MemoryRouter><ParentTermsList language={Constants.DEFAULT_LANGUAGE}
                                                                     parentTerms={parentTerms}/></MemoryRouter>);
        expect(wrapper.find(TermLink).length).toEqual(1);
        expect(wrapper.findWhere(w => w.type() === OutgoingLink && w.prop("iri") === parentTerms[1].iri).exists()).toBeTruthy();
    });
});
