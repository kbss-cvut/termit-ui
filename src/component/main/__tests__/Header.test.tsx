import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import {Header} from "../Header";
import {flushPromises, mountWithIntl} from "../../../__tests__/environment/Environment";
import {act} from "react-dom/test-utils";
import {MemoryRouter} from "react-router-dom";

describe("Header", () => {
    it("renders navbar on >= 768px", async () => {
        const wrapper = mountWithIntl(<MemoryRouter><Header user={Generator.generateUser()} desktopView={true}
                                                            showBreadcrumbs={false}/></MemoryRouter>);
        await act(async () => {
            await flushPromises();
        });
        expect(wrapper.exists("#navbar")).toBeTruthy();
    });

    it("does not render navbar on > 768px", async () => {
        const wrapper = mountWithIntl(<MemoryRouter><Header user={Generator.generateUser()} desktopView={false}
                                                            showBreadcrumbs={false}/></MemoryRouter>);
        await act(async () => {
            await flushPromises();
        });
        expect(wrapper.exists("#navbar")).toBeFalsy();
    });
});
