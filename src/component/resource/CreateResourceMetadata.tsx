import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Resource, {ResourceData} from "../../model/Resource";
import {AbstractCreateAsset, AbstractCreateAssetState} from "../asset/AbstractCreateAsset";
import VocabularyUtils from "../../util/VocabularyUtils";
import {Button, ButtonToolbar, Col, Form, Row} from "reactstrap";
import CustomInput from "../misc/CustomInput";
import TextArea from "../misc/TextArea";
import {ContextFreeAssetType} from "../../model/ContextFreeAssetType";
import ShowAdvanceAssetFields from "../asset/ShowAdvancedAssetFields";

export interface CreateResourceMetadataProps extends HasI18n {
    onCreate: (resource: Resource, data?: any) => Promise<string>;
    onCancel: () => void;
}

export interface CreateResourceMetadataState extends AbstractCreateAssetState, ResourceData {
    description: string;
    types: string;
}

export class CreateResourceMetadata<P extends CreateResourceMetadataProps = CreateResourceMetadataProps, S extends CreateResourceMetadataState = CreateResourceMetadataState>
    extends AbstractCreateAsset<P, S> {

    constructor(props: P) {
        super(props);
        this.state = {
            iri: "",
            label: "",
            description: "",
            types: VocabularyUtils.RESOURCE,
            generateIri: true
        } as S;
    }

    protected get assetType(): ContextFreeAssetType {
        return "RESOURCE";
    }

    private onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({description: e.currentTarget.value});
    };

    public onCreate = (): void => {
        const {generateIri, ...data} = this.state;
        this.props.onCreate(new Resource(data));
    };

    public render() {
        return <Form>
            {this.renderBasicMetadataInputs()}
            {this.renderSubmitButtons()}
        </Form>;
    }

    protected renderBasicMetadataInputs() {
        const i18n = this.props.i18n;
        return <>
            <Row>
                <Col xs={12}>
                    <CustomInput name="create-resource-label" label={i18n("asset.label")}
                                 value={this.state.label}
                                 onChange={this.onLabelChange}/>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <TextArea name="create-resource-description" label={i18n("resource.metadata.description")}
                              type="textarea" rows={3} value={this.state.description} help={i18n("optional")}
                              onChange={this.onDescriptionChange}/>
                </Col>
            </Row>
            <ShowAdvanceAssetFields>
                <Row>
                    <Col xs={12}>
                        <CustomInput name="create-resource-iri" label={i18n("asset.iri")}
                                     value={this.state.iri}
                                     onChange={this.onIriChange} help={i18n("asset.create.iri.help")}/>
                    </Col>
                </Row>
            </ShowAdvanceAssetFields>
        </>;
    }

    protected renderSubmitButtons() {
        const i18n = this.props.i18n;
        return <Row>
            <Col xs={12}>
                <ButtonToolbar className="d-flex justify-content-center mt-4">
                    <Button id="create-resource-submit" onClick={this.onCreate} color="success" size="sm"
                            disabled={this.state.label.trim().length === 0}>{i18n("create")}</Button>
                    <Button id="create-resource-cancel" onClick={this.props.onCancel}
                            color="outline-dark" size="sm">{i18n("cancel")}</Button>
                </ButtonToolbar>
            </Col>
        </Row>;
    }
}

export default injectIntl(withI18n(CreateResourceMetadata));
