import * as React from "react";
import {Link} from "react-router-dom";
import OutgoingLink from "./OutgoingLink";

interface AssetType {
    iri: string;
    label: React.ReactNode | string;
}

interface AssetLinkProps<T extends AssetType> {
    asset: T;
    path: string;
    tooltip?: string;
    id?: string;
}

interface AssetLinkState {
    showLink: boolean;
}

export default class AssetLink<T extends AssetType> extends React.Component<AssetLinkProps<T>, AssetLinkState> {
    constructor(props: AssetLinkProps<T>) {
        super(props);
        this.state = {showLink: false};
    }

    private setVisible() {
        this.setState({showLink: true});
    }

    private setInvisible() {
        this.setState({showLink: false});
    }

    public render() {
        const props = this.props;
        const setInvisible = this.setInvisible.bind(this);
        const setVisible = this.setVisible.bind(this);

        return (
            <span onMouseOut={setInvisible} onMouseOver={setVisible}>
                <OutgoingLink
                    label={
                        <Link
                            id={this.props.id}
                            title={this.props.tooltip ? this.props.tooltip : undefined}
                            to={props.path}
                        >
                            {props.asset.label}
                        </Link>
                    }
                    iri={props.asset.iri}
                    showLink={this.state.showLink}
                    className="m-asset-link"
                />
            </span>
        );
    }
}
