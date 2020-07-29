import * as React from "react";
import getDisplayName from "../../util/getDisplayName";
import ContainerMask from "../misc/ContainerMask";

/**
 * Interface declaring properties of components wrapped in the {@code withInjectableLoading} HOC.
 */
export interface InjectsLoading {
    /**
     * Turns the loading on.
     * @param message Optional message to display. Without it, a generic "Please wait" message is shown
     */
    loadingOn: (message?: string) => void;
    /**
     * Turns the loading off.
     */
    loadingOff: () => void;
    /**
     * Renders the container-based mask element.
     */
    renderMask: () => JSX.Element | null;
    /**
     * Indicates whether loading is turned on or off.
     */
    loading: boolean;
}

interface WithInjectableLoadingStaticOptions {
    maskClass?: string;
}

interface WithInjectableLoadingState {
    loading: boolean;
    message?: string;
}

/**
 * HOC allowing to inject container-based loading Mask.
 *
 * Provides methods for enabling and disabling loading and injecting the loading mask into the child container. This
 * allows much more control over the loading mask and is suitable for loading masks specific to certain components in
 * the view. Note that to ensure correct positioning of the mask, a parent component of the mask needs to have position
 * "relative". This way, the mask will spread the whole area of this container component.
 *
 * @param Component The component to wrap
 * @param options Configuration for the generated wrapper. Allows to specify a custom CSS class for the mask
 * @constructor
 */
const withInjectableLoading = <P extends InjectsLoading>(Component: React.ComponentType<P>, options: WithInjectableLoadingStaticOptions = {}): React.ComponentClass<Pick<P, Exclude<keyof P, keyof InjectsLoading>>> => {
    class Wrapped extends React.Component<P & InjectsLoading, WithInjectableLoadingState> {
        public static readonly displayName = "LoadingInjectingWrapper(" + getDisplayName(Component) + ")";

        constructor(props: P & InjectsLoading) {
            super(props);
            this.state = {loading: false};
        }

        public loadingOn = (message?: string) => {
            this.setState({loading: true, message});
        };

        public loadingOff = () => {
            this.setState({loading: false, message: undefined});
        };

        public renderMask = () => {
            return this.state.loading ? <ContainerMask text={this.state.message} classes={options.maskClass}/> : null;
        };

        public render() {
            const props = Object.assign({}, this.props, {
                loadingOn: this.loadingOn,
                loadingOff: this.loadingOff,
                renderMask: this.renderMask,
                loading: this.state.loading
            });
            return <Component {...props}/>;
        }

    }

    return Wrapped as any;
};

export default withInjectableLoading;
