import {Route} from "../Routes";

export class Routing {
    public static getTransitionPath = jest.fn().mockImplementation((route: Route) => route.path);
}

class RoutingMock {
    public saveOriginalTarget = jest.fn();

    public transitionTo = jest.fn();

    public transitionToHome = jest.fn();

    public transitionToOriginalTarget = jest.fn();

    public transitionToAsset = jest.fn();

    public transitionToPublicAsset = jest.fn();
}

const INSTANCE = new RoutingMock();

export default INSTANCE;
