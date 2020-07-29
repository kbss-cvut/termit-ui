import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import Term from "../../../model/Term";
import {shallow} from "enzyme";
import {TermDefinitionAnnotation} from "../TermDefinitionAnnotation";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import SimplePopupWithActions from "../SimplePopupWithActions";
import AnnotationTerms from "../AnnotationTerms";
import TermDefinitionAnnotationView from "../TermDefinitionAnnotationView";

describe("TermDefinitionAnnotation", () => {

    const annotationProps = {
        target: "id_:123",
        resource: Generator.generateUri(),
        text: "Test definition"
    };

    let actions: {
        onRemove: () => void;
        onSelectTerm: (term: Term | null) => void;
        onToggleDetailOpen: () => void;
        onClose: () => void;
    };

    beforeEach(() => {
        actions = {
            onRemove: jest.fn(),
            onSelectTerm: jest.fn(),
            onToggleDetailOpen: jest.fn(),
            onClose: jest.fn()
        };
    });

    it("renders term definition view by default", () => {
        const wrapper = shallow(<TermDefinitionAnnotation isOpen={true}
                                                          term={Generator.generateTerm()} {...annotationProps} {...actions} {...intlFunctions()}/>);
        expect(wrapper.find(SimplePopupWithActions).prop("component").type).toEqual(TermDefinitionAnnotationView);
    });

    it("renders term definition edit when no term is provided", () => {
        const wrapper = shallow(<TermDefinitionAnnotation isOpen={true}
                                                          term={null} {...annotationProps} {...actions} {...intlFunctions()}/>);
        expect(wrapper.find(SimplePopupWithActions).prop("component").type).toEqual(AnnotationTerms);
    });
});
