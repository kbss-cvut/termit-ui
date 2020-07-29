import * as React from "react";
import {FullscreenButton} from "../FullscreenButton";
import {mountWithIntl} from "../../../__tests__/environment/Environment";
import {GoScreenFull, GoScreenNormal} from "react-icons/go";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";

describe("Button Fullscreen", () => {
    it("button in fullscreen", () => {
        const toggleFullScreen = jest.fn();
        const wrapper = mountWithIntl(<FullscreenButton
            toggleFullscreen={toggleFullScreen}
            isFullscreen={true}
            {...intlFunctions()}
        />);
        expect(wrapper.find(GoScreenNormal).exists()).toBeTruthy();
    });
    it("button in window", () => {
        const toggleFullScreen = jest.fn();
        const wrapper = mountWithIntl(<FullscreenButton
            toggleFullscreen={toggleFullScreen}
            isFullscreen={false}
            {...intlFunctions()}
        />);
        expect(wrapper.find(GoScreenFull).exists()).toBeTruthy();
    });
});