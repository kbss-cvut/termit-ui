import { Route } from "../Routes";

export class Routing {
  public static getTransitionPath = vi
    .fn()
    .mockImplementation((route: Route) => route.path);
}

class RoutingMock {
  public reload = vi.fn();

  public saveOriginalTarget = vi.fn();

  public transitionTo = vi.fn();

  public transitionToHome = vi.fn();

  public transitionToOriginalTarget = vi.fn();

  public transitionToAsset = vi.fn();

  public transitionToPublicAsset = vi.fn();
}

const INSTANCE = new RoutingMock();

export default INSTANCE;
