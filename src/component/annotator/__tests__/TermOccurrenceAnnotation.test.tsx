import Term from "../../../model/Term";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import * as React from "react";
import {TermOccurrenceAnnotation} from "../TermOccurrenceAnnotation";
import {shallow} from "enzyme";
import SimplePopupWithActions from "../SimplePopupWithActions";
import {AnnotationClass, AnnotationOrigin} from "../Annotation";
import Generator from "../../../__tests__/environment/Generator";
import {withHooks} from "jest-react-hooks-shallow";

describe("TermOccurrenceAnnotation", () => {

    const text = "mesta";
    const suggestedOccProps = {
        about: "_:-421713841",
        property: "ddo:je-vyskytem-termu",
        typeof: "ddo:vyskyt-termu",
        target: "test",
        text
    };

    let actions: {
        onRemove: () => void;
        onSelectTerm: (term: Term | null) => void;
        onToggleDetailOpen: () => void;
        onCreateTerm: () => void;
        onClose: () => void;
    };

    beforeEach(() => {
        actions = {
            onRemove: jest.fn(),
            onSelectTerm: jest.fn(),
            onToggleDetailOpen: jest.fn(),
            onCreateTerm: jest.fn(),
            onClose: jest.fn()
        };
    });

    it("does not render confirm button for suggested occurrence of an unknown term", () => {
        const wrapper = shallow(<TermOccurrenceAnnotation
            {...actions}
            {...intlFunctions()}
            {...suggestedOccProps}
            {...intlFunctions()}
            annotationClass={AnnotationClass.SUGGESTED_OCCURRENCE} annotationOrigin={AnnotationOrigin.PROPOSED}
            isOpen={true}/>);
        const buttons = wrapper.find(SimplePopupWithActions).prop("actions");
        expect(buttons.length).toBeGreaterThan(0);
        const confirmButton = buttons.find(b => b.key === "annotation.confirm");
        expect(confirmButton).not.toBeDefined();
    });

    it("switches from editing to view mode when a term is provided", () => {
        withHooks(() => {
            const wrapper = shallow(<TermOccurrenceAnnotation
                {...actions}
                {...intlFunctions()}
                {...suggestedOccProps}
                {...intlFunctions()}
                annotationClass={AnnotationClass.SUGGESTED_OCCURRENCE} annotationOrigin={AnnotationOrigin.PROPOSED}
                isOpen={true}/>);
            const term = Generator.generateTerm();
            wrapper.setProps({term});
            wrapper.update();
            wrapper.update();
            const buttons = wrapper.find(SimplePopupWithActions).prop("actions");
            expect(buttons.find(b => b.key === "annotation.edit")).toBeDefined();
        });
    });
});
