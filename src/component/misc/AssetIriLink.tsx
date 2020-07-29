import * as React from "react";
import {Link} from "react-router-dom";
import OutgoingLink from "./OutgoingLink";
import AssetLabel from "./AssetLabel";

interface AssetIriLinkProps {
    assetIri: string;
    path: string;
    tooltip?: string;
    id?: string;
}

interface AssetIriLinkState {
    showLink: boolean;
}

/**
 * Asset link for situations where only asset IRI is known.
 *
 * The label for the link is retrieved by the component.
 */
export default class AssetIriLink extends React.Component<AssetIriLinkProps, AssetIriLinkState> {

    constructor(props: AssetIriLinkProps) {
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

        return <span
            onMouseOut={setInvisible}
            onMouseOver={setVisible}>
            <OutgoingLink label={<Link id={this.props.id}
                                       title={this.props.tooltip ? this.props.tooltip : undefined}
                                       to={props.path}><AssetLabel iri={props.assetIri}/></Link>}
                          iri={props.assetIri}
                          showLink={this.state.showLink}
                          className="m-asset-link"/>
        </span>
    }
}
