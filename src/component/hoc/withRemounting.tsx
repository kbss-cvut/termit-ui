import * as React from "react";

/**
 * This component only remounts the wrapped component each time the props change.
 * Use-case - Angular component embedded in React.
 */
export default function withRemounting<P>(Component: React.ComponentType<P>,
                                          runScriptBeforeUpdate = ( props : P ) => { ; }): React.ComponentClass<P> {

    return class extends React.Component<P, { component: JSX.Element | null }> {
        constructor(props:P) {
            super(props);
            this.state = {
                component: null
            };
        }

        public componentDidMount() {
            this.change(true);
        }

        public componentDidUpdate(prevProps: P) {
            this.change(prevProps !== this.props);
        }

        private change(changed: boolean) {
            if (runScriptBeforeUpdate) {
                runScriptBeforeUpdate(this.props);
            }
            if (changed) {
                this.setState({
                    component: null
                });
            } else if (this.state.component == null) {
                this.setState({
                    component : <Component {...this.props}/>
                });
            }
        }

        public render() {
            return this.state.component;
        }
    }
}