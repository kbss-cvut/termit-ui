import * as React from "react";
import Generator from "../../../__tests__/environment/Generator";
import {Header} from "../Header";
import {flushPromises, mountWithIntl} from "../../../__tests__/environment/Environment";
import {act} from "react-dom/test-utils";
import {MemoryRouter} from "react-router-dom";
import keycloak from "../../../util/Keycloak";
import {ReactKeycloakProvider} from "@react-keycloak/web";

jest.mock("../../../util/Keycloak", () => ({
    init: jest.fn().mockResolvedValue({}),
    authServerUrl: "http://localhost:8080/",
    realm: "test",
    clientId: "client"
}));

describe("Header", () => {
    it("renders navbar on >= 768px", async () => {
        const wrapper = mountWithIntl(<ReactKeycloakProvider authClient={keycloak}>
            <MemoryRouter>
                <Header user={Generator.generateUser()} desktopView={true} showBreadcrumbs={false}/>
            </MemoryRouter>
        </ReactKeycloakProvider>);
        await act(async () => {
            await flushPromises();
        });
        expect(wrapper.exists("#navbar")).toBeTruthy();
    });

    it("does not render navbar on > 768px", async () => {
        const wrapper = mountWithIntl(<ReactKeycloakProvider authClient={keycloak}>
            <MemoryRouter>
                <Header user={Generator.generateUser()} desktopView={false} showBreadcrumbs={false}/>
            </MemoryRouter>
        </ReactKeycloakProvider>);
        await act(async () => {
            await flushPromises();
        });
        expect(wrapper.exists("#navbar")).toBeFalsy();
    });
});
