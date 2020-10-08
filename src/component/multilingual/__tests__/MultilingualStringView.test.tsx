import * as React from "react";
import {mountWithIntlAttached} from "../../annotator/__tests__/AnnotationUtil";
import {MultilingualStringView} from "../MultilingualStringView";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import MultilingualString, {getLocalized} from "../../../model/MultilingualString";
import {PopoverBody} from "reactstrap";
import Constants from "../../../util/Constants";

jest.mock("popper.js");

describe("MultilingualStringView", () => {

    const value: MultilingualString = {
        "cs": "Budova",
        "en": "Building"
    }

    describe("popover", () => {

        it("renders when mouse is over translations icon", async () => {
            const wrapper = mountWithIntlAttached(<MultilingualStringView id="test"
                                                                          value={value} {...intlFunctions()}/>);
            expect(wrapper.exists(PopoverBody)).toBeFalsy();
            const toggle = wrapper.find(".m-translations-toggle").first();
            toggle.simulate("mouseenter");
            expect(wrapper.exists(PopoverBody)).toBeTruthy();
        });

        it("does not render when mouse leaves translations icon", async () => {
            const wrapper = mountWithIntlAttached(<MultilingualStringView id="test"
                                                                          value={value} {...intlFunctions()}/>);
            const toggle = wrapper.find(".m-translations-toggle").first();
            toggle.simulate("mouseenter");
            expect(wrapper.exists(PopoverBody)).toBeTruthy();
            toggle.simulate("mouseleave");
            expect(wrapper.exists(PopoverBody)).toBeFalsy();
        });

        it("renders pinned on click on translations icon", async () => {
            const wrapper = mountWithIntlAttached(<MultilingualStringView id="test"
                                                                          value={value} {...intlFunctions()}/>);

            const toggle = wrapper.find(".m-translations-toggle").first();
            toggle.simulate("click");

            expect(wrapper.exists(PopoverBody)).toBeTruthy();
            toggle.simulate("mouseleave");

            expect(wrapper.exists(PopoverBody)).toBeTruthy();
        });
    });

    it("renders translation based on current locale", () => {
        const wrapper = mountWithIntlAttached(<MultilingualStringView id="test"
                                                                      value={value} {...intlFunctions()}/>);
        expect(wrapper.text()).toContain(getLocalized(value, intlFunctions().locale));
    });

    it("renders translation based on specified language", () => {
        const wrapper = mountWithIntlAttached(<MultilingualStringView id="test"
                                                                      value={value} language="cs" {...intlFunctions()}/>);
        expect(wrapper.text()).toContain(value.cs);
    });

    it("renders default translation when target language translation does not exist", () => {
        const wrapper = mountWithIntlAttached(<MultilingualStringView id="test" language={"es"}
                                                                      value={value} {...intlFunctions()}/>);
        expect(wrapper.text()).toContain(getLocalized(value, Constants.DEFAULT_LANGUAGE));
    });
});
