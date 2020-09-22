import * as React from "react";
import {Annotation, isDefinitionAnnotation} from "../Annotation";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import Term from "../../../model/Term";
import {ComponentClass, ReactWrapper, shallow} from "enzyme";
import {mountWithIntlAttached} from "./AnnotationUtil";
import SimplePopupWithActions from "../SimplePopupWithActions";
import {AnnotationSpanProps} from "../Annotator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {AnnotationType} from "../AnnotationDomHelper";
import TermDefinitionAnnotation from "../TermDefinitionAnnotation";
import TermOccurrenceAnnotation from "../TermOccurrenceAnnotation";
import {MemoryRouter} from "react-router-dom";
import Generator from "../../../__tests__/environment/Generator";

function assumeProps(wrapper: ReactWrapper, component: ComponentClass<any>, props: {}) {
    expect(wrapper.find(component).props())
        .toEqual(expect.objectContaining(props));
}

function showOccurrenceViewForm(wrapper: ReactWrapper, popupComponent: ComponentClass<any>) {
    assumeProps(wrapper, popupComponent, {isOpen: false});
    wrapper.find(Annotation).simulate("click");
    assumeProps(wrapper, popupComponent, {isOpen: true});
}

jest.mock("popper.js");

describe("Annotation", () => {

    const term = new Term({
        label: "Mesto",
        iri: "http://data.iprpraha.cz/zdroj/slovnik/mpp-3/pojem/mesto"
    });
    const text = "mesta";
    const suggestedOccProps = {
        about: "_:abcdef",
        property: "ddo:je-vyskytem-termu",
        typeof: "ddo:vyskyt-termu",
        text
    };
    let assignedOccProps: any;
    // @ts-ignore
    const popupComponentClass: ComponentClass<any> = SimplePopupWithActions;

    let mockedFunctions: {
        onFetchTerm: (termIri: string) => Promise<Term>;
        onCreateTerm: (label: string, annotation: AnnotationSpanProps) => void;
        onResetSticky: () => void;
    };
    beforeEach(() => {
        assignedOccProps = {
            ...suggestedOccProps,
            resource: term.iri,
            score: "1.0",
        };
        mockedFunctions = {
            onFetchTerm: jest.fn().mockResolvedValue(term),
            onCreateTerm: jest.fn(),
            onResetSticky: jest.fn()
        }
    });

    /* --- recognizes occurrence --- */
    it("recognizes suggested occurrence", () => {
        const wrapper = shallow(
            <Annotation
                {...mockedFunctions}
                {...intlFunctions()}
                {...suggestedOccProps}
            />);

        expect(wrapper.find(".suggested-term-occurrence").exists()).toBeTruthy();
    });

    it("recognizes assigned occurrence", () => {
        const wrapper = shallow(
            <Annotation
                {...mockedFunctions}
                {...intlFunctions()}
                {...assignedOccProps}
            />);

        return Promise.resolve().then(() => expect(wrapper.exists(".assigned-term-occurrence")).toBeTruthy());
    });

    it("fetches assigned term on mount", () => {
        shallow(<Annotation
            {...mockedFunctions}
            {...intlFunctions()}
            {...assignedOccProps}
        />);
        expect(mockedFunctions.onFetchTerm).toHaveBeenCalledWith(assignedOccProps.resource);
    });

    it("fetches assigned term when it changes on update", () => {
        const wrapper = shallow(<Annotation
            {...mockedFunctions}
            {...intlFunctions()}
            {...assignedOccProps}
        />);
        const newResource = Generator.generateUri();
        wrapper.setProps({resource: newResource});
        wrapper.update();
        expect(mockedFunctions.onFetchTerm).toHaveBeenCalledWith(newResource);
    });

    it("recognizes invalid occurrence", () => {
        mockedFunctions.onFetchTerm = jest.fn().mockRejectedValue("Term not found.");
        const wrapper = shallow(
            <Annotation
                {...intlFunctions()}
                {...assignedOccProps}
                {...mockedFunctions}
            />);

        // Had to use double promise because the test evaluation was being called before catch handler in the component
        return Promise.resolve().then(() => {
            return Promise.resolve().then(() => {
                expect(wrapper.exists(".invalid-term-occurrence")).toBeTruthy();
            });
        });
    });

    it("recognizes term definition", () => {
        const props = Object.assign({}, assignedOccProps, {
            typeof: AnnotationType.DEFINITION,
            property: VocabularyUtils.IS_DEFINITION_OF_TERM
        });
        mockedFunctions.onFetchTerm = jest.fn().mockResolvedValue(term);
        const wrapper = shallow(
            <Annotation
                {...mockedFunctions}
                {...intlFunctions()}
                {...props}
            />);

        return Promise.resolve().then(() => {
            expect(wrapper.exists(TermDefinitionAnnotation)).toBeTruthy();
        });
    });

    it("recognizes pending term definition", () => {
        const props = Object.assign({}, assignedOccProps, {
            typeof: AnnotationType.DEFINITION,
            property: VocabularyUtils.IS_DEFINITION_OF_TERM
        });
        // No term assigned, yet
        delete props.resource;
        const wrapper = shallow(
            <Annotation
                {...mockedFunctions}
                {...intlFunctions()}
                {...props}
            />);

        return Promise.resolve().then(() => {
            expect(wrapper.exists(".pending-term-definition")).toBeTruthy();
        });
    });

    /* --- pinning --- */
    it("renders occurrence view form on mouse leave if pinned", () => {
        const wrapper = mountWithIntlAttached(<MemoryRouter>
            <Annotation
                {...mockedFunctions}
                {...intlFunctions()}
                {...assignedOccProps}
            /></MemoryRouter>);

        showOccurrenceViewForm(wrapper, popupComponentClass);
        expect(wrapper.find(Annotation).state().detailOpened).toBeTruthy();


        wrapper.find(Annotation).simulate("mouseLeave");

        expect(wrapper.find(Annotation).state().detailOpened).toBeTruthy();
    });

    it("automatically renders annotation popup open on mount if sticky is passed", () => {
        const wrapper = shallow<Annotation>(<Annotation {...mockedFunctions} {...intlFunctions()} {...assignedOccProps}
                                                        sticky={true}/>);
        const occurrencePopup = wrapper.find(TermOccurrenceAnnotation);
        expect(occurrencePopup.prop("isOpen")).toBeTruthy();
    });

    it("renders annotation popup open and pinned when sticky becomes true on update", () => {
        const wrapper = shallow<Annotation>(
            <Annotation {...mockedFunctions} {...intlFunctions()} {...assignedOccProps}/>);
        let occurrencePopup = wrapper.find(TermOccurrenceAnnotation);
        expect(occurrencePopup.prop("isOpen")).toBeFalsy();
        expect(occurrencePopup.prop("pinned")).toBeFalsy();
        wrapper.setProps({sticky: true});
        wrapper.update();
        occurrencePopup = wrapper.find(TermOccurrenceAnnotation);
        expect(occurrencePopup.prop("isOpen")).toBeTruthy();
    });

    // This means that the annotation is new, so let the user directly edit it
    it("renders annotation popup open and in edit mode on mount if sticky is passed and no term is associated with annotation", () => {
        assignedOccProps.resource = "";
        const wrapper = shallow<Annotation>(<Annotation {...mockedFunctions} {...intlFunctions()} {...assignedOccProps}
                                                        sticky={true}/>);
        const occurrencePopup = wrapper.find(TermOccurrenceAnnotation);
        expect(occurrencePopup.prop("isOpen")).toBeTruthy();
    });

    /* --- registers actions --- */
    it("registers remove action if onRemove is bound", () => {
        const wrapper = mountWithIntlAttached(<MemoryRouter>
            <Annotation
                {...mockedFunctions}
                {...intlFunctions()}
                sticky={true}
                {...assignedOccProps}
                onRemove={jest.fn()}/>
        </MemoryRouter>);

        expect(wrapper.find(popupComponentClass)
            .props().actions.some((a: any) => a.key === "annotation.remove")
        ).toEqual(true);
    });

    it("registers close action for occurrence form", () => {
        const wrapper = mountWithIntlAttached(<MemoryRouter>
            <Annotation
                {...mockedFunctions}
                {...intlFunctions()}
                {...assignedOccProps}
                sticky={true}/>
        </MemoryRouter>);

        expect(wrapper.find(popupComponentClass)
            .props().actions.some((a: any) => a.key === "annotation.close")
        ).toEqual(true);
    });

    it("renders annotation in div when specified", () => {
        mockedFunctions.onFetchTerm = jest.fn().mockResolvedValue(term);
        const wrapper = shallow(
            <Annotation
                {...mockedFunctions}
                {...intlFunctions()}
                {...assignedOccProps}
                tag="div"
            />);
        expect(wrapper.type()).toEqual("div");
    });

    describe("onCreateTerm", () => {
        it("passes content to term creation handler when it is available", () => {
            const props: any = Object.assign({}, assignedOccProps);
            props.content = "test content";
            const wrapper = shallow<Annotation>(<Annotation {...mockedFunctions} {...intlFunctions()} {...props}/>);
            wrapper.instance().onCreateTerm();
            expect(mockedFunctions.onCreateTerm).toHaveBeenCalled();
            expect((mockedFunctions.onCreateTerm as jest.Mock).mock.calls[0][0]).toEqual(props.content);
        });

        it("passes the text of the annotation to term creation handler when content is not available", () => {
            const wrapper = shallow<Annotation>(
                <Annotation {...mockedFunctions} {...intlFunctions()} {...assignedOccProps}/>);
            wrapper.instance().onCreateTerm();
            expect(mockedFunctions.onCreateTerm).toHaveBeenCalled();
            expect((mockedFunctions.onCreateTerm as jest.Mock).mock.calls[0][0]).toEqual(assignedOccProps.text);
        });

        it("passes current annotation as the second argument to term creation handler", () => {
            const props: any = Object.assign({}, assignedOccProps);
            props.content = "test content";
            const wrapper = shallow<Annotation>(<Annotation {...mockedFunctions} {...intlFunctions()} {...props}/>);
            wrapper.instance().onCreateTerm();
            expect(mockedFunctions.onCreateTerm).toHaveBeenCalled();
            expect((mockedFunctions.onCreateTerm as jest.Mock).mock.calls[0][1]).toEqual({
                about: assignedOccProps.about,
                property: assignedOccProps.property,
                typeof: assignedOccProps.typeof,
                resource: assignedOccProps.resource
            });
        });

        it("closes the detail popup", () => {
            const wrapper = shallow<Annotation>(
                <Annotation {...mockedFunctions} {...intlFunctions()} {...assignedOccProps}/>);
            wrapper.setState({detailOpened: true});
            wrapper.update();
            expect(wrapper.state().detailOpened).toBeTruthy();
            wrapper.instance().onCreateTerm();
            wrapper.update();
            expect(wrapper.state().detailOpened).toBeFalsy();
        });
    });

    describe("onCloseDetail", () => {
        it("resets sticky status if annotation was sticky", () => {
            const wrapper = shallow<Annotation>(
                <Annotation sticky={true} {...mockedFunctions} {...intlFunctions()} {...assignedOccProps}/>);
            wrapper.instance().onCloseDetail();
            expect(mockedFunctions.onResetSticky).toHaveBeenCalled();
        });
    });

    describe("onClick", () => {
        it("closes annotation if it were previously open", () => {
            const wrapper = mountWithIntlAttached(<MemoryRouter>
                <Annotation
                    {...mockedFunctions}
                    {...intlFunctions()}
                    sticky={true}
                    {...assignedOccProps}
                /></MemoryRouter>);
            assumeProps(wrapper, popupComponentClass, {isOpen: true});

            wrapper.find("#idabcdef").simulate("click");
            expect((wrapper.find(Annotation).state() as any).detailOpened).toBeFalsy();
        });
    });

    describe("onSelectTerm", () => {
        // Bug #1359, #1360
        it("sets current term to the selected one", () => {
            const wrapper = shallow<Annotation>(
                <Annotation sticky={true} {...mockedFunctions} {...intlFunctions()} {...assignedOccProps}/>);
            return Promise.resolve().then(() => {
                expect(wrapper.state().term).toEqual(term);
                const selectedTerm = Generator.generateTerm();
                wrapper.instance().onSelectTerm(selectedTerm);
                wrapper.update();
                expect(wrapper.state().term).toEqual(selectedTerm);
            });
        });
    });
});

describe("isDefinitionAnnotation", () => {
    it("returns true for definition annotation", () => {
        expect(isDefinitionAnnotation(AnnotationType.DEFINITION)).toBeTruthy();
    });

    it("returns false for occurrence annotation", () => {
        expect(isDefinitionAnnotation(AnnotationType.OCCURRENCE)).toBeFalsy();
    });
});
