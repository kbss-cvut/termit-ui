import * as React from "react";
import Ajax, {params} from "../../util/Ajax";

export interface AbstractCreateAssetState {
    iri: string;
    label: string;
    generateIri: boolean;
}

/**
 * Abstract asset creation component class.
 *
 * It handles automatic generation of identifier and label setting.
 */
export abstract class AbstractCreateAsset<P, S extends AbstractCreateAssetState> extends React.Component<P, S> {

    protected constructor(props: P) {
        super(props);
    }

    /**
     * Defines URL of the endpoint used for identifier generation
     */
    protected abstract get identifierGenerationEndpoint(): string;

    protected onLabelChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const label = e.currentTarget.value;
        this.setState({label});
        this.generateIri(label);
    };

    protected generateIri = (label: string): void => {
        if (!this.state.generateIri || label.length === 0) {
            return;
        }
        Ajax.get(this.identifierGenerationEndpoint, params({name: label})).then(iri => this.setState({iri}));
    };

    protected onIriChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({iri: (e.currentTarget.value as string), generateIri: false});
    };
}
