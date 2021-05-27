import { Route } from "../Routes";

export class Routing {
    public static getTransitionPath = jest
        .fn()
        .mockImplementation((route: Route) => route.path);

    public static buildFullUrl = jest.fn(
        (route: Route) => "http://localhost:3000/#/" + route.path
    );
}

class RoutingMock {
  public reload = jest.fn();

  public saveOriginalTarget = jest.fn();

  public transitionTo = jest.fn();

  public transitionToHome = jest.fn();

  public transitionToOriginalTarget = jest.fn();

  public transitionToAsset = jest.fn();

  public transitionToPublicAsset = jest.fn();
}

const INSTANCE = new RoutingMock();

export default INSTANCE;
