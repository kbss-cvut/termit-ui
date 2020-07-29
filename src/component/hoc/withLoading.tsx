import * as React from "react";
import Mask from "../misc/Mask";
import getDisplayName from "../../util/getDisplayName";
import classNames from "classnames";

export interface WithLoadingProps {
    loading: boolean,
    loadingMsg?: string
}

export interface WithLoadingStaticOptions {
    tag?: string,
    maskClass?: string,
    containerClass?: string
}

/**
 * Generic loading mask displaying HOC, which can be used to wrap arbitrary components expected to receive loading
 * property.
 * @param Component The component to wrap
 * @param options Configuration for the generated wrapper
 * @constructor
 */
const withLoading = <P extends object>(Component: React.ComponentType<P>, options: WithLoadingStaticOptions = {tag: "div"}): React.SFC<P & WithLoadingProps> => {
    const Wrapped: React.SFC<P & WithLoadingProps> = ({loading, loadingMsg, ...props}: P & WithLoadingProps) => {
        const tag = options.tag ? options.tag : "div";
        const className = classNames(options.containerClass, "relative");

        return React.createElement(tag, {className},
            loading && <Mask text={loadingMsg} classes={options.maskClass}/>,
            <Component {...props as P}/>
        );
    };
    Wrapped.displayName = "LoadingWrapper(" + getDisplayName(Component) + ")";
    return Wrapped;
};

export default withLoading;