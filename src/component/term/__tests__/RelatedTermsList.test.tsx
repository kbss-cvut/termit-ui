import Generator from "../../../__tests__/environment/Generator";
import Term, {TermInfo} from "../../../model/Term";
import {langString} from "../../../model/MultilingualString";
import * as redux from "react-redux";
import {DefinitionallyRelatedTerms} from "../../../model/TermItState";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import RelatedTermsList from "../RelatedTermsList";
import Constants from "../../../util/Constants";
import TermLink from "../TermLink";
import {MemoryRouter} from "react-router";
import {Badge} from "reactstrap";
import {ReactWrapper} from "enzyme";
import {i18n} from "../../../__tests__/environment/IntlUtil";

describe("RelatedTermsList", () => {

    let term: Term;

    beforeEach(() => {
        term = Generator.generateTerm(Generator.generateUri());
    });

    it("renders terms related via also definition twice, once without badge and once with definition badge", () => {
        const relatedTerm: TermInfo = {
            iri: Generator.generateUri(),
            label: langString("Related term"),
            vocabulary: {iri: Generator.generateUri()}
        };
        term.relatedTerms = [relatedTerm];
        const defRelatedTerms: DefinitionallyRelatedTerms = {
            targeting: [Generator.generateOccurrenceOf(relatedTerm)],
            of: []
        };
        defRelatedTerms.targeting[0].target.source.iri = term.iri;
        jest.spyOn(redux, "useSelector").mockReturnValue(defRelatedTerms);

        const wrapper = mountWithIntl(<MemoryRouter><RelatedTermsList term={term}
                                                                      language={Constants.DEFAULT_LANGUAGE}/></MemoryRouter>);
        const links = wrapper.find(TermLink);
        expect(links.length).toEqual(2);
        const badges = wrapper.find(Badge);
        expect(badges.filterWhere((b: ReactWrapper) => b.text().indexOf(i18n("term.metadata.definition")) !== -1).length).toEqual(1);
    });
});
