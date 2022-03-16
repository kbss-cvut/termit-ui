import * as React from "react";
import { Route, RouteComponentProps, RouteProps } from "react-router-dom";
import { Breadcrumb } from "react-breadcrumbs";
import TermItState from "../../model/TermItState";
import { useSelector } from "react-redux";
import Asset from "../../model/Asset";
import { useI18n } from "../hook/useI18n";

interface DynamicBreadcrumbRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  includeSearch?: boolean;
  asset: string;
}

// This route should extract breadcrumb label from store data, e.g., vocabulary label from currently open vocabulary
const DynamicBreadcrumbRoute = (props: DynamicBreadcrumbRouteProps) => {
  const { component, includeSearch, ...rest } = { ...props };
  const Component = component; // lowercase first character does not pass through JSX validation
  const { locale } = useI18n();
  const asset = useSelector((state: TermItState) => state[props.asset]);
  const renderRoute = (routeProps: RouteComponentProps<any>) => (
    <Breadcrumb
      data={{
        title: asset ? (asset as Asset).getLabel(locale) : "",
        pathname: routeProps.match.url,
        search: includeSearch ? routeProps.location.search : undefined,
      }}
    >
      <Component {...routeProps} />
    </Breadcrumb>
  );

  return <Route {...rest} render={renderRoute} />;
};

export default DynamicBreadcrumbRoute;
