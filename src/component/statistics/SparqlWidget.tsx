import * as React from "react";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {executeQuery} from "../../action/AsyncActions";
import * as _ from "lodash";
import {ThunkDispatch} from "../../util/Types";
import {InjectsLoading} from "../hoc/withInjectableLoading";

export interface PublicProps extends OutputProps, InputProps, InjectsLoading {
}

interface OutputProps {
    queryResults: any,
}

interface InputProps {
    sparqlQuery: string
}

interface InternalActions {
    executeQuery: (queryString: string) => Promise<any>;
}

export default function SparqlWidget<P extends PublicProps>(Component: React.ComponentType<OutputProps & P>): React.ComponentClass<Pick<P, Exclude<keyof P, keyof (OutputProps & InternalActions)>>> {

    class Wrapper extends React.Component<PublicProps & InternalActions & P> {

        public componentDidMount() {
            this.change();
        }

        public componentDidUpdate(prevProps: PublicProps & InternalActions & P) {
            if (!_.isEqual(this.props.queryResults[this.props.sparqlQuery]
                , prevProps.queryResults[this.props.sparqlQuery]
            )) {
                this.change();
            }
        }

        private change() {
            this.props.loadingOn();
            this.props.executeQuery(this.props.sparqlQuery).then(() => this.props.loadingOff());
        }

        public render() {
            return <Component {...this.props} queryResults={this.props.queryResults[this.props.sparqlQuery]}/>;
        }
    }

    // @ts-ignore
    return connect((state: TermItState) => {
        return {
            queryResults: state.queryResults
        };
    }, (dispatch: ThunkDispatch): InternalActions => {
        return {
            executeQuery: (queryString: string) => dispatch(executeQuery(queryString))
        };
        // @ts-ignore
    })(Wrapper);
}
