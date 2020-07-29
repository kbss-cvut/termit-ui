import * as React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {getLabel} from "../../action/AsyncActions";
import Namespaces from "../../util/Namespaces";

interface AssetLabelProps {
    iri: string;
    shrinkFullIri?: boolean;
    getLabel: (iri: string) => Promise<string>;
}

interface AssetLabelState {
    label?: string;
}

/**
 * Retrieves and renders label (RDFS:label) of an assert with the specified IRI.
 *
 * If the label cannot be retrieved, the IRI is returned instead.
 *
 * Note that the value is returned directly, not wrapped in any component, so the parent component should provide a
 * suitable container (span, div, etc.).
 */
export class AssetLabel extends React.Component<AssetLabelProps, AssetLabelState> {
    public static defaultProps: Partial<AssetLabelProps> = {
        shrinkFullIri: false
    };

    constructor(props: AssetLabelProps) {
        super(props);
        this.state = {
            label: undefined
        };
    }

    public componentDidMount() {
        this.loadLabel(this.props.iri);
    }

    public componentDidUpdate(prevProps: AssetLabelProps): void {
        if (prevProps.iri !== this.props.iri) {
            this.loadLabel(this.props.iri);
        }
    }

    private loadLabel(iri: string) {
        this.props.getLabel(iri).then((data: string) => this.setState({label: data}));
    }

    public render() {
        return this.state.label ? this.state.label : this.shrinkFullIri(Namespaces.getPrefixedOrDefault(this.props.iri));
    }

    private shrinkFullIri(iri: string): string {
        if (!this.props.shrinkFullIri || iri.indexOf("://") === -1) {
            return iri; // It is prefixed
        }
        const lastSlashIndex = iri.lastIndexOf("/");
        const lastHashIndex = iri.lastIndexOf(("#"));
        return "..." + iri.substring(lastHashIndex > lastSlashIndex ? lastHashIndex : lastSlashIndex);
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        getLabel: (iri: string) => dispatch(getLabel(iri))
    };
})(AssetLabel);
