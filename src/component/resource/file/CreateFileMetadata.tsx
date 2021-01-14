import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {Button, ButtonToolbar, Col, Form, Row} from "reactstrap";
import UploadFile from "./UploadFile";
import TermItFile from "../../../model/File";
import Resource from "../../../model/Resource";
import CustomInput from "../../misc/CustomInput";
import ShowAdvanceAssetFields from "../../asset/ShowAdvancedAssetFields";
import {AbstractCreateAssetState} from "../../asset/AbstractCreateAsset";
import {AssetData} from "../../../model/Asset";

interface CreateFileMetadataProps extends HasI18n {
    onCreate: (termItFile : Resource, file: File) => any;
    onCancel: () => void;
}

interface CreateFileMetadataState extends AbstractCreateAssetState, AssetData {
    iri: string;
    label: string;
    generateIri: boolean;
    file?: File;
    dragActive: boolean;
}

export class CreateFileMetadata extends React.Component<CreateFileMetadataProps, CreateFileMetadataState> {

    constructor(props: CreateFileMetadataProps) {
        super(props);
        this.state = {
            iri: "",
            label: "",
            generateIri: true,
            file: undefined,
            dragActive: false
        }
    }

    protected onLabelChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const label = e.currentTarget.value;
        this.setState({label});
    };

    protected onIriChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({iri: (e.currentTarget.value as string), generateIri: false});
    };

    public onCreate = () => {
        const {generateIri, file, dragActive, ...data} = this.state;
        if ( file ) {
            this.props.onCreate(new TermItFile(data), file);
        }
    };

    public setFile = (file: File) => {
        this.setState({file, label: file.name, dragActive: false});
    }

    public render() {
        const i18n = this.props.i18n;

        return <Form>
            <UploadFile setFile={this.setFile}/>
            <Row>
                <Col xs={12}>
                    <CustomInput name="create-resource-label" label={i18n("asset.label")}
                                 value={this.state.label}
                                 onChange={this.onLabelChange}/>
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
            <Row>
                <Col xs={12}>
                    <ButtonToolbar className="d-flex justify-content-center mt-4">
                        <Button id="create-resource-submit" onClick={this.onCreate} color="success" size="sm"
                                disabled={this.state.label.trim().length === 0}>{i18n("create")}</Button>
                        <Button id="create-resource-cancel" onClick={this.props.onCancel}
                                color="outline-dark" size="sm">{i18n("cancel")}</Button>
                    </ButtonToolbar>
                </Col>
            </Row>
        </Form>;
    }
}

export default injectIntl(withI18n(CreateFileMetadata));
