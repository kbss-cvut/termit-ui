import * as React from "react";
import {Route, RouteComponentProps, RouteProps} from "react-router-dom";
import {Breadcrumb} from "react-breadcrumbs";
import TermItState from "../../model/TermItState";
import {connect} from "react-redux";
import Asset from "../../model/Asset";
import {useI18n} from "../hook/useI18n";

interface DynamicBreadcrumbRouteOwnProps extends RouteProps {
    component: React.ComponentType<any>;
    includeSearch?: boolean;
    asset: string;
}

interface DynamicBreadcrumbRouteStoreProps {
    state: TermItState;
}

declare type DynamicBreadcrumbRouteProps = DynamicBreadcrumbRouteOwnProps & DynamicBreadcrumbRouteStoreProps;

// This route should extract breadcrumb label from store data, e.g., vocabulary label from currently open vocabulary
const DynamicBreadcrumbRoute = (props: DynamicBreadcrumbRouteProps) => {
    const {component, includeSearch, ...rest} = {...props};
    const Component = component;    // lowercase first character does not pass through JSX validation
    const {locale} = useI18n();
    const renderRoute = (routeProps: RouteComponentProps<any>) => <Breadcrumb data={{
        title: props.state[props.asset] ? (props.state[props.asset] as Asset).getLabel(locale) : "",
        pathname: routeProps.match.url,
        search: includeSearch ? routeProps.location.search : undefined
    }}>
        <Component {...routeProps}/>
    </Breadcrumb>;

    return <Route {...rest} render={renderRoute}/>;
};

export default connect<DynamicBreadcrumbRouteStoreProps, undefined, DynamicBreadcrumbRouteOwnProps, TermItState>((state: TermItState) => {
    return {state};
})(DynamicBreadcrumbRoute);
