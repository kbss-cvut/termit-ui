import * as React from "react";
import { Route as BaseRoute } from "react-router";

type ExtraProps = {
  asset: string;
  includeSearch?: boolean;
};
type RouteType = React.ComponentType<
  React.ComponentProps<typeof BaseRoute> & ExtraProps
>;
const Route = BaseRoute as RouteType;

export default Route;
